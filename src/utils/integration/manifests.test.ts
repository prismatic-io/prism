import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { generateFixtureManifest, linkSpectral, SPECTRAL_ROOT } from "./manifests.fixture.js";
import { readInstalledManifests, resolveManifestGenerator } from "./manifests.js";

let projectDir: string;

beforeEach(async () => {
  projectDir = await mkdtemp(path.join(tmpdir(), "prism-manifests-"));
  await writeFile(path.join(projectDir, "package.json"), "{}");
});

afterEach(async () => {
  await rm(projectDir, { recursive: true, force: true });
});

describe("readInstalledManifests", () => {
  it("returns an empty list when no manifests directory exists", async () => {
    await expect(readInstalledManifests(projectDir)).resolves.toEqual([]);
  });

  it("reads key, visibility, and signature from spectral's generated entry points", async () => {
    await generateFixtureManifest(projectDir, { key: "slack", public: true });
    await generateFixtureManifest(projectDir, { key: "acme", public: false, signature: null });
    await mkdir(path.join(projectDir, "src", "manifests", "not-a-manifest"));
    await expect(readInstalledManifests(projectDir)).resolves.toEqual([
      { key: "acme", public: false, signature: null, path: path.join("src", "manifests", "acme") },
      {
        key: "slack",
        public: true,
        signature: "sig-slack",
        path: path.join("src", "manifests", "slack"),
      },
    ]);
  });
});

describe("readInstalledManifests fallbacks", () => {
  it("falls back to the directory name and unknown visibility for a hand-edited entry point", async () => {
    const target = path.join(projectDir, "src", "manifests", "custom");
    await mkdir(target, { recursive: true });
    await writeFile(path.join(target, "index.ts"), "export default { actions } as const;\n");
    await expect(readInstalledManifests(projectDir)).resolves.toEqual([
      {
        key: "custom",
        public: null,
        signature: null,
        path: path.join("src", "manifests", "custom"),
      },
    ]);
  });
});

describe("resolveManifestGenerator", () => {
  it("reports a missing spectral install", async () => {
    await expect(resolveManifestGenerator(projectDir)).resolves.toEqual({ status: "missing" });
  });

  it("reports a spectral version without the generator", async () => {
    const target = path.join(projectDir, "node_modules", "@prismatic-io", "spectral");
    await mkdir(target, { recursive: true });
    await writeFile(
      path.join(target, "package.json"),
      JSON.stringify({ name: "@prismatic-io/spectral", version: "10.5.0", bin: {} }),
    );
    await expect(resolveManifestGenerator(projectDir)).resolves.toEqual({
      status: "unsupported",
      version: "10.5.0",
    });
  });

  it("resolves the generator from the project's spectral install", async () => {
    await linkSpectral(projectDir);
    const spectral = await import(path.join(SPECTRAL_ROOT, "package.json"), {
      with: { type: "json" },
    });
    await expect(resolveManifestGenerator(projectDir)).resolves.toEqual({
      status: "ready",
      version: spectral.default.version,
      command: [process.execPath, path.join(SPECTRAL_ROOT, "bin", "cni-component-manifest.js")],
    });
  });
});
