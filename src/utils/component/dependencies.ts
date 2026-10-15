import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { getWorkingDirectory, withWorkingDirectory } from "../../command-context.js";
import { exists, fs } from "../../fs.js";
import { type WaitOptions, waitForComponentVersion } from "../availability.js";
import { startAction, stopAction } from "../progress.js";
import { createComponentPackage, loadEntrypoint, validateDefinition } from "./index.js";
import {
  getPackageSignatureMatch,
  publishDefinition,
  uploadConnectionIcons,
  uploadFile,
} from "./publish.js";

/**
 * `prism components:init` marks the package.json of every component it scaffolds with
 * `"prismatic": { "component": "./dist/index.js" }`, which is how a code-native integration's
 * dependencies are told apart from ordinary packages.
 */
export const COMPONENT_PACKAGE_MARKER = { component: "./dist/index.js" } as const;

interface PackageJson {
  name?: string;
  version?: string;
  dependencies?: Record<string, string>;
  prismatic?: { component?: boolean | string };
}

export const isComponentPackage = (pkg: unknown): pkg is PackageJson =>
  typeof pkg === "object" &&
  pkg !== null &&
  ((pkg as PackageJson).prismatic?.component === true ||
    typeof (pkg as PackageJson).prismatic?.component === "string");

export interface ComponentDependency {
  /** The npm package name, as it appears in the integration's dependencies. */
  name: string;
  version: string;
  /** Absolute path of the installed package. */
  directory: string;
  /** Package-relative entrypoint containing the self-contained platform artifact. */
  platformEntrypoint: string;
}

const readPackageJson = async (path: string): Promise<PackageJson | undefined> =>
  (await exists(path)) ? (JSON.parse(await fs.readFile(path, "utf-8")) as PackageJson) : undefined;

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
  const rootPackage = await readPackageJson(resolve(root, "package.json"));
  const found: ComponentDependency[] = [];
  for (const name of Object.keys(rootPackage?.dependencies ?? {})) {
    const directory = await resolvePackageDirectory(root, name);
    if (!directory) continue;
    const pkg = await readPackageJson(resolve(directory, "package.json"));
    if (isComponentPackage(pkg)) {
      found.push({
        name,
        version: pkg.version ?? "",
        directory,
        platformEntrypoint:
          typeof pkg.prismatic?.component === "string"
            ? pkg.prismatic.component
            : "./dist/index.js",
      });
    }
  }
  return found;
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
  versionNumber?: number;
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
    const signatureMatch = await getPackageSignatureMatch(definition, packagePath);
    if (signatureMatch.matches && signatureMatch.versionNumber !== undefined) {
      return {
        ...dependency,
        key,
        isPublic,
        versionNumber: signatureMatch.versionNumber,
        status: isPublic ? ("public" as const) : ("unchanged" as const),
      };
    }
    if (isPublic) {
      return {
        ...dependency,
        key,
        isPublic,
        status: "failed" as const,
        detail: `the installed package ${dependency.name}@${dependency.version} does not match the latest published platform version`,
      };
    }

    const {
      componentId,
      iconUploadUrl,
      packageUploadUrl,
      connectionIconUploadUrls,
      versionNumber,
    } = await publishDefinition(definition, {
      comment: `Published by prism integrations:import from ${dependency.name}@${dependency.version}`,
    });
    await uploadFile(packagePath, packageUploadUrl);
    if (definition.display.iconPath) {
      await uploadFile(resolve(getWorkingDirectory(), definition.display.iconPath), iconUploadUrl);
    }
    await uploadConnectionIcons(definition, connectionIconUploadUrls);

    if (wait && !(await waitForComponentVersion(componentId, wait))) {
      // The version was submitted but is not usable yet; importing now would race it.
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
      versionNumber,
      detail: `v${versionNumber}`,
    };
  });
};

/**
 * Publish every private component the code-native integration at `root` depends on, so the
 * components exist on the platform (for shared connections and the low-code designer)
 * without a separate `publish:platform` step. Unchanged components (matching signature)
 * and public components are left alone. A component that fails to publish, or whose
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
