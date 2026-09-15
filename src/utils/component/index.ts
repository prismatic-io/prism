import { createRequire } from "node:module";
import { extname, resolve } from "node:path";
import type { Component as ComponentDefinitionTemplate } from "@prismatic-io/spectral/dist/serverTypes/index.js";
import { getWorkingDirectory } from "../../command-context.js";
import { CommandFailedError } from "../../errors.js";
import { exists } from "../../fs.js";
import { findPackageRoot, getPackageEntrypointDirectory } from "../import.js";
import { TOOLCHAIN_CONFIG_OUTPUTS } from "../toolchain/index.js";
import { createZip } from "../zip.js";

const require = createRequire(import.meta.url);

/** Type defining leftover legacy backwards compat keys. */
type LegacyDefinition = {
  authorization?: {
    required: boolean;
    methods: string[];
  };
};

/**
 * Superset of component definitions built from our current latest Spectral
 * definitions as well as legacy backwards compat for deprecated features.
 * Prism must be capable of publishing all past component definitions and
 * gracefully publish future component definitions.
 */
export type ComponentDefinition = Omit<ComponentDefinitionTemplate, "hooks"> &
  Pick<ComponentDefinitionTemplate, "documentationUrl"> &
  LegacyDefinition;

interface ComponentEntrypoint {
  default: ComponentDefinition;
}

export const loadEntrypoint = async (): Promise<ComponentDefinition> => {
  const directory = await getPackageEntrypointDirectory("component");
  const entrypointPath = resolve(directory, "index.js");
  if (!(await exists(entrypointPath)))
    throw new CommandFailedError({
      message: "Failed to find 'index.js' entrypoint file. Is the current path a component?",
    });
  const { default: definition }: ComponentEntrypoint = require(entrypointPath);
  return definition;
};

export const createComponentPackage = (): Promise<string> =>
  createZip((zip) => zip.addDirectory(getWorkingDirectory()));

export const createSourceCodePackage = async (): Promise<string> => {
  const sourceRoot = await findPackageRoot("component");

  let includePatterns: string[] = ["src"];
  try {
    const tsconfigPath = resolve(sourceRoot, "tsconfig.json");
    if (await exists(tsconfigPath)) {
      const tsconfigContent = await import(tsconfigPath, { with: { type: "json" } });
      if (tsconfigContent.default?.include && Array.isArray(tsconfigContent.default.include)) {
        includePatterns = tsconfigContent.default.include;
      }
    }
  } catch {
    // Fall back to default if tsconfig can't be read
  }

  // A component may have been generated with either toolchain, so include the
  // config files from both; the exists() guard below skips any that are absent.
  const essentialFiles = ["package.json", ...TOOLCHAIN_CONFIG_OUTPUTS];

  return createZip(async (zip) => {
    for (const file of essentialFiles) {
      const filePath = resolve(sourceRoot, file);
      if (await exists(filePath)) {
        zip.addFile(filePath, file);
      }
    }

    for (const pattern of includePatterns) {
      const dirPath = resolve(sourceRoot, pattern);
      if (await exists(dirPath)) {
        await zip.addDirectory(dirPath, pattern);
      }
    }
  });
};

export const validateDefinition = async (
  definition: ComponentDefinition,
  options: { forCodeNativeIntegration?: boolean } = {},
): Promise<void> => {
  // Output basic information to the user to confirm that this component is what they want to publish
  const {
    display: { label, description, iconPath },
    codeNativeIntegrationYAML,
    connections,
  } = definition;
  // Check for mistaken invocations, though an invoke from an actual CNI build context is valid.
  if (codeNativeIntegrationYAML && !options.forCodeNativeIntegration) {
    throw new CommandFailedError({
      message:
        "You are running a component command on what appears to be a Code Native Integration. Please check the current path.",
    });
  }
  if (!label || !description) {
    throw new CommandFailedError({
      message: "Missing required values `label` or `description`. Exiting.",
    });
  }

  const componentIconValid = await validateIcon(iconPath);
  if (!componentIconValid) {
    throw new CommandFailedError({
      message: "Component icon does not exist or is not a png. Exiting.",
    });
  }

  const connectionIconsValid = await Promise.all(
    (connections ?? []).map(({ iconPath, avatarIconPath }) => [
      validateIcon(iconPath),
      validateIcon(avatarIconPath),
    ]),
  );
  if (connectionIconsValid.some((v) => !v)) {
    throw new CommandFailedError({
      message: "One or more connection icons do not exist or are not a png. Exiting.",
    });
  }
};

const validateIcon = async (iconPath?: string): Promise<boolean> =>
  !iconPath ||
  (extname(iconPath.trim().toLowerCase()) === ".png" &&
    (await exists(resolve(getWorkingDirectory(), iconPath))));
