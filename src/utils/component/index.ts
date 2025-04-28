import { Component as ComponentDefinitionTemplate } from "@prismatic-io/spectral/dist/serverTypes";
import { ux } from "@oclif/core";
import { resolve } from "path";
import tempy from "tempy";
import archiver from "archiver";
import { extname } from "path";

import { seekPackageDistDirectory } from "../import.js";
import { exists } from "../../fs.js";

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
  // If we don't have an index.js in cwd seek directories to find package.json of component
  if (!(await exists("index.js"))) {
    await seekPackageDistDirectory("component");
  }

  // If we still didn't find index.js error out
  if (!(await exists("index.js"))) {
    ux.error("Failed to find 'index.js' entrypoint file. Is the current path a component?", {
      exit: 1,
    });
  }

  // Require index.js and access its root-most default export which should be the Component config
  const cwd = process.cwd();
  const entrypointPath = resolve(cwd, "./index.js");
  const { default: definition }: ComponentEntrypoint = require(entrypointPath);

  return definition;
};

export const createComponentPackage = async (): Promise<string> => {
  const zip = archiver("zip", { zlib: { level: 9 } });
  const pathPromise = tempy.write(zip, { extension: "zip" });

  // Zip all files in the current directory (since we found the index.js entrypoint)
  // Set all files' dates to the Unix epoch so that the zip hash is deterministic
  zip.directory(process.cwd(), false, (entry) => ({
    ...entry,
    date: new Date(0),
  }));
  await zip.finalize();

  return pathPromise;
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
    ux.error(
      "You are running a component command on what appears to be a Code Native Integration. Please check the current path.",
      {
        exit: 1,
      },
    );
  }
  if (!label || !description) {
    ux.error("Missing required values `label` or `description`. Exiting.", {
      exit: 1,
    });
  }

  const componentIconValid = await validateIcon(iconPath);
  if (!componentIconValid) {
    ux.error("Component icon does not exist or is not a png. Exiting.", {
      exit: 1,
    });
  }

  const connectionIconsValid = await Promise.all(
    (connections ?? []).map(({ iconPath, avatarIconPath }) => [
      validateIcon(iconPath),
      validateIcon(avatarIconPath),
    ]),
  );
  if (connectionIconsValid.some((v) => !v)) {
    ux.error("One or more connection icons do not exist or are not a png. Exiting.", {
      exit: 1,
    });
  }
};

const validateIcon = async (iconPath?: string): Promise<boolean> =>
  !iconPath || (extname(iconPath.trim().toLowerCase()) === ".png" && (await exists(iconPath)));
