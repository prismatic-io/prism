import { ImportIntegrationDocument as IMPORT_INTEGRATION } from "../../graphql/operations/importIntegration.generated.js";
import { CommitAvatarUpload2Document as COMMIT_AVATAR_UPLOAD2 } from "../../graphql/operations/commitAvatarUpload2.generated.js";
import { SetInstanceApiKeysDocument as SET_INSTANCE_API_KEYS } from "../../graphql/operations/setInstanceApiKeys.generated.js";
import { Component4Document as COMPONENT4 } from "../../graphql/operations/component4.generated.js";
import { Integration2Document as INTEGRATION2 } from "../../graphql/operations/integration2.generated.js";
import chardet from "chardet";
import { ux } from "../ux.js";
import { createRequire } from "node:module";
import { gqlRequest } from "../../graphql.js";
import { uploadAvatar } from "../../utils/avatar.js";
import { exists, fs } from "../../fs.js";
import { resolve } from "path";
import { getPackageEntrypointDirectory } from "../import.js";
import {
  publishDefinition as publishComponentDefinition,
  uploadFile,
  uploadConnectionIcons,
} from "../component/publish.js";
import {
  type ComponentDefinition,
  createComponentPackage,
  validateDefinition,
} from "../component/index.js";
import { getPrismMetadata, writePrismMetadata } from "./metadata.js";
import { loadYaml } from "../serialize.js";
import { writeCommandOutput } from "../../command.js";
import type { IntegrationObjectFromYAML } from "./types.js";

const require = createRequire(import.meta.url);

interface ImportDefinitionResult {
  integrationId: string;
  pendingAuthorizations: { id: string; url: string }[];
  systemInstance: Integration["systemInstance"];
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
  systemInstance: {
    id: string;
    flowConfigs: {
      nodes: Array<{
        id: string;
        flow: {
          id: string;
          name: string;
        };
        apiKeys: string[];
      }>;
    };
  };
}

export const importDefinition = async (
  definition: string,
  integrationId?: string,
  replace?: boolean,
): Promise<ImportDefinitionResult> => {
  const result = await gqlRequest({
    document: IMPORT_INTEGRATION,
    variables: {
      definition,
      integrationId,
      replace,
    },
  });

  const integration = result.importIntegration?.integration;
  if (!integration) {
    throw new Error("Failed to import integration");
  }
  return {
    integrationId: integration.id,
    pendingAuthorizations: integration.testConfigVariables.nodes.flatMap(({ id, authorizeUrl }) =>
      authorizeUrl ? [{ id, url: authorizeUrl }] : [],
    ),
    systemInstance: {
      ...integration.systemInstance,
      flowConfigs: {
        nodes: integration.systemInstance.flowConfigs.nodes.map((flowConfig) => ({
          ...flowConfig,
          apiKeys: flowConfig.apiKeys?.filter((key): key is string => key !== null) ?? [],
        })),
      },
    },
  };
};

const setIntegrationAvatar = async (integrationId: string, iconPath: string): Promise<void> => {
  try {
    const avatarUrl = await uploadAvatar(integrationId, iconPath);

    await gqlRequest({
      document: COMMIT_AVATAR_UPLOAD2,
      variables: {
        integrationId,
        avatarUrl,
      },
    });
  } catch (err) {
    writeCommandOutput(`Error setting integration icon: ${err}`, "stderr");
  }
};

export const importYamlIntegration = async (
  path: string,
  integrationId?: string,
  iconPath?: string,
  replace?: boolean,
): Promise<string> => {
  const definition = await extractYAMLFromPath(path);

  // biome-ignore lint/correctness/noUnusedVariables: TODO
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
  const { integrationDefinition, componentDefinition, publishingMetadata, directory } =
    await loadCodeNativeIntegrationEntryPoint();

  await validateDefinition(componentDefinition, {
    forCodeNativeIntegration: true,
    cwd: directory,
  });

  // Parse CLI-provided test API keys
  const cliApiKeys = testApiKeyFlags ? parseTestApiKeys(testApiKeyFlags) : {};

  // Validate that all flows with customer required API keys have at least one key available
  if (publishingMetadata?.flowsWithCustomerRequiredAPIKeys.length) {
    for (const flow of publishingMetadata.flowsWithCustomerRequiredAPIKeys) {
      const existingKeys = flow.testApiKeys || [];
      const allKeysForFlow = [...existingKeys];

      // Add CLI keys for providers that this flow might need
      // biome-ignore lint/correctness/noUnusedVariables: TODO
      for (const [provider, keys] of Object.entries(cliApiKeys)) {
        allKeysForFlow.push(...keys);
      }

      if (allKeysForFlow.length === 0) {
        ux.error(
          `Flow "${flow.name}" requires customer API keys but none were provided. Use --test-api-key to specify keys in the format flowName="API_KEY".`,
          { exit: 1 },
        );
      }
    }
  }

  const packagePath = await createComponentPackage(directory);

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
  const { integrationId: integrationImportId, systemInstance } = await importDefinition(
    integrationDefinition,
    integrationId,
    replace,
  );

  const {
    display: { iconPath },
  } = componentDefinition;
  if (iconPath) {
    await uploadFile(resolve(directory, iconPath), iconUploadUrl); // Component avatar.
    await setIntegrationAvatar(integrationImportId, resolve(directory, iconPath)); // Integration avatar.
  }
  await uploadConnectionIcons(componentDefinition, connectionIconUploadUrls, directory);

  try {
    const metadata = await getPrismMetadata({ fromDist: true, cwd: directory });
    await writePrismMetadata(
      { ...metadata, integrationId: integrationImportId },
      { fromDist: true, cwd: directory },
    );
  } catch (e) {
    writeCommandOutput(
      `Import was successful but there was an error formatting local metadata: ${e}`,
      "stderr",
    );
  }

  // Set test API keys, if they are present.
  if (
    publishingMetadata &&
    ((cliApiKeys && Object.keys(cliApiKeys).length > 0) ||
      publishingMetadata.flowsWithCustomerRequiredAPIKeys.some((flow) => flow.testApiKeys?.length))
  ) {
    ux.action.start("Setting test API keys for flows");
    try {
      await setTestApiKeysForFlows({
        systemInstance,
        publishingMetadata,
        cliApiKeys,
      });
      ux.action.stop();
    } catch (error) {
      ux.action.stop("Failed to set test API keys");
      writeCommandOutput(`Warning: Could not set test API keys: ${error}`, "stderr");
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

// biome-ignore lint/correctness/noUnusedVariables: TODO
interface ParsedApiKey {
  provider: string;
  key: string;
}

export const parseTestApiKeys = (testApiKeyFlags: string[]): Record<string, string[]> => {
  const parsedKeys: Record<string, string[]> = {};

  for (const flag of testApiKeyFlags) {
    // Parse format: flowName="API_KEY" or "Flow Name"="API_KEY"
    const match = flag.match(/^(?:"([^"]+)"|(\w+))="([^"]*)"$/);
    if (!match) {
      throw new Error(
        `Invalid --test-api-key format: "${flag}". Expected format: flowName="API_KEY" or "Flow Name"="API_KEY"`,
      );
    }

    const [, quotedProvider, unquotedProvider, key] = match;
    const provider = quotedProvider || unquotedProvider;
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

interface SetTestApiKeysForFlowsParams {
  systemInstance: Integration["systemInstance"];
  publishingMetadata: PublishingMetadata;
  cliApiKeys: Record<string, string[]>;
}

const setTestApiKeysForFlows = async ({
  systemInstance,
  publishingMetadata,
  cliApiKeys,
}: SetTestApiKeysForFlowsParams): Promise<void> => {
  if (!publishingMetadata?.flowsWithCustomerRequiredAPIKeys.length) {
    return;
  }

  const flowConfigs: Array<{
    flowId: string;
    apiKeys: string[];
  }> = [];

  for (const metadataFlow of publishingMetadata.flowsWithCustomerRequiredAPIKeys) {
    // Find the corresponding imported flow by name
    const importedFlowConfig = systemInstance.flowConfigs.nodes.find(
      (flowConfig) => flowConfig.flow.name === metadataFlow.name,
    );
    if (!importedFlowConfig) {
      writeCommandOutput(
        `Could not find imported flow "${metadataFlow.name}" to set API keys`,
        "stderr",
      );
      continue;
    }

    const apiKeys = metadataFlow.testApiKeys ?? [];
    for (const cliApiKey of cliApiKeys[metadataFlow.name] ?? []) {
      apiKeys.push(cliApiKey);
    }

    flowConfigs.push({
      flowId: importedFlowConfig.flow.id,
      apiKeys,
    });
  }

  await setFlowTestApiKeys({ instanceId: systemInstance.id, flowConfigs });
};

interface SetFlowTestApiKeysParams {
  instanceId: string;
  flowConfigs: Array<{
    flowId: string;
    apiKeys: string[];
  }>;
}
//todo: pass in system instance here. fix gql
const setFlowTestApiKeys = async ({
  instanceId,
  flowConfigs,
}: SetFlowTestApiKeysParams): Promise<void> => {
  const result = await gqlRequest({
    document: SET_INSTANCE_API_KEYS,
    variables: {
      instanceId,
      flowConfigs,
    },
  });

  if (result.updateInstance?.errors?.length) {
    throw new Error(
      `Failed to set test API keys: ${result.updateInstance.errors
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

export const loadCodeNativeIntegrationEntryPoint = async (
  cwd = process.cwd(),
): Promise<{
  directory: string;
  integrationDefinition: string;
  componentDefinition: ComponentDefinition;
  publishingMetadata?: PublishingMetadata;
}> => {
  const directory = await getPackageEntrypointDirectory("Code Native Integration", cwd);
  const entrypointPath = resolve(directory, "index.js");
  if (!(await exists(entrypointPath)))
    ux.error(
      "Failed to find 'index.js' entrypoint file. Is the current path a Code Native Integration?",
      { exit: 1 },
    );
  const { default: componentDefinition }: CodeNativeIntegrationEntrypoint = require(entrypointPath);

  if (!componentDefinition?.codeNativeIntegrationYAML) {
    ux.error(
      "Failed to find Code Native Integration definition in 'index.js' entrypoint file. Is the current path a Code Native Integration?",
      { exit: 1 },
    );
  }

  return {
    directory,
    integrationDefinition: componentDefinition.codeNativeIntegrationYAML,
    componentDefinition: componentDefinition,
    publishingMetadata: componentDefinition.publishingMetadata,
  };
};

export const waitForCodeNativeComponentAvailable = async (
  componentKey: string,
  versionNumber: number,
  attemptNumber = 0,
  maximumAttempts = 10,
): Promise<boolean> => {
  // Wait until component becomes available
  const results = await gqlRequest({
    document: COMPONENT4,
    variables: {
      componentKey,
      versionNumber,
    },
  });

  if (results.components.nodes.length > 0) {
    return true;
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
    document: INTEGRATION2,
    variables: { integrationId },
  });
  if (!result.integration) {
    throw new Error(`Integration not found: ${integrationId}`);
  }
  return result.integration.definition ?? "";
};

export const compareConfigVars = async (current: string, next: string): Promise<Array<string>> => {
  const currentDef = await loadYaml<IntegrationObjectFromYAML>(current);
  const nextDef = await loadYaml<IntegrationObjectFromYAML>(next);
  if (!currentDef || !nextDef) {
    throw new Error("Cannot compare config vars against an empty integration definition.");
  }

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
  return (
    Object.entries(requiredMatches)
      // biome-ignore lint/correctness/noUnusedFunctionParameters: TODO
      .filter(([key, match]) => !match)
      .map(([key]) => key)
  );
};

export const extractYAMLFromPath = async (path: string): Promise<string> => {
  const encoding = await chardet.detectFile(path);
  const definition = await fs.readFile(path, encoding === "UTF-16LE" ? "utf16le" : "utf-8");
  return definition;
};
