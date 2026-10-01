import { graphql, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { TEST_PRISMATIC_URL } from "../../../../vitest.setup.js";
import { runCommand } from "../../../test-command.js";
import { themeCommands } from "./commands.js";
import GetCommand from "./get.js";

const connectionMaxLimit = 100;
const colors = [
  { type: "primary", value: "#111111", variant: "light" },
  { type: "primary", value: "#222222", variant: "embedded_light" },
  { type: "accent", value: "#333333", variant: "embedded_light" },
  { type: "primary", value: "#444444", variant: "embedded_dark" },
];
const properties = [
  { type: "disable_elevation", value: "true", variant: null },
  { type: "border_radius", value: "4", variant: "light" },
  { type: "border_radius", value: "6", variant: "embedded_light" },
];
// The API serializes types and variants as GraphQL enum names.
const asApiEnums = ({
  type,
  value,
  variant,
}: {
  type: string;
  value: string;
  variant: string | null;
}) => ({
  type: type.toUpperCase(),
  value,
  variant: variant?.toUpperCase() ?? null,
});
let theme: { colors: typeof colors; properties: typeof properties; totalColors?: number } = {
  colors,
  properties,
};
const updates: Array<{ colors: unknown[]; properties: unknown[] }> = [];
const api = graphql.link(`${TEST_PRISMATIC_URL}/api`);
const server = setupServer(
  api.query("getTheme", ({ query }) => {
    // The API rejects connection pages above RELAY_CONNECTION_MAX_LIMIT.
    const pageSizes = [...query.matchAll(/first:\s*(\d+)/g)].map(([, size]) => Number(size));
    if (pageSizes.some((size) => size > connectionMaxLimit))
      return HttpResponse.json({
        errors: [{ message: "exceeds the `first` limit of 100 records" }],
      });
    return HttpResponse.json({
      data: {
        theme: {
          colors: {
            totalCount: theme.totalColors ?? theme.colors.length,
            nodes: theme.colors.map(asApiEnums),
          },
          properties: {
            totalCount: theme.properties.length,
            nodes: theme.properties.map(asApiEnums),
          },
        },
      },
    });
  }),
  api.mutation("updateTheme", ({ variables }) => {
    updates.push(variables as (typeof updates)[number]);
    return HttpResponse.json({ data: { updateTheme: { theme: { id: "theme-1" }, errors: [] } } });
  }),
);

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => {
  theme = { colors, properties };
  updates.length = 0;
  server.resetHandlers();
});
afterAll(() => server.close());

const command = (name: string, ...argv: string[]) =>
  runCommand(themeCommands[`organization:theme:${name}`], ["--agent", "--yes", ...argv]);

describe("organization:theme:get", () => {
  it("groups colors and properties by variant", async () => {
    await expect(runCommand(GetCommand, ["--agent"])).resolves.toEqual({
      variants: {
        all: { colors: {}, properties: { disable_elevation: "true" } },
        light: { colors: { primary: "#111111" }, properties: { border_radius: "4" } },
        "embedded-light": {
          colors: { primary: "#222222", accent: "#333333" },
          properties: { border_radius: "6" },
        },
        "embedded-dark": { colors: { primary: "#444444" }, properties: {} },
      },
    });
  });

  it("shows one variant, empty when it has no custom values", async () => {
    await expect(runCommand(GetCommand, ["--agent", "--variant", "dark"])).resolves.toEqual({
      variants: { dark: { colors: {}, properties: {} } },
    });
  });
});

describe("theme actions", () => {
  it("sets a color and preserves every other entry, including unscoped properties", async () => {
    const result = await command("color:set", "primary", "#4f46e5", "--variant", "embedded-light");
    expect(updates[0].colors).toEqual([
      ...colors.filter((entry) => entry.variant !== "embedded_light" || entry.type !== "primary"),
      { type: "primary", value: "#4f46e5", variant: "embedded_light" },
    ]);
    expect(updates[0].properties).toEqual(
      properties.map(({ variant, ...entry }) => ({
        ...entry,
        ...(variant === null ? {} : { variant }),
      })),
    );
    expect(result).toMatchObject({ variant: "embedded-light", changed: ["primary"] });
  });

  it("resets a color only in the selected variant", async () => {
    await command("color:reset", "primary", "--variant", "embedded-light");
    expect(updates[0].colors).toEqual(
      colors.filter((entry) => entry.variant !== "embedded_light" || entry.type !== "primary"),
    );
  });

  it.each([0, 100])("sets border radius to %i", async (value) => {
    await command("border-radius:set", String(value), "--variant", "embedded-light");
    expect(updates[0].properties).toContainEqual({
      type: "border_radius",
      variant: "embedded_light",
      value: String(value),
    });
    expect(updates[0].colors).toEqual(colors);
  });

  it.each([
    ["elevation:enable", "false"],
    ["elevation:disable", "true"],
  ])("%s explicitly writes %s and preserves the unscoped property", async (name, value) => {
    await command(name, "--variant", "dark");
    expect(updates[0].properties).toContainEqual({
      type: "disable_elevation",
      value,
      variant: "dark",
    });
    expect(updates[0].properties).toContainEqual({ type: "disable_elevation", value: "true" });
  });

  it.each([
    "border-radius:reset",
    "elevation:reset",
  ])("%s preserves unrelated properties", async (name) => {
    await command(name, "--variant", "embedded-light");
    expect(updates[0].properties).toContainEqual({ type: "disable_elevation", value: "true" });
    expect(updates[0].properties).toContainEqual({
      type: "border_radius",
      value: "4",
      variant: "light",
    });
    if (name === "border-radius:reset")
      expect(updates[0].properties).not.toContainEqual({
        type: "border_radius",
        value: "6",
        variant: "embedded_light",
      });
  });

  it.each([
    ["color:set", ["primary", "indigo", "--variant", "light"]],
    ["color:set", ["brand", "#123", "--variant", "light"]],
    ["color:set", ["primary", "#123"]],
    ["border-radius:set", ["101", "--variant", "light"]],
    ["border-radius:set", ["1.5", "--variant", "light"]],
    ["elevation:enable", ["--variant", "all"]],
  ])("rejects invalid arguments to %s before writing", async (name, argv) => {
    await expect(command(name, ...argv)).rejects.toThrow();
    expect(updates).toHaveLength(0);
  });

  it("refuses to write a partially read theme", async () => {
    theme = { colors, properties, totalColors: colors.length + 1 };
    await expect(command("color:set", "primary", "#123", "--variant", "light")).rejects.toThrow(
      /cannot be read in full/,
    );
    expect(updates).toHaveLength(0);
  });

  it("reports API validation errors", async () => {
    server.use(
      api.mutation("updateTheme", () =>
        HttpResponse.json({
          data: {
            updateTheme: {
              theme: null,
              errors: [
                {
                  field: "__all__",
                  messages: ["A Custom Theme is not allowed for the current Plan."],
                },
              ],
            },
          },
        }),
      ),
    );
    await expect(command("color:set", "primary", "#123", "--variant", "light")).rejects.toThrow(
      /Custom Theme is not allowed/,
    );
  });

  it.each(Object.keys(themeCommands))("requires approval in agent mode for %s", async (name) => {
    const argv = name.endsWith("color:set")
      ? ["primary", "#123"]
      : name.endsWith("color:reset")
        ? ["primary"]
        : name.endsWith("border-radius:set")
          ? ["8"]
          : [];
    await expect(
      runCommand(themeCommands[name], ["--agent", ...argv, "--variant", "light"]),
    ).rejects.toMatchObject({ code: "CONFIRMATION_REQUIRED" });
    expect(updates).toHaveLength(0);
  });
});
