import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { temporaryDirectoryTask } from "tempy";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getPackageSignatureMatch: vi.fn(),
  publishDefinition: vi.fn(),
  uploadConnectionIcons: vi.fn(),
  uploadFile: vi.fn(),
  createComponentPackage: vi.fn(),
  validateDefinition: vi.fn(),
  waitForComponentVersion: vi.fn(),
}));
vi.mock(import("./publish.js"), async (importOriginal) => ({
  ...(await importOriginal()),
  getPackageSignatureMatch: mocks.getPackageSignatureMatch,
  publishDefinition: mocks.publishDefinition,
  uploadConnectionIcons: mocks.uploadConnectionIcons,
  uploadFile: mocks.uploadFile,
}));
vi.mock(import("./index.js"), async (importOriginal) => ({
  ...(await importOriginal()),
  createComponentPackage: mocks.createComponentPackage,
  validateDefinition: mocks.validateDefinition,
}));
vi.mock(import("../availability.js"), async (importOriginal) => ({
  ...(await importOriginal()),
  waitForComponentVersion: mocks.waitForComponentVersion,
}));

import {
  findComponentDependencies,
  isComponentPackage,
  publishComponentDependencies,
} from "./dependencies.js";

const writeJson = (file: string, value: unknown) =>
  writeFile(file, JSON.stringify(value, null, 2), "utf-8");

/** An integration at `root` depending on `packages`, each installed under node_modules. */
const integrationWith = async (
  root: string,
  packages: Record<string, { marker?: boolean; definition?: Record<string, unknown> }>,
) => {
  await writeJson(path.join(root, "package.json"), {
    name: "cni",
    dependencies: Object.fromEntries(Object.keys(packages).map((name) => [name, "*"])),
  });
  for (const [name, { marker = true, definition }] of Object.entries(packages)) {
    const dir = path.join(root, "node_modules", ...name.split("/"));
    await mkdir(path.join(dir, "dist"), { recursive: true });
    await writeJson(path.join(dir, "package.json"), {
      name,
      version: "1.2.3",
      ...(marker ? { prismatic: { component: "./dist/index.js" } } : {}),
    });
    if (definition) {
      await writeFile(
        path.join(dir, "dist", "index.js"),
        `module.exports = { default: ${JSON.stringify(definition)} };`,
      );
    }
  }
};

const definition = (key: string, isPublic = false) => ({
  key,
  public: isPublic,
  display: { label: key, description: key, iconPath: "icon.png" },
  actions: {},
  connections: [],
});

describe("isComponentPackage", () => {
  it("recognizes the init marker and nothing else", () => {
    expect(isComponentPackage({ prismatic: { component: "./dist/index.js" } })).toBe(true);
    // Existing packages with the original boolean marker remain supported.
    expect(isComponentPackage({ prismatic: { component: true } })).toBe(true);
    expect(isComponentPackage({ prismatic: { component: false } })).toBe(false);
    expect(isComponentPackage({ name: "lodash" })).toBe(false);
    expect(isComponentPackage(null)).toBe(false);
  });
});

describe("findComponentDependencies", () => {
  it("returns installed direct dependencies carrying the marker, scoped or not", async () => {
    await temporaryDirectoryTask(async (root) => {
      await integrationWith(root, {
        "my-component": {},
        "@acme/other-component": {},
        lodash: { marker: false },
      });
      await writeJson(path.join(root, "package.json"), {
        dependencies: {
          "my-component": "*",
          "@acme/other-component": "*",
          lodash: "*",
          ghost: "*",
        },
      });
      const found = await findComponentDependencies(root);
      expect(found.map(({ name, version }) => `${name}@${version}`)).toEqual([
        "my-component@1.2.3",
        "@acme/other-component@1.2.3",
      ]);
      expect(found[1]).toMatchObject({
        directory: path.join(root, "node_modules", "@acme", "other-component"),
        platformEntrypoint: "./dist/index.js",
      });
    });
  });

  it("finds a dependency hoisted to an ancestor node_modules (workspaces)", async () => {
    await temporaryDirectoryTask(async (workspace) => {
      // workspace/node_modules/hoisted-component, used by workspace/packages/cni which has no
      // node_modules of its own.
      const hoisted = path.join(workspace, "node_modules", "hoisted-component");
      await mkdir(hoisted, { recursive: true });
      await writeJson(path.join(hoisted, "package.json"), {
        name: "hoisted-component",
        version: "2.0.0",
        prismatic: { component: "./dist/index.js" },
      });
      const integration = path.join(workspace, "packages", "cni");
      await mkdir(integration, { recursive: true });
      await writeJson(path.join(integration, "package.json"), {
        name: "cni",
        dependencies: { "hoisted-component": "*" },
      });

      expect(await findComponentDependencies(integration)).toEqual([
        {
          name: "hoisted-component",
          version: "2.0.0",
          directory: hoisted,
          platformEntrypoint: "./dist/index.js",
        },
      ]);
    });
  });

  it("finds a package whose exports map does not expose package.json", async () => {
    await temporaryDirectoryTask(async (root) => {
      const dir = path.join(root, "node_modules", "@acme", "sealed-component");
      await mkdir(dir, { recursive: true });
      await writeJson(path.join(dir, "package.json"), {
        name: "@acme/sealed-component",
        version: "3.1.0",
        exports: { ".": "./index.js" },
        prismatic: { component: "./dist/index.js" },
      });
      await writeFile(path.join(dir, "index.js"), "module.exports = {};");
      await writeJson(path.join(root, "package.json"), {
        name: "cni",
        dependencies: { "@acme/sealed-component": "*" },
      });

      expect(await findComponentDependencies(root)).toEqual([
        {
          name: "@acme/sealed-component",
          version: "3.1.0",
          directory: dir,
          platformEntrypoint: "./dist/index.js",
        },
      ]);
    });
  });

  it("ignores devDependencies and a missing package.json", async () => {
    await temporaryDirectoryTask(async (root) => {
      expect(await findComponentDependencies(root)).toEqual([]);
      await writeJson(path.join(root, "package.json"), {
        devDependencies: { "my-component": "*" },
      });
      expect(await findComponentDependencies(root)).toEqual([]);
    });
  });
});

describe("publishComponentDependencies", () => {
  beforeEach(() => {
    mocks.createComponentPackage.mockResolvedValue("/tmp/package.zip");
    mocks.publishDefinition.mockResolvedValue({
      componentId: "comp_1",
      iconUploadUrl: "icon-url",
      packageUploadUrl: "package-url",
      connectionIconUploadUrls: {},
      versionNumber: 4,
    });
    mocks.waitForComponentVersion.mockResolvedValue(true);
  });

  it("skips public and unbuilt components, dedupes by signature, and publishes the rest", async () => {
    await temporaryDirectoryTask(async (root) => {
      await integrationWith(root, {
        "public-component": { definition: definition("publicComponent", true) },
        "unbuilt-component": {},
        "unchanged-component": { definition: definition("unchangedComponent") },
        "changed-component": { definition: definition("changedComponent") },
      });
      mocks.getPackageSignatureMatch.mockImplementation(async ({ key }: { key: string }) => ({
        matches: key === "publicComponent" || key === "unchangedComponent",
        versionNumber: key === "publicComponent" ? 8 : 3,
      }));
      const cwd = process.cwd();

      const results = await publishComponentDependencies(root);

      expect(process.cwd()).toBe(cwd);
      expect(results.map(({ name, status }) => [name, status])).toEqual([
        ["public-component", "public"],
        ["unbuilt-component", "not-built"],
        ["unchanged-component", "unchanged"],
        ["changed-component", "published"],
      ]);
      expect(mocks.publishDefinition).toHaveBeenCalledTimes(1);
      expect(mocks.publishDefinition.mock.calls[0][0].key).toBe("changedComponent");
      expect(mocks.publishDefinition.mock.calls[0][1].comment).toContain("changed-component@1.2.3");
      expect(mocks.uploadFile).toHaveBeenCalledWith("/tmp/package.zip", "package-url");
      // The icon resolves against the package's dist/ directory, not the process cwd.
      expect(mocks.uploadFile).toHaveBeenCalledWith(
        path.join(root, "node_modules", "changed-component", "dist", "icon.png"),
        "icon-url",
      );
      // Every built package, including a public one, is validated against the platform artifact.
      expect(mocks.validateDefinition).toHaveBeenCalledTimes(3);
      // No wait options: the publish is not awaited.
      expect(mocks.waitForComponentVersion).not.toHaveBeenCalled();
    });
  });

  it("waits for the published version when wait options are given and fails on a timeout", async () => {
    await temporaryDirectoryTask(async (root) => {
      await integrationWith(root, {
        "slow-component": { definition: definition("slowComponent") },
      });
      mocks.getPackageSignatureMatch.mockResolvedValue({ matches: false });
      mocks.waitForComponentVersion.mockResolvedValue(false);

      const [result] = await publishComponentDependencies(root, { timeoutSeconds: 7 });

      expect(mocks.waitForComponentVersion).toHaveBeenCalledWith("comp_1", { timeoutSeconds: 7 });
      expect(result.status).toBe("timed-out");
      expect(result.detail).toContain("v4 was published and is still processing after 7 seconds");
    });
  });

  it("reports a failing component and still processes the others", async () => {
    await temporaryDirectoryTask(async (root) => {
      await integrationWith(root, {
        "broken-component": { definition: definition("brokenComponent") },
        "fine-component": { definition: definition("fineComponent") },
      });
      mocks.getPackageSignatureMatch.mockResolvedValue({ matches: false });
      mocks.validateDefinition.mockImplementationOnce(async () => {
        throw new Error("Component icon does not exist");
      });

      const results = await publishComponentDependencies(root);

      expect(results.map(({ status }) => status)).toEqual(["failed", "published"]);
      expect(results[0].detail).toContain("icon does not exist");
    });
  });
});
