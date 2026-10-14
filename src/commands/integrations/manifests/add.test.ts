import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeAll, beforeEach, expect, it, vi } from "vitest";
import * as diagnostics from "../../../command.js";
import { exists } from "../../../fs.js";
import { ClientError, gqlRequest } from "../../../graphql.js";
import { runCommand } from "../../../test-command.js";
import { registeredManifestKeys } from "../../../utils/integration/componentRegistry.js";
import {
  generateFixtureManifest,
  linkSpectral,
  SPECTRAL_ROOT,
} from "../../../utils/integration/manifests.fixture.js";
import { spawnProcess } from "../../../utils/process.js";
import AddCommand from "./add.js";

vi.mock(import("../../../graphql.js"), async (original) => ({
  ...(await original()),
  gqlRequest: vi.fn(),
}));

vi.mock(import("../../../utils/process.js"), () => ({ spawnProcess: vi.fn() }));

const basePath = process.cwd();
const generatorBin = path.join(SPECTRAL_ROOT, "bin", "cni-component-manifest.js");
let projectDir: string;

let registryTemplate: string;

beforeAll(async () => {
  registryTemplate = (
    await readFile(
      new URL("../../../../templates/integration/src/componentRegistry.ts.ejs", import.meta.url),
      "utf8",
    )
  ).replaceAll("\r\n", "\n");
});

const componentNodes = (...nodes: Array<{ key: string; public: boolean }>) => ({
  components: {
    nodes: nodes.map((node, index) => ({
      id: `id-${index}`,
      key: node.key,
      public: node.public,
      versionNumber: 7,
      versionSequenceId: null,
      versions: { nodes: [], pageInfo: { hasNextPage: false, endCursor: null } },
    })),
  },
});

const generateOnSpawn = () => {
  vi.mocked(spawnProcess).mockImplementation(async ([_node, _generator, key, ...flags]) => {
    await generateFixtureManifest(process.cwd(), {
      key,
      public: !flags.includes("--private"),
    });
    return { stdout: "", stderr: "", exitCode: 0 };
  });
};

const readRegistry = () => readFile(path.join(projectDir, "src", "componentRegistry.ts"), "utf8");

beforeEach(async () => {
  projectDir = await mkdtemp(path.join(tmpdir(), "prism-manifests-add-"));
  await mkdir(path.join(projectDir, "src"), { recursive: true });
  await writeFile(path.join(projectDir, "package.json"), "{}");
  await writeFile(path.join(projectDir, "src", "componentRegistry.ts"), registryTemplate);
  await linkSpectral(projectDir);
  process.chdir(projectDir);
});

afterEach(async () => {
  process.chdir(basePath);
  await rm(projectDir, { recursive: true, force: true });
  vi.mocked(gqlRequest).mockReset();
  vi.mocked(spawnProcess).mockReset();
});

it("generates and registers manifests for each component key", async () => {
  generateOnSpawn();
  vi.mocked(gqlRequest)
    .mockResolvedValueOnce(componentNodes({ key: "slack", public: true }))
    .mockResolvedValueOnce(componentNodes({ key: "acme", public: false }));

  const result = await runCommand(AddCommand, ["--agent", "--yes", "slack", "acme"]);

  expect(result).toEqual({
    items: [
      {
        key: "slack",
        public: true,
        versionNumber: 7,
        path: path.join("src", "manifests", "slack"),
        registration: "registered",
      },
      {
        key: "acme",
        public: false,
        versionNumber: 7,
        path: path.join("src", "manifests", "acme"),
        registration: "registered",
      },
    ],
  });
  const childEnv = {
    PRISMATIC_URL: "https://example.com",
    PRISM_NO_AGENT: "1",
    PRISM_ACCESS_TOKEN: "test-token",
  };
  expect(vi.mocked(spawnProcess).mock.calls).toEqual([
    [[process.execPath, generatorBin, "slack"], childEnv],
    [[process.execPath, generatorBin, "acme", "--private"], childEnv],
  ]);
  await expect(registeredManifestKeys(projectDir)).resolves.toEqual(new Set(["slack", "acme"]));
});

it("passes an explicit visibility through to the lookup and the generator", async () => {
  generateOnSpawn();
  vi.mocked(gqlRequest).mockResolvedValueOnce(componentNodes({ key: "acme", public: false }));

  await runCommand(AddCommand, ["--agent", "--yes", "--private", "acme"]);

  expect(vi.mocked(gqlRequest).mock.calls[0]?.[0]).toMatchObject({
    variables: { key: "acme", public: false },
  });
  expect(vi.mocked(spawnProcess).mock.calls[0]?.[0]).toEqual([
    process.execPath,
    generatorBin,
    "acme",
    "--private",
  ]);
});

it("reports a failed component lookup before running the generator", async () => {
  vi.mocked(gqlRequest).mockRejectedValueOnce(
    new ClientError({ status: 500, headers: {}, errors: [{ message: "boom" }] }, { query: "" }),
  );
  await expect(runCommand(AddCommand, ["--agent", "--yes", "slack"])).rejects.toMatchObject({
    code: "COMPONENT_LOOKUP_FAILED",
  });
  expect(spawnProcess).not.toHaveBeenCalled();
});

it("skips registration with --no-register", async () => {
  generateOnSpawn();
  vi.mocked(gqlRequest).mockResolvedValueOnce(componentNodes({ key: "slack", public: true }));

  const result = await runCommand(AddCommand, ["--agent", "--yes", "--no-register", "slack"]);

  expect(result).toMatchObject({ items: [{ key: "slack", registration: "skipped" }] });
  expect(await readRegistry()).toBe(registryTemplate);
});

it("warns with the lines to add when the registry shape is unsupported", async () => {
  generateOnSpawn();
  await writeFile(
    path.join(projectDir, "src", "componentRegistry.ts"),
    "export const componentRegistry = {};\n",
  );
  vi.mocked(gqlRequest).mockResolvedValueOnce(
    componentNodes({ key: "google-drive", public: true }),
  );
  const warnSpy = vi.spyOn(diagnostics, "writeCommandOutput");

  const result = await runCommand(AddCommand, ["--agent", "--yes", "google-drive"]);

  expect(result).toMatchObject({ items: [{ key: "google-drive", registration: "unsupported" }] });
  expect(warnSpy).toHaveBeenCalledWith(
    expect.stringContaining(
      'import googleDrive from "./manifests/google-drive";\n  "google-drive": googleDrive,',
    ),
    "stderr",
  );
  await expect(
    exists(path.join(projectDir, "src", "manifests", "google-drive", "index.ts")),
  ).resolves.toBe(true);
});

it("fails when spectral is not installed", async () => {
  await rm(path.join(projectDir, "node_modules"), { recursive: true });
  await expect(runCommand(AddCommand, ["--agent", "--yes", "slack"])).rejects.toMatchObject({
    code: "COMMAND_FAILED",
    message: expect.stringContaining("@prismatic-io/spectral is not installed"),
  });
  expect(gqlRequest).not.toHaveBeenCalled();
});

it("fails when the installed spectral lacks the generator", async () => {
  const target = path.join(projectDir, "node_modules", "@prismatic-io", "spectral");
  await rm(target);
  await mkdir(target);
  await writeFile(
    path.join(target, "package.json"),
    JSON.stringify({ name: "@prismatic-io/spectral", version: "10.5.0", bin: {} }),
  );
  await expect(runCommand(AddCommand, ["--agent", "--yes", "slack"])).rejects.toMatchObject({
    code: "COMMAND_FAILED",
    message: expect.stringContaining("does not provide cni-component-manifest"),
  });
});

it("resolves every key before running the generator", async () => {
  vi.mocked(gqlRequest)
    .mockResolvedValueOnce(componentNodes({ key: "slack", public: true }))
    .mockResolvedValueOnce(
      componentNodes({ key: "acme", public: true }, { key: "acme", public: false }),
    );
  await expect(runCommand(AddCommand, ["--agent", "--yes", "slack", "acme"])).rejects.toMatchObject(
    { code: "COMPONENT_AMBIGUOUS" },
  );
  expect(spawnProcess).not.toHaveBeenCalled();
});

it("fails when the generator exits with an error", async () => {
  vi.mocked(gqlRequest).mockResolvedValueOnce(componentNodes({ key: "slack", public: true }));
  vi.mocked(spawnProcess).mockRejectedValue(new Error("Command failed with exit code 3"));
  await expect(runCommand(AddCommand, ["--agent", "--yes", "slack"])).rejects.toMatchObject({
    message: "Command failed with exit code 3",
  });
});

it("fails when the generator finishes without writing the manifest", async () => {
  vi.mocked(gqlRequest).mockResolvedValueOnce(componentNodes({ key: "slack", public: true }));
  vi.mocked(spawnProcess).mockResolvedValue({ stdout: "", stderr: "", exitCode: 0 });
  await expect(runCommand(AddCommand, ["--agent", "--yes", "slack"])).rejects.toMatchObject({
    code: "COMMAND_FAILED",
    message: expect.stringContaining("was not created"),
  });
});

it("requires a package.json in the working directory", async () => {
  await rm(path.join(projectDir, "package.json"));
  await expect(runCommand(AddCommand, ["--agent", "--yes", "slack"])).rejects.toMatchObject({
    code: "VALIDATION_ERROR",
  });
});
