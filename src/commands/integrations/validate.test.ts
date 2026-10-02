import { mkdir, mkdtemp, readdir, rm, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, expect, it, vi } from "vitest";
import { withWorkingDirectory } from "../../command-context.js";
import { runCommand } from "../../test-command.js";
import { loadCodeNativeIntegrationEntryPoint } from "../../utils/integration/import.js";
import ValidateCommand from "./validate.js";

const require = createRequire(import.meta.url);
const spectralPath = require.resolve("@prismatic-io/spectral");
const yamlPath = require.resolve("js-yaml");
const roots: string[] = [];
const remote = vi.hoisted(() =>
  vi.fn(() => {
    throw new Error("Unexpected platform call");
  }),
);
vi.mock(import("../../graphql.js"), async (original) => ({
  ...(await original()),
  gqlRequest: remote,
}));
afterEach(async () => {
  expect(remote).not.toHaveBeenCalled();
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

async function project(mutation = "", useDist = true, customTrigger = false) {
  const root = await mkdtemp(join(tmpdir(), "prism-validate-cni-"));
  roots.push(root);
  await writeFile(join(root, "package.json"), JSON.stringify({ main: "unrelated.js" }));
  const directory = useDist ? join(root, "dist") : root;
  await mkdir(directory, { recursive: true });
  await writeFile(
    join(directory, "index.js"),
    `
const { integration, flow } = require(${JSON.stringify(spectralPath)});
const { load, dump } = require(${JSON.stringify(yamlPath)});
const component = integration({ name: "Validation control", description: "Validate registered flows", flows: [
  flow({ name: "Receive", stableKey: "receive", ${customTrigger ? "onTrigger: async (context, payload) => ({ payload })," : ""} onExecution: async () => { throw new Error("Validation must not execute flows"); } }),
  flow({ name: "Other", stableKey: "other", onExecution: async () => { throw new Error("Validation must not execute flows"); } }),
] });
const yaml = load(component.codeNativeIntegrationYAML);
${mutation}
component.codeNativeIntegrationYAML = dump(yaml);
module.exports.default = component;
`,
  );
  return { root, entrypoint: join(directory, "index.js") };
}

it.each([
  false,
  true,
])("validates SDK registration locally using the import entrypoint (custom trigger %s)", async (customTrigger) => {
  const { root, entrypoint } = await project("", true, customTrigger);
  const before = await readdir(root, { recursive: true });
  const result = await withWorkingDirectory(root, () => runCommand(ValidateCommand, []));
  expect(result).toEqual({
    valid: true,
    entrypoint,
    componentKey: expect.any(String),
    flowCount: 2,
  });
  expect(await readdir(root, { recursive: true })).toEqual(before);
});

it("uses root index.js ahead of dist and package.main", async () => {
  const { root, entrypoint } = await project("", false);
  await mkdir(join(root, "dist"));
  await writeFile(join(root, "dist/index.js"), "throw new Error('Wrong entrypoint');");
  const result = await withWorkingDirectory(root, () => runCommand(ValidateCommand, []));
  expect(result).toMatchObject({ valid: true, entrypoint });
});

it.each([
  ["non-CNI YAML", "yaml.isCodeNative = false"],
  ["empty flows", "yaml.flows = []"],
  ["empty key", "component.key = ''"],
  ["no trigger", "yaml.flows[0].steps = yaml.flows[0].steps.filter(s => !s.isTrigger)"],
  [
    "disconnected execution",
    "yaml.flows[0].steps.find(s => !s.isTrigger).action.component.key = 'unrelated'",
  ],
  [
    "missing action",
    "delete component.actions[yaml.flows[0].steps.find(s => !s.isTrigger).action.key]",
  ],
  [
    "noncallable action",
    "component.actions[yaml.flows[0].steps.find(s => !s.isTrigger).action.key].perform = null",
  ],
  [
    "missing trigger",
    "delete component.triggers[yaml.flows[0].steps.find(s => s.isTrigger).action.key]",
  ],
  ["invalid trigger reference", "yaml.flows[0].steps.find(s => s.isTrigger).action.key = ''"],
  ["invalid second flow", "yaml.flows[1].steps = []"],
])("rejects %s in both local validation and import loading", async (_, mutation) => {
  const { root } = await project(mutation, true, true);
  await expect(withWorkingDirectory(root, () => runCommand(ValidateCommand, []))).rejects.toThrow();
  await expect(withWorkingDirectory(root, loadCodeNativeIntegrationEntryPoint)).rejects.toThrow();
});

it("reports missing builds without publishing", async () => {
  const { root, entrypoint } = await project();
  await rm(entrypoint);
  await expect(withWorkingDirectory(root, () => runCommand(ValidateCommand, []))).rejects.toThrow(
    /entrypoint/,
  );
});
