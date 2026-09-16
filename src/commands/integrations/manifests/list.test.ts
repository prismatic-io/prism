import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, expect, it } from "vitest";
import { runCommand } from "../../../test-command.js";
import { generateFixtureManifest } from "../../../utils/integration/manifests.fixture.js";
import ListCommand from "./list.js";

const basePath = process.cwd();
let projectDir: string;

beforeEach(async () => {
  projectDir = await mkdtemp(path.join(tmpdir(), "prism-manifests-list-"));
  process.chdir(projectDir);
});

afterEach(async () => {
  process.chdir(basePath);
  await rm(projectDir, { recursive: true, force: true });
});

it("returns an empty list outside an integration", async () => {
  await expect(runCommand(ListCommand, ["--agent"])).resolves.toEqual({ items: [] });
});

it("lists installed manifests with their registration state", async () => {
  await generateFixtureManifest(projectDir, { key: "slack", public: true });
  await generateFixtureManifest(projectDir, { key: "acme", public: false });
  await mkdir(path.join(projectDir, "src"), { recursive: true });
  await writeFile(
    path.join(projectDir, "src", "componentRegistry.ts"),
    `import { componentManifests } from "@prismatic-io/spectral";
import slack from "./manifests/slack";

export const componentRegistry = componentManifests({ slack });
`,
  );
  await expect(runCommand(ListCommand, ["--agent"])).resolves.toEqual({
    items: [
      {
        key: "acme",
        public: false,
        registered: false,
        signature: "sig-acme",
        path: path.join("src", "manifests", "acme"),
      },
      {
        key: "slack",
        public: true,
        registered: true,
        signature: "sig-slack",
        path: path.join("src", "manifests", "slack"),
      },
    ],
  });
});

it("reports registration as unknown when the registry file is missing", async () => {
  await generateFixtureManifest(projectDir, { key: "slack", public: true });
  await expect(runCommand(ListCommand, ["--agent"])).resolves.toMatchObject({
    items: [{ key: "slack", registered: null }],
  });
});
