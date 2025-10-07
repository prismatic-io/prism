import chardet from "chardet";
import { ux } from "@oclif/core";
import { gqlRequest, gql } from "../../graphql.js";
import { uploadAvatar } from "../../utils/avatar.js";
import { exists, fs } from "../../fs.js";
import { resolve } from "path";
import { seekPackageDistDirectory } from "../import.js";
import {
  publishDefinition as publishComponentDefinition,
  uploadFile,
  uploadConnectionIcons,
} from "../component/publish.js";
import {
  ComponentDefinition,
  createComponentPackage,
  validateDefinition,
} from "../component/index.js";
import { getPrismMetadata, writePrismMetadata } from "./metadata.js";
import { loadYaml } from "../serialize.js";
import { IntegrationObjectFromYAML } from "../../generate/formats/writer/yaml/types.js";

interface ImportDefinitionResult {
  integrationId: string;
  flows: { id: string; name: string }[];
  pendingAuthorizations: { id: string; url: string }[];
  systemInstance: string;
}

interface Integration {
  id: string;
  flows: {
    nodes: {
      id: string;
      name: string;
    }[];
  };
  testConfigVariables: {
    nodes: {
      id: string;
      authorizeUrl: string;
    }[];
  };
  systemInstance: string;
}

export const importDefinition = async (
  definition: string,
  integrationId?: string,
  replace?: boolean,
): Promise<ImportDefinitionResult> => {
  const result = await gqlRequest({
    document: gql`
      mutation importIntegration($definition: String!, $integrationId: ID, $replace: Boolean) {
        importIntegration(
          input: { definition: $definition, integrationId: $integrationId, replace: $replace }
        ) {
          integration {
            id
            flows {
              nodes {
                id
                name
              }
            }
            testConfigVariables(status: "pending") {
              nodes {
                id
                authorizeUrl
              }
            }
            systemInstance
          }
          errors {
            field
            messages
          }
        }
      }
    `,
    variables: {
      definition,
      integrationId,
      replace,
    },
  });

  const integration: Integration = result.importIntegration.integration;
  return {
    integrationId: integration.id,
    flows: integration.flows.nodes,
    pendingAuthorizations: integration.testConfigVariables.nodes.map(
      ({ id, authorizeUrl: url }) => ({ id, url }),
    ),
    systemInstance: integration.systemInstance,
  };
};

const setIntegrationAvatar = async (integrationId: string, iconPath: string): Promise<void> => {
  try {
    const avatarUrl = await uploadAvatar(integrationId, iconPath);

    await gqlRequest({
      document: gql`
        mutation commitAvatarUpload($integrationId: ID!, $avatarUrl: String!) {
          updateIntegration(
            input: { id: $integrationId, avatarUrl: $avatarUrl }
          ) {
            integration {
              id
            }
            errors {
              field
              messages
            }
          }
        }
      `,
      variables: {
        integrationId,
        avatarUrl,
      },
    });
  } catch (err) {
    console.warn(`Error setting integration icon: ${err}`);
  }
};

export const importYamlIntegration = async (
  path: string,
  integrationId?: string,
  iconPath?: string,
  replace?: boolean,
): Promise<string> => {
  const definition = await extractYAMLFromPath(path);

  const { integrationId: integrationImportId, systemInstance } = await importDefinition(
    definition,
    integrationId,
    replace,
  );

  if (iconPath) {
    await setIntegrationAvatar(integrationImportId, iconPath);
  }

  return integrationImportId;
};

export const importCodeNativeIntegration = async (
  integrationId?: string,
  replace?: boolean,
  testApiKeyFlags?: string[],
): Promise<string> => {
  const { integrationDefinition, componentDefinition, publishingMetadata } =
    await loadCodeNativeIntegrationEntryPoint();

  // Parse CLI-provided test API keys
  const cliApiKeys = testApiKeyFlags ? parseTestApiKeys(testApiKeyFlags) : {};

  // Validate that all flows with customer required API keys have at least one key available
  if (publishingMetadata?.flowsWithCustomerRequiredAPIKeys.length) {
    for (const flow of publishingMetadata.flowsWithCustomerRequiredAPIKeys) {
      const existingKeys = flow.testApiKeys || [];
      const allKeysForFlow = [...existingKeys];

      // Add CLI keys for providers that this flow might need
      for (const [provider, keys] of Object.entries(cliApiKeys)) {
        allKeysForFlow.push(...keys);
      }

      if (allKeysForFlow.length === 0) {
        ux.error(
          `Flow "${flow.name}" requires customer API keys but none were provided. Use --test-api-key to specify keys in the format provider="API_KEY".`,
          { exit: 1 },
        );
      }
    }
  }

  if (!integrationDefinition) {
    ux.error(
      "Failed to find Code Native Integration definition in 'index.js' entrypoint file. Is the current path a Code Native Integration?",
      { exit: 1 },
    );
  }

  await validateDefinition(componentDefinition, { forCodeNativeIntegration: true });

  const packagePath = await createComponentPackage();

  const { iconUploadUrl, packageUploadUrl, connectionIconUploadUrls, versionNumber } =
    await publishComponentDefinition(componentDefinition, {
      forCodeNativeIntegration: true,
    });

  ux.action.start("Uploading package for Code Native Integration");
  await uploadFile(packagePath, packageUploadUrl);
  const uploaded = await waitForCodeNativeComponentAvailable(
    componentDefinition.key,
    versionNumber,
  );
  if (uploaded) {
    ux.action.stop();
  } else {
    ux.action.stop(
      "Package still processing for Code Native Integration, it will likely be available in a few minutes.",
    );
  }

  ux.action.start("Importing definition for Code Native Integration into Prismatic");
  const { integrationId: integrationImportId, flows } = await importDefinition(
    integrationDefinition,
    integrationId,
    replace,
  );

  const {
    display: { iconPath },
  } = componentDefinition;
  if (iconPath) {
    await uploadFile(iconPath, iconUploadUrl); // Component avatar.
    await setIntegrationAvatar(integrationImportId, iconPath); // Integration avatar.
  }
  await uploadConnectionIcons(componentDefinition, connectionIconUploadUrls);

  try {
    const metadata = await getPrismMetadata({ fromDist: true });
    await writePrismMetadata(
      { ...metadata, integrationId: integrationImportId },
      { fromDist: true },
    );
  } catch (e) {
    console.error("Import was successful but there was an error formatting local metadata:", e);
  }

  // Set test API keys, if they are present.
  if (
    publishingMetadata &&
    ((cliApiKeys && Object.keys(cliApiKeys).length > 0) ||
      publishingMetadata.flowsWithCustomerRequiredAPIKeys.some((flow) => flow.testApiKeys?.length))
  ) {
    ux.action.start("Setting test API keys for flows");
    try {
      await setTestApiKeysForFlows(flows, publishingMetadata, cliApiKeys);
      ux.action.stop();
    } catch (error) {
      ux.action.stop("Failed to set test API keys");
      console.warn("Warning: Could not set test API keys:", error);
    }
  }

  ux.action.stop();

  return integrationImportId;
};

// todo: move this to a better place (share type from spectral?)
interface PublishingMetadata {
  flowsWithCustomerRequiredAPIKeys: {
    name: string;
    // prism will error if this is not provided, but it can provided by an arg to prism invocation if you don't want it in source
    testApiKeys?: string[];
  }[];
}

interface ParsedApiKey {
  provider: string;
  key: string;
}

export const parseTestApiKeys = (testApiKeyFlags: string[]): Record<string, string[]> => {
  const parsedKeys: Record<string, string[]> = {};

  for (const flag of testApiKeyFlags) {
    // Parse format: provider="API_KEY"
    const match = flag.match(/^(\w+)="([^"]*)"$/);
    if (!match) {
      throw new Error(
        `Invalid --test-api-key format: "${flag}". Expected format: provider="API_KEY"`,
      );
    }

    const [, provider, key] = match;
    if (!key) {
      throw new Error(`Empty API key provided for provider "${provider}"`);
    }

    if (!parsedKeys[provider]) {
      parsedKeys[provider] = [];
    }
    parsedKeys[provider].push(key);
  }

  return parsedKeys;
};

const setTestApiKeysForFlows = async (
  flows: { id: string; name: string }[],
  publishingMetadata: PublishingMetadata,
  cliApiKeys: Record<string, string[]>,
): Promise<void> => {
  if (!publishingMetadata?.flowsWithCustomerRequiredAPIKeys.length) {
    return;
  }

  for (const metadataFlow of publishingMetadata.flowsWithCustomerRequiredAPIKeys) {
    // Find the corresponding imported flow by name
    const importedFlow = flows.find((flow) => flow.name === metadataFlow.name);
    if (!importedFlow) {
      console.warn(`Could not find imported flow "${metadataFlow.name}" to set API keys`);
      continue;
    }

    // Combine existing keys from metadata with CLI keys
    const existingKeys = metadataFlow.testApiKeys || [];
    const allKeysForFlow = [...existingKeys];

    // Add CLI keys for all providers
    for (const keys of Object.values(cliApiKeys)) {
      allKeysForFlow.push(...keys);
    }

    if (allKeysForFlow.length > 0) {
      await setFlowTestApiKeys(importedFlow.id, allKeysForFlow);
    }
  }
};

//todo: pass in system instance here. fix gql
const setFlowTestApiKeys = async (flowId: string, apiKeys: string[]): Promise<void> => {
  const result = await gqlRequest({
    document: gql`
      mutation saveTestApiKey(
  $instanceId: ID!
  $flowConfigs: [InputInstanceFlowConfig]
) {
  updateInstance(
    input: {
      id: $instanceId
      flowConfigs: $flowConfigs
      configMode: "INSTANCE"
    }
  ) {
    instance {
      id
      flowConfigs {
        nodes {
          id
          apiKeys
          flow {
            id
            name
            __typename
          }
          __typename
        }
        __typename
      }
      __typename
    }
    errors {
      field
      messages
      __typename
    }
    __typename
  }
}`,
  });

  if (result.updateIntegrationFlow.errors?.length) {
    throw new Error(
      `Failed to set test API keys for flow ${flowId}: ${result.updateIntegrationFlow.errors
        .map((e: { messages: string[] }) => e.messages.join(", "))
        .join("; ")}`,
    );
  }
};
interface CodeNativeIntegrationEntrypoint {
  default: ComponentDefinition & {
    codeNativeIntegrationYAML: string;
    publishingMetadata?: PublishingMetadata;
  };
}

export const loadCodeNativeIntegrationEntryPoint = async (): Promise<{
  integrationDefinition: string;
  componentDefinition: ComponentDefinition;
  publishingMetadata?: PublishingMetadata;
}> => {
  // If we don't have an index.js in cwd seek directories to find package.json of Code Native Integration
  if (!(await exists("index.js"))) {
    await seekPackageDistDirectory("Code Native Integration");
  }

  // If we still didn't find index.js error out
  if (!(await exists("index.js"))) {
    ux.error(
      "Failed to find 'index.js' entrypoint file. Is the current path a Code Native Integration?",
      { exit: 1 },
    );
  }

  // Require index.js and access its root-most default export which should contain the YAML definition.
  const cwd = process.cwd();
  const entrypointPath = resolve(cwd, "./index.js");
  const { default: componentDefinition }: CodeNativeIntegrationEntrypoint = require(entrypointPath);

  return {
    integrationDefinition: componentDefinition.codeNativeIntegrationYAML,
    componentDefinition: componentDefinition,
    publishingMetadata: componentDefinition.publishingMetadata,
  };
};

export const waitForCodeNativeComponentAvailable = async (
  componentKey: string,
  versionNumber: string,
  attemptNumber = 0,
  maximumAttempts = 10,
): Promise<boolean> => {
  // Retrieve the current availability status.
  const results = await gqlRequest({
    document: gql`
      query component($componentKey: String!, $versionNumber: Int!) {
        components(
          key: $componentKey
          versionNumber: $versionNumber
          public: false
          includeComponentsForCodeNativeIntegrations: true
        ) {
          nodes {
            versionIsAvailable
          }
        }
      }
    `,
    variables: {
      componentKey,
      versionNumber,
    },
  });

  const {
    components: {
      nodes: [{ versionIsAvailable }],
    },
  } = results;

  if (versionIsAvailable) {
    // Component is ready.
    return versionIsAvailable;
  } else if (attemptNumber < maximumAttempts) {
    // Wait 1 second and try again.
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return waitForCodeNativeComponentAvailable(
      componentKey,
      versionNumber,
      attemptNumber + 1,
      maximumAttempts,
    );
  }

  // Component is still not ready, so bail out.
  return false;
};

export const getIntegrationDefinition = async (integrationId: string): Promise<string> => {
  const result = await gqlRequest({
    document: gql`
      query integration($integrationId: ID!) {
        integration(id: $integrationId) {
          definition
        }
      }
    `,
    variables: { integrationId },
  });
  return result.integration.definition;
};

export const compareConfigVars = async (current: string, next: string): Promise<Array<string>> => {
  const currentDef: IntegrationObjectFromYAML = await loadYaml(current);
  const nextDef: IntegrationObjectFromYAML = await loadYaml(next);

  const requiredMatches: Record<string, boolean> = {};
  // The current definition contains the absolutely required config vars.
  currentDef.configPages.forEach((page) => {
    page.elements.forEach((element) => {
      requiredMatches[element.value] = false;
    });
  });

  // It's OK for the new integration to have a superset of the required config vars.
  nextDef.configPages.forEach((page) => {
    page.elements.forEach((element) => {
      requiredMatches[element.value] = true;
    });
  });

  // Return missing config vars.
  return Object.entries(requiredMatches)
    .filter(([key, match]) => !match)
    .map(([key]) => key);
};

export const extractYAMLFromPath = async (path: string): Promise<string> => {
  const encoding = await chardet.detectFile(path);
  const definition = await fs.readFile(path, encoding === "UTF-16LE" ? "utf16le" : "utf-8");
  return definition;
};
