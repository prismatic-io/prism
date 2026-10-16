import { createRequire } from "node:module";
import { basename, dirname, resolve } from "node:path";
import { z } from "zod";
import { withWorkingDirectory } from "../../command-context.js";
import { CommandFailedError } from "../../errors.js";
import { exists, fs } from "../../fs.js";
import { type WaitOptions, waitForComponentVersion } from "../availability.js";
import { startAction, stopAction } from "../progress.js";
import { createComponentPackage, loadEntrypoint, validateDefinition } from "./index.js";
import { checkPackageSignature, uploadComponentVersion } from "./publish.js";

/**
 * `prism components:init` marks the package.json of every component it scaffolds with
 * `"prismatic": { "component": "./dist/index.js" }`, which is how a code-native integration's
 * dependencies are told apart from ordinary packages.
 */
export const COMPONENT_PACKAGE_MARKER = { component: "./dist/index.js" } as const;

/**
 * The marker that makes a package a component package: the package-relative path of its
 * platform bundle. Anything else under `prismatic`, or a marker that is not a non-empty
 * string, leaves the package an ordinary dependency.
 */
export const ComponentMarkerSchema = z.object({ component: z.string().min(1) });

/**
 * The fields read from an installed dependency's package.json. Third-party packages are not
 * held to any shape: a field that is not what discovery expects reads as absent rather than
 * failing the import over a package that has nothing to do with Prismatic.
 */
const InstalledPackageSchema = z.looseObject({
  name: z.string().optional().catch(undefined),
  version: z.string().optional().catch(undefined),
  prismatic: z.unknown().optional(),
});

/**
 * The fields read from the integration's own package.json. These are the author's, so a
 * malformed dependency list fails with a message instead of being skipped silently.
 */
const IntegrationPackageSchema = z.looseObject({
  dependencies: z.record(z.string(), z.string()).optional(),
  devDependencies: z.record(z.string(), z.string()).optional(),
});

export const isComponentPackage = (pkg: unknown): boolean =>
  ComponentMarkerSchema.safeParse((pkg as { prismatic?: unknown } | null)?.prismatic).success;

export interface ComponentDependency {
  /** The npm package name, as it appears in the integration's dependencies. */
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

/**
 * Where `name` is installed, as seen from the package at `root`: Node's own resolution, so a
 * dependency hoisted to an ancestor node_modules (npm, Bun and Yarn workspaces) is found as
 * well as one installed locally. Undefined when it is not installed at all.
 */
const resolvePackageDirectory = async (root: string, name: string): Promise<string | undefined> => {
  const require = createRequire(resolve(root, "package.json"));
  try {
    return dirname(require.resolve(`${name}/package.json`));
  } catch {
    // A package whose `exports` map does not expose package.json: resolve its entrypoint and
    // walk up to the directory whose package.json carries its name.
  }
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

/**
 * The installed direct dependencies of the package at `root` that are Prismatic components
 * (see {@link COMPONENT_PACKAGE_MARKER}), resolved the way Node resolves them from `root`, so
 * hoisted workspace installs count. Dependencies that are not installed are ignored.
 */
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

/**
 * What the integration at `root` declares that the import cannot act on: dependencies that are
 * not installed (a component package among them would go unpublished and unpinned), and
 * component packages listed under devDependencies, which bundle into the integration like any
 * import but are not treated as dependencies. Returned as warnings for the import to report.
 */
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
  isPublic?: boolean;
  status: DependencyPublishStatus;
  detail?: string;
}

/**
 * Publish one component dependency from the platform bundle (`dist/`) shipped in its
 * package, the same way `prism components:publish` does from a component checkout: the
 * bundle directory becomes the working directory, because the publish helpers resolve the
 * entrypoint, icon and zip relative to it.
 */
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
    // A public component is Prismatic's to publish, never this import's.
    if (isPublic) return { ...dependency, key, isPublic, status: "public" as const };

    // As `prism components:publish --skip-on-signature-match`: a package identical to the
    // latest published version is not published again. The import then leaves its references
    // at LATEST, and the platform resolves LATEST to the newest available version on import.
    const packagePath = await createComponentPackage();
    if (await checkPackageSignature(definition, packagePath)) {
      return { ...dependency, key, isPublic, status: "unchanged" as const };
    }

    const { componentId, versionNumber } = await uploadComponentVersion(definition, packagePath, {
      comment: `Published by prism integrations:import from ${dependency.name}@${dependency.version}`,
    });
    // Waited for so LATEST resolves to this version when the integration is imported.
    if (wait && !(await waitForComponentVersion(componentId, wait))) {
      return {
        ...dependency,
        key,
        isPublic,
        status: "timed-out" as const,
        detail: `v${versionNumber} was published and is still processing after ${wait.timeoutSeconds} seconds; retry the import once it is available, or pass a larger --wait-timeout`,
      };
    }
    return {
      ...dependency,
      key,
      isPublic,
      status: "published" as const,
      detail: `v${versionNumber}`,
    };
  });
};

/**
 * Publish every private component the code-native integration at `root` depends on, so the
 * components exist on the platform (for their connections and the low-code designer)
 * without a separate `publish:platform` step. A package matching the latest published
 * signature, and a public component, are left alone. A component that fails to publish, or whose
 * published version is not available within the wait, does not stop the others; it is
 * reported in its result for the caller to act on.
 */
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
