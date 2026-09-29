import { graphql, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { TEST_PRISMATIC_URL } from "../../../../vitest.setup.js";
import { runCommand } from "../../../test-command.js";
import GetCommand from "./get.js";
import UpdateCommand from "./update.js";

const colors = [
  { type: "primary", value: "#111111", variant: "light" },
  { type: "primary", value: "#222222", variant: "embedded_light" },
  { type: "accent", value: "#333333", variant: "embedded_light" },
  { type: "primary", value: "#444444", variant: "embedded_dark" },
];
const properties = [
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
  variant: string;
}) => ({
  type: type.toUpperCase(),
  value,
  variant: variant.toUpperCase(),
});
let theme: { colors: typeof colors; properties: typeof properties; totalColors?: number } = {
  colors,
  properties,
};
const updates: Array<{ colors: unknown[]; properties: unknown[] }> = [];
const api = graphql.link(`${TEST_PRISMATIC_URL}/api`);
const server = setupServer(
  api.query("getTheme", () =>
    HttpResponse.json({
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
    }),
  ),
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

const update = (...argv: string[]) => runCommand(UpdateCommand, ["--agent", "--yes", ...argv]);

describe("organization:theme:get", () => {
  it("groups colors and properties by variant", async () => {
    await expect(runCommand(GetCommand, ["--agent"])).resolves.toEqual({
      variants: {
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

describe("organization:theme:update", () => {
  it("changes only the named entries and resends the rest of the theme", async () => {
    const result = await update(
      "--variant",
      "embedded-light",
      "--color",
      "primary=#4f46e5",
      "--color",
      "link-color=rgb(67, 56, 202)",
      "--borderRadius",
      "8",
    );
    expect(updates).toHaveLength(1);
    expect(updates[0].colors).toEqual([
      { type: "primary", value: "#111111", variant: "light" },
      { type: "accent", value: "#333333", variant: "embedded_light" },
      { type: "primary", value: "#444444", variant: "embedded_dark" },
      { type: "primary", value: "#4f46e5", variant: "embedded_light" },
      { type: "link_color", value: "rgb(67, 56, 202)", variant: "embedded_light" },
    ]);
    expect(updates[0].properties).toEqual([
      { type: "border_radius", value: "4", variant: "light" },
      { type: "border_radius", value: "8", variant: "embedded_light" },
    ]);
    expect(result).toEqual({
      variant: "embedded-light",
      changed: ["primary", "link_color", "border_radius"],
      colors: { accent: "#333333", primary: "#4f46e5", link_color: "rgb(67, 56, 202)" },
      properties: { border_radius: "8" },
    });
  });

  it("returns a removed color to the default without touching other variants", async () => {
    await update("--variant", "embedded-light", "--removeColor", "accent");
    expect(updates[0].colors).toEqual(colors.filter(({ type }) => type !== "accent"));
  });

  it.each([
    [["--color", "brand=#4f46e5"], /Unknown theme color "brand"/],
    [["--color", "primary=indigo"], /must be a hex value/],
    [["--color", "primary"], /Expected --color type=value/],
    [[], /Name at least one/],
  ])("rejects %j before reading or writing the theme", async (argv, message) => {
    await expect(update("--variant", "embedded-light", ...argv)).rejects.toThrow(message);
    expect(updates).toHaveLength(0);
  });

  it("refuses to write when the theme could not be read in full", async () => {
    theme = { colors, properties, totalColors: colors.length + 1 };
    await expect(
      update("--variant", "embedded-light", "--color", "primary=#4f46e5"),
    ).rejects.toThrow(/cannot be read in full/);
    expect(updates).toHaveLength(0);
  });

  it("reports errors the API returns, such as a plan without custom themes", async () => {
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
    await expect(
      update("--variant", "embedded-light", "--color", "primary=#4f46e5"),
    ).rejects.toThrow(/Custom Theme is not allowed/);
  });

  it("requires approval in agent mode", async () => {
    await expect(
      runCommand(UpdateCommand, [
        "--agent",
        "--variant",
        "embedded-light",
        "--color",
        "primary=#4f46e5",
      ]),
    ).rejects.toMatchObject({ code: "CONFIRMATION_REQUIRED" });
    expect(updates).toHaveLength(0);
  });
});
