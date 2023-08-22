import { ux } from "@oclif/core";
import { exists, fs } from "../../fs";
import { resolve, extname } from "path";
import { ComponentDefinition as ComponentDefinitionTemplate } from "@prismatic-io/spectral";
import tempy from "tempy";
import crypto from "crypto";
import archiver from "archiver";
import { gqlRequest, gql } from "../../graphql";
import axios from "axios";
import mimetypes from "mime-types";

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
type ComponentDefinition = Omit<ComponentDefinitionTemplate<false>, "hooks"> &
  Pick<ComponentDefinitionTemplate<true>, "documentationUrl"> &
  LegacyDefinition;

const componentDefinitionShape: Record<keyof ComponentDefinition, true> = {
  actions: true,
  authorization: true,
  connections: true,
  dataSources: true,
  display: true,
  documentationUrl: true,
  key: true,
  public: true,
  triggers: true,
};

interface ComponentEntrypoint {
  default: ComponentDefinition;
}

export const seekComponentPackageDistDirectory = async (): Promise<void> => {
  while (!(await exists("package.json"))) {
    const tempDir = process.cwd();
    process.chdir("../");
    if (process.cwd() == tempDir) {
      ux.error(
        "Failed to find 'package.json' file. Is the current path a component?",
        { exit: 1 }
      );
    }
  }

  if (!(await exists("./dist"))) {
    ux.error("Failed to find 'dist' folder. Is the current path a component?", {
      exit: 1,
    });
  }

  process.chdir("./dist");
};

export const loadEntrypoint = async (): Promise<ComponentDefinition> => {
  // If we don't have an index.js in cwd seek directories to find package.json of component
  if (!(await exists("index.js"))) {
    await seekComponentPackageDistDirectory();
  }

  // If we still didn't find index.js error out
  if (!(await exists("index.js"))) {
    ux.error(
      "Failed to find 'index.js' entrypoint file. Is the current path a component?",
      { exit: 1 }
    );
  }

  // Require index.js and access its root-most default export which should be the Component config
  const cwd = process.cwd();
  const entrypointPath = resolve(cwd, "./index.js");
  const { default: definition }: ComponentEntrypoint = require(entrypointPath); // eslint-disable-line @typescript-eslint/no-var-requires

  return definition;
};

const validateIcon = async (iconPath?: string): Promise<boolean> =>
  !iconPath ||
  (extname(iconPath.trim().toLowerCase()) === ".png" &&
    (await exists(iconPath)));

export const validateDefinition = async (
  definition: ComponentDefinition
): Promise<void> => {
  // Output basic information to the user to confirm that this component is what they want to publish
  const {
    display: { label, description, iconPath },
    connections,
  } = definition;
  if (!label || !description) {
    ux.error("Missing required values `label` or `description`. Exiting.", {
      exit: 1,
    });
  }

  const componentIconValid = await validateIcon(iconPath);
  if (!componentIconValid) {
    ux.error(`Component icon does not exist or is not a png. Exiting.`, {
      exit: 1,
    });
  }

  const connectionIconsValid = await Promise.all(
    (connections ?? []).map(({ iconPath }) => validateIcon(iconPath))
  );
  if (connectionIconsValid.some((v) => !v)) {
    ux.error(
      `One or more connection icons do not exist or are not a png. Exiting.`,
      {
        exit: 1,
      }
    );
  }
};

export const createComponentPackage = async (): Promise<string> => {
  const zip = archiver("zip", { zlib: { level: 9 } });
  const pathPromise = tempy.write(zip, { extension: "zip" });

  // Zip all files in the current directory (since we found the index.js entrypoint)
  zip.directory(process.cwd(), false);
  await zip.finalize();

  return pathPromise;
};

export const checkPackageSignature = async (
  { key, public: isPublic }: ComponentDefinition,
  packagePath: string,
  customer?: string
): Promise<boolean> => {
  // Retrieve the existing signature of the component if it exists.
  const results = await gqlRequest({
    document: gql`
      query component($key: String!, $public: Boolean!, $customer: ID) {
        components(key: $key, public: $public, customer: $customer) {
          nodes {
            signature
          }
        }
      }
    `,
    variables: {
      key,
      public: isPublic ?? false,
      customer,
    },
  });

  const {
    components: {
      nodes: [{ signature: existingSignature } = { signature: null }],
    },
  } = results;

  // Generate the signature of the package so we may compare it against the existing one.
  const packageSignature = crypto
    .createHash("sha1")
    .update(await fs.readFile(packagePath))
    .digest("hex");

  return existingSignature === packageSignature;
};

export const confirmPublish = async (
  { display: { label, description } }: ComponentDefinition,
  confirm = true
) => {
  if (!confirm) return;

  ux.log(label, "-", description);

  const continuePublish = await ux.confirm(
    `Would you like to publish ${label}? (y/N)`
  );
  if (!continuePublish) ux.exit(0);
};

export const publishDefinition = async (
  { actions, triggers, dataSources, connections, ...rest }: ComponentDefinition,
  comment?: string,
  customer?: string
): Promise<{
  iconUploadUrl: string;
  packageUploadUrl: string;
  connectionIconUploadUrls: Record<string, string>;
  versionNumber: string;
}> => {
  const componentDefinition = Object.entries(rest).reduce(
    (result, [key, value]) =>
      componentDefinitionShape[key as keyof ComponentDefinition]
        ? { ...result, [key]: value }
        : result,
    {}
  );

  const actionDefinitions = Object.values(actions || {}).map((action) => {
    return {
      ...action,
      examplePayload: action?.examplePayload
        ? JSON.stringify(action?.examplePayload)
        : JSON.stringify({}),
    };
  });

  const triggerDefinitions = Object.values(triggers || {}).map((trigger) => {
    return {
      ...trigger,
      examplePayload: trigger?.examplePayload
        ? JSON.stringify(trigger?.examplePayload)
        : JSON.stringify({}),
    };
  });

  const dataSourceDefinitions = Object.values(dataSources || {}).map(
    (dataSource) => {
      return {
        ...dataSource,
        examplePayload: dataSource?.examplePayload
          ? JSON.stringify(dataSource?.examplePayload)
          : JSON.stringify({}),
      };
    }
  );

  const connectionDefinitions = connections || [];

  // Initiate start of the publish procedure by sending config data and receive back presigned s3 URL
  const result = await gqlRequest({
    document: gql`
      mutation publishComponent(
        $definition: ComponentDefinitionInput!
        $actions: [ActionDefinitionInput]!
        $triggers: [TriggerDefinitionInput]
        $dataSources: [DataSourceDefinitionInput]
        $connections: [ConnectionDefinitionInput]
        $comment: String
        $customer: ID
      ) {
        publishComponent(
          input: {
            definition: $definition
            actions: $actions
            triggers: $triggers
            dataSources: $dataSources
            connections: $connections
            comment: $comment
            customer: $customer
          }
        ) {
          publishResult {
            component {
              id
              versionNumber
            }
            iconUploadUrl
            packageUploadUrl
            connectionIconUploadUrls {
              connectionKey
              iconUploadUrl
            }
          }
          errors {
            field
            messages
          }
        }
      }
    `,
    variables: {
      definition: componentDefinition,
      actions: actionDefinitions,
      triggers: triggerDefinitions,
      dataSources: dataSourceDefinitions,
      connections: connectionDefinitions,
      comment,
      customer,
    },
  });

  const {
    iconUploadUrl,
    packageUploadUrl,
    connectionIconUploadUrls,
    component: { versionNumber },
  } = result.publishComponent.publishResult;

  const uploadUrls = (
    connectionIconUploadUrls as {
      connectionKey: string;
      iconUploadUrl: string;
    }[]
  ).reduce<Record<string, string>>(
    (result, { connectionKey, iconUploadUrl }) => ({
      ...result,
      [connectionKey]: iconUploadUrl,
    }),
    {}
  );

  return {
    iconUploadUrl,
    packageUploadUrl,
    connectionIconUploadUrls: uploadUrls,
    versionNumber,
  };
};

export const uploadFile = async (filePath: string, destinationUrl: string) => {
  try {
    // TODO: Stream instead of Buffer.
    const response = await axios.put(
      destinationUrl,
      await fs.readFile(filePath),
      { headers: { "Content-Type": mimetypes.contentType(extname(filePath)) } }
    );
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const { message } = error;
      throw new Error(message);
    }
    throw error;
  }
};

export const uploadConnectionIcons = async (
  { connections }: ComponentDefinition,
  connectionIconUploadUrls: Record<string, string>
): Promise<void> => {
  if (
    !connections ||
    !connections.length ||
    !connectionIconUploadUrls ||
    !Object.keys(connectionIconUploadUrls).length
  ) {
    return;
  }

  const iconPaths = connections.reduce<Record<string, string>>(
    (result, { key, iconPath }) => {
      if (!iconPath) {
        return result;
      }
      return {
        ...result,
        [key]: iconPath,
      };
    },
    {}
  );

  const promises = Object.entries(connectionIconUploadUrls).map(
    async ([connectionKey, uploadUrl]) =>
      uploadFile(iconPaths[connectionKey], uploadUrl)
  );
  await Promise.all(promises);
};
