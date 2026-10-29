import { execFile } from "node:child_process";
import { mkdtemp, readdir, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { exists } from "../../../fs.js";
import { gqlRequest } from "../../../graphql.js";
import { runCommand } from "../../../test-command.js";
import { registeredManifestKeys } from "../../../utils/integration/componentRegistry.js";
import {
  generateFixtureManifest,
  linkSpectral,
} from "../../../utils/integration/manifests.fixture.js";
import { spawnProcess } from "../../../utils/process.js";
import Init from "../init/index.js";
import Add from "./add.js";
import Remove from "./remove.js";

vi.mock(import("../../../graphql.js"), async (original) => ({
  ...(await original()),
  gqlRequest: vi.fn(),
}));
vi.mock(import("../../../utils/process.js"), () => ({ spawnProcess: vi.fn() }));
const cwd = process.cwd();
let temp: string;
let root: string;
const read = (file: string) => readFile(path.join(root, file), "utf8");
const write = (file: string, text: string) => writeFile(path.join(root, file), text);
const add = (...keys: string[]) => runCommand(Add, ["--agent", "--yes", ...keys]);
const remove = (...keys: string[]) => runCommand(Remove, ["--agent", "--yes", ...keys]);

beforeEach(async () => {
  temp = await mkdtemp(path.join(tmpdir(), "prism-manifest-lifecycle-"));
  root = path.join(temp, "integration");
  process.chdir(temp);
  vi.mocked(gqlRequest).mockImplementation(
    async ({ variables }: any) =>
      ({
        components: {
          nodes: [
            {
              id: "id",
              key: variables.key,
              public: true,
              versionNumber: 1,
              versionSequenceId: null,
              versions: { nodes: [], pageInfo: { hasNextPage: false, endCursor: null } },
            },
          ],
        },
      }) as any,
  );
  vi.mocked(spawnProcess).mockImplementation(async ([_node, _generator, key]) => {
    await generateFixtureManifest(root, { key, public: true });
    return { stdout: "", stderr: "", exitCode: 0 };
  });
});
afterEach(async () => {
  process.chdir(cwd);
  await rm(temp, { recursive: true, force: true });
  vi.mocked(spawnProcess).mockReset();
  vi.mocked(gqlRequest).mockReset();
});
const init = async (...flags: string[]) => {
  await runCommand(Init, ["integration", "--agent", "--yes", ...flags]);
  await linkSpectral(root);
  process.chdir(root);
};

for (const toolchain of ["modern", "legacy"]) {
  for (const configuration of ["hosted", "headless"]) {
    for (const withScaffolding of [false, true]) {
      it(`adds and removes all scaffolding: ${toolchain}, ${configuration}, opt-in=${withScaffolding}`, async () => {
        await init(
          "--toolchain",
          toolchain,
          "--configuration-type",
          configuration,
          ...(withScaffolding ? ["--include-manifests"] : []),
        );
        await add("slack", "salesforce");
        expect(await registeredManifestKeys(root)).toEqual(new Set(["slack", "salesforce"]));
        expect(await read("src/index.ts")).toContain("componentRegistry,");
        expect(await read(".spectral/index.ts")).toContain(
          "IntegrationDefinitionComponentRegistry",
        );
        await add("slack");
        expect((await read("src/index.ts")).match(/import.*componentRegistry/g)).toHaveLength(1);
        expect(await remove("slack")).toMatchObject({ scaffoldingRemoved: false });
        expect(await registeredManifestKeys(root)).toEqual(new Set(["salesforce"]));
        expect(await remove("salesforce")).toMatchObject({ scaffoldingRemoved: true });
        expect(await exists(path.join(root, "src/componentRegistry.ts"))).toBe(false);
        expect(await exists(path.join(root, "src/manifests"))).toBe(false);
        expect(await read("src/index.ts")).not.toMatch(/componentRegistry/);
        expect((await read(".spectral/index.ts")).match(/@ts-ignore/g) ?? []).toHaveLength(
          configuration === "hosted" ? 3 : 0,
        );
        expect(await read(".spectral/index.ts")).not.toMatch(
          /componentRegistry|ComponentRegistry|ComponentManifest/,
        );
        expect(await read(".spectral/index.ts")).toContain(
          configuration === "hosted"
            ? "IntegrationDefinitionConfigPages"
            : "IntegrationDefinitionConfiguration",
        );
        // Re-enabling after cleanup remains supported.
        await add("slack");
        expect(await registeredManifestKeys(root)).toEqual(new Set(["slack"]));
      });
    }
  }
}

it("does not install scaffolding when generation fails", async () => {
  await init();
  const before = await read("src/index.ts");
  vi.mocked(spawnProcess).mockRejectedValueOnce(new Error("generator failed"));
  await expect(add("slack")).rejects.toThrow("generator failed");
  expect(await read("src/index.ts")).toBe(before);
  expect(await exists(path.join(root, "src/componentRegistry.ts"))).toBe(false);
});

it("preflights unsupported source before generating anything", async () => {
  await init();
  await write("src/index.ts", "export default {};\n");
  await expect(add("slack")).rejects.toThrow(/expected one integration/);
  expect(spawnProcess).not.toHaveBeenCalled();
  expect(await exists(path.join(root, "src/manifests"))).toBe(false);
});

it("supports --no-register on a manifest-free project and removing the unregistered files", async () => {
  await init();
  const before = await read("src/index.ts");
  await runCommand(Add, ["--agent", "--yes", "--no-register", "slack"]);
  expect(await exists(path.join(root, "src/componentRegistry.ts"))).toBe(false);
  await remove("slack");
  expect(await read("src/index.ts")).toBe(before);
  expect(await exists(path.join(root, "src/manifests"))).toBe(false);
});

it.each([
  'export const connection = { component: "slack", key: "oauth" };',
  "export const run = (context: any) => { const { components } = context; return components.slack; };",
  "export const run = (context: any) => { const components = context.components; return components.slack; };",
  'import slack from "./manifests/slack"; export { slack };',
  'export { default } from "./manifests/slack/index.js";',
  "export const run = (context: any) => context.components.slack.send({});",
  'export const run = (context: any) => context.components["slack"].send({});',
  "export const run = (context: any, key: string) => context.components[key].send({});",
])("refuses removal while usages remain: %s", async (source) => {
  await init();
  await add("slack", "salesforce");
  await write("src/usage.ts", source);
  const before = await read("src/componentRegistry.ts");
  await expect(remove("slack", "salesforce")).rejects.toThrow(/still|remain/);
  expect(await read("src/componentRegistry.ts")).toBe(before);
  expect(await readdir(path.join(root, "src/manifests"))).toEqual(["salesforce", "slack"]);
});

it("preserves npm imports and custom integration options on cleanup", async () => {
  await init();
  await add("slack");
  await write(
    "src/index.ts",
    (await read("src/index.ts"))
      .replace("import flows", 'import acme from "@example/acme";\nimport flows')
      .replace("  name:", '  labels: ["custom"],\n  name:'),
  );
  await remove("slack");
  expect(await read("src/index.ts")).toContain('import acme from "@example/acme"');
  expect(await read("src/index.ts")).toContain('labels: ["custom"]');
});

it("refuses final cleanup if the registry contains unrelated user code", async () => {
  await init();
  await add("slack");
  await write(
    "src/componentRegistry.ts",
    `${await read("src/componentRegistry.ts")}\nexport const important = 42;\n`,
  );
  await expect(remove("slack")).rejects.toThrow(/custom code/);
  expect(await exists(path.join(root, "src/manifests/slack/index.ts"))).toBe(true);
});

it("validates every requested removal before editing files", async () => {
  await init();
  await add("slack");
  await expect(remove("slack", "missing")).rejects.toThrow(/No installed manifest/);
  expect(await registeredManifestKeys(root)).toEqual(new Set(["slack"]));
});

it.each([
  "../outside",
  "slack/../../outside",
  ".",
  "..",
])("rejects unsafe manifest paths: %s", async (key) => {
  await init();
  await expect(remove(key)).rejects.toThrow(/Invalid manifest key/);
  await expect(add(key)).rejects.toThrow(/Invalid manifest key/);
  expect(spawnProcess).not.toHaveBeenCalled();
});

for (const configuration of ["hosted", "headless"]) {
  it(`typechecks before, during, and after manifest support: ${configuration}`, async () => {
    await init("--configuration-type", configuration, "--clean");
    await rm(path.join(root, "node_modules"), { recursive: true });
    await symlink(path.join(cwd, "node_modules"), path.join(root, "node_modules"), "junction");
    const typecheck = () =>
      promisify(execFile)(
        process.execPath,
        [path.join(cwd, "node_modules/typescript/bin/tsc"), "--noEmit"],
        { cwd: root },
      );
    await typecheck();
    await add("slack");
    await typecheck();
    await remove("slack");
    await typecheck();
  }, 30000);
}
