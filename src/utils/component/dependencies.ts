import { createRequire } from "node:module";
import { basename, dirname, resolve } from "node:path";
import { z } from "zod";
import { withWorkingDirectory } from "../../command-context.js";
import { CommandFailedError } from "../../errors.js";
import { exists, fs } from "../../fs.js";
import { type WaitOptions, waitForComponentVersion } from "../availability.js";
import { startAction, stopAction } from "../progress.js";
import { createComponentPackage, loadEntrypoint, validateDefinition } from "./index.js";
import { uploadComponentVersion } from "./publish.js";
import { calculatePackageSignature, findComponentBySignature } from "./signature.js";

/** Identifies the packaged platform artifact in package.json. */
export const COMPONENT_PACKAGE_MARKER = { component: "./dist/index.js" } as const;

export const ComponentMarkerSchema = z.object({ component: z.string().min(1) });

/** Ignore unrelated or malformed metadata in third-party packages. */
const InstalledPackageSchema = z.looseObject({
  name: z.string().optional().catch(undefined),
  version: z.string().optional().catch(undefined),
  prismatic: z.unknown().optional(),
});

const IntegrationPackageSchema = z.looseObject({
  dependencies: z.record(z.string(), z.string()).optional(),
  devDependencies: z.record(z.string(), z.string()).optional(),
});

export const isComponentPackage = (pkg: unknown): boolean =>
  ComponentMarkerSchema.safeParse((pkg as { prismatic?: unknown } | null)?.prismatic).success;

export interface ComponentDependency {
  name: string;
  version: string;
  /** Absolute path of the installed package. */
  directory: string;
  /** Package-relative entrypoint containing the self-contained platform artifact. */
  platformEntrypoint: string;
}

const readJson = async (path: string): Promise<unknown> =>
  (await exists(path)) ? JSON.parse(await fs.readFile(path, "utf-8")) : undefined;

const readPackageJson = async (path: string) => {
  const raw = await readJson(path);
  return raw === undefined ? undefined : InstalledPackageSchema.parse(raw);
};

const readIntegrationPackageJson = async (root: string) => {
  const path = resolve(root, "package.json");
  const raw = await readJson(path);
  if (raw === undefined) return undefined;
  const parsed = IntegrationPackageSchema.safeParse(raw);
  if (!parsed.success) {
    throw new CommandFailedError({
      message: `${path} is not a valid package.json: ${z.prettifyError(parsed.error)}`,
    });
  }
  return parsed.data;
};

const resolvePackageDirectory = async (root: string, name: string): Promise<string | undefined> => {
  const require = createRequire(resolve(root, "package.json"));
  try {
    return dirname(require.resolve(`${name}/package.json`));
  } catch {
    // Exports may hide package.json. Use Node's install locations before inspecting the
    // entrypoint: npm aliases need not match the name in the installed manifest.
  }
  for (const location of require.resolve.paths(name) ?? []) {
    const directory = resolve(location, name);
    if (await exists(resolve(directory, "package.json"))) return directory;
  }
  // Preserve entrypoint resolution for installations outside ordinary node_modules paths.
  let entrypoint: string;
  try {
    entrypoint = require.resolve(name);
  } catch {
    return undefined;
  }
  for (let directory = dirname(entrypoint); ; directory = dirname(directory)) {
    const pkg = await readPackageJson(resolve(directory, "package.json"));
    if (pkg?.name === name) return directory;
    if (dirname(directory) === directory) return undefined;
  }
};

/** Discover installed component packages in direct dependencies only. */
export const findComponentDependencies = async (root: string): Promise<ComponentDependency[]> => {
  const rootPackage = await readIntegrationPackageJson(root);
  const found: ComponentDependency[] = [];
  for (const name of Object.keys(rootPackage?.dependencies ?? {})) {
    const directory = await resolvePackageDirectory(root, name);
    if (!directory) continue;
    const pkg = await readPackageJson(resolve(directory, "package.json"));
    const marker = ComponentMarkerSchema.safeParse(pkg?.prismatic);
    if (marker.success) {
      found.push({
        name,
        version: pkg?.version ?? "",
        directory,
        platformEntrypoint: marker.data.component,
      });
    }
  }
  return found;
};

/** Warn about missing installs and components listed only in devDependencies. */
export const auditComponentDependencies = async (root: string): Promise<string[]> => {
  const rootPackage = await readIntegrationPackageJson(root);
  const warnings: string[] = [];

  const notInstalled: string[] = [];
  for (const name of Object.keys(rootPackage?.dependencies ?? {})) {
    if (!(await resolvePackageDirectory(root, name))) notInstalled.push(name);
  }
  if (notInstalled.length > 0) {
    warnings.push(
      `Declared dependencies that are not installed: ${notInstalled.join(", ")}. A component package among them is not published or pinned by this import; run "npm install" first.`,
    );
  }

  for (const name of Object.keys(rootPackage?.devDependencies ?? {})) {
    const directory = await resolvePackageDirectory(root, name);
    const pkg = directory && (await readPackageJson(resolve(directory, "package.json")));
    if (isComponentPackage(pkg)) {
      warnings.push(
        `${name} is a component package listed under devDependencies; list it under "dependencies" so the import publishes and pins it.`,
      );
    }
  }
  return warnings;
};

export type DependencyPublishStatus =
  | "published"
  | "unchanged"
  | "public"
  | "not-built"
  | "timed-out"
  | "failed";

export interface DependencyPublishResult extends ComponentDependency {
  key?: string;
  signature?: string;
  isPublic?: boolean;
  status: DependencyPublishStatus;
  detail?: string;
}

const publishComponentDependency = async (
  dependency: ComponentDependency,
  wait?: WaitOptions,
): Promise<DependencyPublishResult> => {
  const platformEntrypoint = resolve(dependency.directory, dependency.platformEntrypoint);
  const distDirectory = dirname(platformEntrypoint);
  // The publish helpers load `<directory>/index.js` and zip that directory, the layout
  // `prism components:publish` builds; a marker naming any other file cannot be published.
  if (basename(platformEntrypoint) !== "index.js") {
    return {
      ...dependency,
      status: "failed",
      detail: `its "prismatic.component" marker names ${dependency.platformEntrypoint}, but the platform artifact must be the index.js of its bundle directory (what "npm run build" writes to dist/)`,
    };
  }
  if (!(await exists(platformEntrypoint))) {
    return {
      ...dependency,
      status: "not-built",
      detail: `the package has no dist/index.js; its "files" must include "dist" and its "prepare" script must run "npm run build"`,
    };
  }

  return withWorkingDirectory(distDirectory, async () => {
    const definition = await loadEntrypoint();
    const { key, public: isPublic = false } = definition;
    await validateDefinition(definition);
    const packagePath = await createComponentPackage();
    const signature = await calculatePackageSignature(packagePath);
    const existing = await findComponentBySignature(definition, signature);
    const result = { ...dependency, key, isPublic, signature };

    // Public artifacts must be published separately with a matching signature.
    if (!existing && isPublic) {
      return {
        ...result,
        status: "failed" as const,
        detail: `public component ${key} has no published version matching signature ${signature}`,
      };
    }

    const published = existing
      ? { componentId: existing.id, versionNumber: undefined }
      : await uploadComponentVersion(definition, packagePath, {
          comment: `Published by prism integrations:import from ${dependency.name}@${dependency.version}`,
        });
    const componentId = published.componentId;
    // A matching artifact may still be processing.
    if (
      !existing?.versionIsAvailable &&
      wait &&
      !(await waitForComponentVersion(componentId, wait))
    ) {
      return {
        ...result,
        status: "timed-out" as const,
        detail: `signature ${signature} is still processing after ${wait.timeoutSeconds} seconds; retry the import once it is available, or pass a larger --wait-timeout`,
      };
    }
    return {
      ...result,
      status: isPublic
        ? ("public" as const)
        : existing
          ? ("unchanged" as const)
          : ("published" as const),
      detail: existing ? undefined : `v${published.versionNumber}`,
    };
  });
};

/** Reuse matching signatures or publish private artifacts; return failures per dependency. */
export const publishComponentDependencies = async (
  root: string,
  wait?: WaitOptions,
): Promise<DependencyPublishResult[]> => {
  const dependencies = await findComponentDependencies(root);
  const results: DependencyPublishResult[] = [];
  for (const dependency of dependencies) {
    startAction(`Publishing component ${dependency.name}`);
    try {
      const result = await publishComponentDependency(dependency, wait);
      results.push(result);
      stopAction(describeResult(result));
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      results.push({ ...dependency, status: "failed", detail });
      stopAction(`failed: ${detail}`);
    }
  }
  return results;
};

export const describeResult = ({ status, detail, key }: DependencyPublishResult): string => {
  switch (status) {
    case "published":
      return `published ${key} ${detail ?? ""}`.trim();
    case "unchanged":
      return `${key} is already published with this signature`;
    case "public":
      return `${key} is a public component, nothing to publish`;
    case "not-built":
      return `skipped: ${detail}`;
    case "timed-out":
      return `timed out: ${detail}`;
    case "failed":
      return `failed: ${detail}`;
  }
};
