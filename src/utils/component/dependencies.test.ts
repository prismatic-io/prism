import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { temporaryDirectoryTask } from "tempy";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getWorkingDirectory } from "../../command-context.js";

const mocks = vi.hoisted(() => ({
  findComponentBySignature: vi.fn(),
  calculatePackageSignature: vi.fn(),
  uploadComponentVersion: vi.fn(),
  createComponentPackage: vi.fn(),
  validateDefinition: vi.fn(),
  waitForComponentVersion: vi.fn(),
}));
vi.mock(import("./publish.js"), async (importOriginal) => ({
  ...(await importOriginal()),
  uploadComponentVersion: mocks.uploadComponentVersion,
}));
vi.mock(import("./signature.js"), async (importOriginal) => ({
  ...(await importOriginal()),
  findComponentBySignature: mocks.findComponentBySignature,
  calculatePackageSignature: mocks.calculatePackageSignature,
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
  auditComponentDependencies,
  findComponentDependencies,
  isComponentPackage,
  publishComponentDependencies,
} from "./dependencies.js";

const writeJson = (file: string, value: unknown) =>
  writeFile(file, JSON.stringify(value, null, 2), "utf-8");

/** An integration at `root` depending on `packages`, each installed under node_modules. */
const integrationWith = async (
  root: string,
  packages: Record<string, { marker?: boolean | string; definition?: Record<string, unknown> }>,
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
      ...(marker
        ? { prismatic: { component: typeof marker === "string" ? marker : "./dist/index.js" } }
        : {}),
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
    // The marker is the path of the platform bundle; nothing else marks a package.
    expect(isComponentPackage({ prismatic: { component: true } })).toBe(false);
    expect(isComponentPackage({ prismatic: { component: "" } })).toBe(false);
    expect(isComponentPackage({ prismatic: "./dist/index.js" })).toBe(false);
    expect(isComponentPackage({ prismatic: { component: 3 } })).toBe(false);
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

  it("reads a third-party package with unexpected fields as an ordinary dependency", async () => {
    await temporaryDirectoryTask(async (root) => {
      await integrationWith(root, { "my-component": {}, odd: { marker: false } });
      // A version that is not a string and an unrelated `prismatic` value: neither fails discovery.
      await writeJson(path.join(root, "node_modules", "odd", "package.json"), {
        name: "odd",
        version: 7,
        prismatic: "yes",
      });
      const found = await findComponentDependencies(root);
      expect(found.map(({ name }) => name)).toEqual(["my-component"]);
    });
  });

  it("fails clearly on an integration package.json whose dependencies are malformed", async () => {
    await temporaryDirectoryTask(async (root) => {
      await writeJson(path.join(root, "package.json"), { dependencies: ["my-component"] });
      await expect(findComponentDependencies(root)).rejects.toThrow(
        /package\.json is not a valid package\.json[\s\S]*dependencies/,
      );
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

describe("auditComponentDependencies", () => {
  it("warns about uninstalled dependencies and component packages under devDependencies", async () => {
    await temporaryDirectoryTask(async (root) => {
      await integrationWith(root, {
        "my-component": {},
        lodash: { marker: false },
        "dev-component": {},
      });
      await writeJson(path.join(root, "package.json"), {
        name: "cni",
        dependencies: { "my-component": "*", lodash: "*", ghost: "*", phantom: "*" },
        devDependencies: { "dev-component": "*", vitest: "*" },
      });

      expect(await auditComponentDependencies(root)).toEqual([
        expect.stringContaining("not installed: ghost, phantom"),
        expect.stringContaining(
          "dev-component is a component package listed under devDependencies",
        ),
      ]);
    });
  });

  it("is quiet when everything declared is installed where it belongs", async () => {
    await temporaryDirectoryTask(async (root) => {
      await integrationWith(root, { "my-component": {}, lodash: { marker: false } });
      expect(await auditComponentDependencies(root)).toEqual([]);
      expect(await auditComponentDependencies(path.join(root, "missing"))).toEqual([]);
    });
  });
});

describe("publishComponentDependencies", () => {
  beforeEach(() => {
    mocks.createComponentPackage.mockResolvedValue("/tmp/package.zip");
    mocks.findComponentBySignature.mockReset().mockResolvedValue(undefined);
    mocks.calculatePackageSignature.mockResolvedValue("package-hash");
    mocks.uploadComponentVersion.mockResolvedValue({ componentId: "comp_1", versionNumber: 4 });
    mocks.waitForComponentVersion.mockResolvedValue(true);
  });

  it("leaves public and signature-matched components alone, skips unbuilt ones, and publishes the rest", async () => {
    await temporaryDirectoryTask(async (root) => {
      await integrationWith(root, {
        "public-component": { definition: definition("publicComponent", true) },
        "unbuilt-component": {},
        "unchanged-component": { definition: definition("unchangedComponent") },
        "changed-component": { definition: definition("changedComponent") },
      });
      mocks.findComponentBySignature.mockImplementation(async ({ key }: { key: string }) =>
        ["unchangedComponent", "publicComponent"].includes(key)
          ? { id: key, signature: "package-hash", versionIsAvailable: true }
          : undefined,
      );
      const directories: string[] = [];
      mocks.uploadComponentVersion.mockImplementation(async () => {
        directories.push(getWorkingDirectory());
        return { componentId: "comp_1", versionNumber: 4 };
      });
      const cwd = process.cwd();

      const results = await publishComponentDependencies(root);

      expect(process.cwd()).toBe(cwd);
      expect(results.map(({ name, status }) => [name, status])).toEqual([
        ["public-component", "public"],
        ["unbuilt-component", "not-built"],
        ["unchanged-component", "unchanged"],
        ["changed-component", "published"],
      ]);
      expect(results[3].detail).toBe("v4");
      // Public artifacts are matched too, but never published by this command.
      expect(mocks.findComponentBySignature.mock.calls.map(([{ key }]) => key)).toEqual([
        "publicComponent",
        "unchangedComponent",
        "changedComponent",
      ]);
      expect(mocks.uploadComponentVersion).toHaveBeenCalledTimes(1);
      const [publishedDefinition, packagePath, options] =
        mocks.uploadComponentVersion.mock.calls[0];
      expect(publishedDefinition.key).toBe("changedComponent");
      expect(packagePath).toBe("/tmp/package.zip");
      expect(options.comment).toContain("changed-component@1.2.3");
      // Published from the package's dist/ directory, so its icon resolves there.
      expect(directories).toEqual([path.join(root, "node_modules", "changed-component", "dist")]);
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
      mocks.waitForComponentVersion.mockResolvedValue(false);

      const [result] = await publishComponentDependencies(root, { timeoutSeconds: 7 });

      expect(mocks.waitForComponentVersion).toHaveBeenCalledWith("comp_1", { timeoutSeconds: 7 });
      expect(result.status).toBe("timed-out");
      expect(result.detail).toContain("signature package-hash is still processing after 7 seconds");
    });
  });

  it.each([
    false,
    true,
  ])("waits for a matching processing artifact (public=%s) without republishing", async (isPublic) => {
    await temporaryDirectoryTask(async (root) => {
      await integrationWith(root, { component: { definition: definition("component", isPublic) } });
      mocks.findComponentBySignature.mockResolvedValue({
        id: "processing-id",
        signature: "package-hash",
        versionIsAvailable: false,
      });
      mocks.waitForComponentVersion.mockResolvedValue(false);
      const [result] = await publishComponentDependencies(root, { timeoutSeconds: 3 });
      expect(result).toMatchObject({ status: "timed-out", signature: "package-hash" });
      expect(mocks.waitForComponentVersion).toHaveBeenCalledWith("processing-id", {
        timeoutSeconds: 3,
      });
      expect(mocks.uploadComponentVersion).not.toHaveBeenCalled();
    });
  });

  it.each([
    false,
    true,
  ])("holds an existing component until it becomes available (public=%s)", async (isPublic) => {
    await temporaryDirectoryTask(async (root) => {
      await integrationWith(root, { component: { definition: definition("component", isPublic) } });
      mocks.findComponentBySignature.mockResolvedValue({
        id: "processing-id",
        signature: "package-hash",
        versionIsAvailable: false,
      });
      const started = Promise.withResolvers<void>();
      const availability = Promise.withResolvers<boolean>();
      mocks.waitForComponentVersion.mockImplementation(() => {
        started.resolve();
        return availability.promise;
      });
      let completed = false;
      const pending = publishComponentDependencies(root, { timeoutSeconds: 3 }).then((results) => {
        completed = true;
        return results;
      });
      await started.promise;
      await Promise.resolve();
      expect(completed).toBe(false);
      expect(mocks.waitForComponentVersion).toHaveBeenCalledWith("processing-id", {
        timeoutSeconds: 3,
      });
      expect(mocks.uploadComponentVersion).not.toHaveBeenCalled();

      availability.resolve(true);
      const [result] = await pending;
      expect(result).toMatchObject({
        status: isPublic ? "public" : "unchanged",
        signature: "package-hash",
      });
      expect(mocks.uploadComponentVersion).not.toHaveBeenCalled();
    });
  });

  it("reuses an available historical version and returns its signature for YAML selection", async () => {
    await temporaryDirectoryTask(async (root) => {
      await integrationWith(root, { component: { definition: definition("component") } });
      mocks.findComponentBySignature.mockResolvedValue({
        id: "historical-id",
        signature: "package-hash",
        versionIsAvailable: true,
      });
      const [result] = await publishComponentDependencies(root, { timeoutSeconds: 3 });
      expect(result).toMatchObject({
        status: "unchanged",
        signature: "package-hash",
        key: "component",
        isPublic: false,
      });
      expect(mocks.uploadComponentVersion).not.toHaveBeenCalled();
      expect(mocks.waitForComponentVersion).not.toHaveBeenCalled();
    });
  });

  it("fails when a public package has no matching artifact instead of publishing or choosing LATEST", async () => {
    await temporaryDirectoryTask(async (root) => {
      await integrationWith(root, { component: { definition: definition("component", true) } });
      const [result] = await publishComponentDependencies(root, { timeoutSeconds: 3 });
      expect(result).toMatchObject({ status: "failed", signature: "package-hash" });
      expect(result.detail).toContain("no published version matching signature");
      expect(mocks.uploadComponentVersion).not.toHaveBeenCalled();
    });
  });
  it("fails a package whose marker does not name an index.js bundle", async () => {
    await temporaryDirectoryTask(async (root) => {
      await integrationWith(root, {
        "odd-layout": { marker: "./dist/platform.js", definition: definition("oddLayout") },
      });

      const [result] = await publishComponentDependencies(root);

      expect(result.status).toBe("failed");
      expect(result.detail).toContain("marker names ./dist/platform.js");
      expect(mocks.validateDefinition).not.toHaveBeenCalled();
      expect(mocks.uploadComponentVersion).not.toHaveBeenCalled();
    });
  });

  it("reports a failing component and still processes the others", async () => {
    await temporaryDirectoryTask(async (root) => {
      await integrationWith(root, {
        "broken-component": { definition: definition("brokenComponent") },
        "fine-component": { definition: definition("fineComponent") },
      });
      mocks.validateDefinition.mockImplementationOnce(async () => {
        throw new Error("Component icon does not exist");
      });

      const results = await publishComponentDependencies(root);

      expect(results.map(({ status }) => status)).toEqual(["failed", "published"]);
      expect(results[0].detail).toContain("icon does not exist");
    });
  });
});
