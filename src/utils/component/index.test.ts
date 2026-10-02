import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, expect, it } from "vitest";
import { withWorkingDirectory } from "../../command-context.js";
import { type ComponentDefinition, validateDefinition } from "./index.js";

const directories: string[] = [];
afterEach(async () => {
  await Promise.all(
    directories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })),
  );
});

async function validate(connection: { iconPath?: string; avatarIconPath?: string }) {
  const directory = await mkdtemp(join(tmpdir(), "prism-connection-icons-"));
  directories.push(directory);
  await writeFile(join(directory, "present.png"), "test icon");
  await writeFile(join(directory, "present.svg"), "test icon");
  const definition = {
    key: "icon-control",
    display: { label: "Icon control", description: "Connection icon validation" },
    actions: {},
    connections: [{ key: "connection", label: "Connection", inputs: [], ...connection }],
  } as ComponentDefinition;
  return withWorkingDirectory(directory, () => validateDefinition(definition));
}

it.each(["iconPath", "avatarIconPath"] as const)("rejects missing %s", async (field) => {
  await expect(validate({ [field]: "missing.png" })).rejects.toThrow(/connection icons/);
});

it.each([
  "iconPath",
  "avatarIconPath",
] as const)("rejects an existing non-PNG %s", async (field) => {
  await expect(validate({ [field]: "present.svg" })).rejects.toThrow(/connection icons/);
});

it("accepts existing connection icons resolved against the package directory", async () => {
  await expect(
    validate({ iconPath: "present.png", avatarIconPath: "present.png" }),
  ).resolves.toBeUndefined();
});

it("accepts connections without optional icons", async () => {
  await expect(validate({})).resolves.toBeUndefined();
});
