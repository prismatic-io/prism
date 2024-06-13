import { extname } from "path";
import crypto from "crypto";
import { ux } from "@oclif/core";
import mimetypes from "mime-types";
import axios from "axios";

import { ComponentDefinition } from "./index.js";
import { fs } from "../../fs.js";
import { gqlRequest, gql } from "../../graphql.js";

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

export const checkPackageSignature = async (
  { key, public: isPublic }: ComponentDefinition,
  packagePath: string,
  customer?: string,
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
  confirm = true,
) => {
  if (!confirm) return;

  ux.log(label, "-", description);

  const continuePublish = await ux.confirm(`Would you like to publish ${label}? (y/N)`);
  if (!continuePublish) ux.exit(0);
};

export const publishDefinition = async (
  { actions, triggers, dataSources, connections, ...rest }: ComponentDefinition,
  {
    comment,
    customer,
    forCodeNativeIntegration,
    attributes,
  }: {
    comment?: string;
    customer?: string;
    forCodeNativeIntegration?: boolean;
    attributes?: {
      commitHash?: string;
      pullRequestUrl?: string;
      repoUrl?: string;
    };
  } = {},
): Promise<{
  iconUploadUrl: string;
  packageUploadUrl: string;
  connectionIconUploadUrls: Record<string, string>;
  versionNumber: string;
}> => {
  const componentDefinition: Record<string, unknown> = Object.entries(rest).reduce(
    (result, [key, value]) =>
      componentDefinitionShape[key as keyof ComponentDefinition]
        ? { ...result, [key]: value }
        : result,
    {},
  );
  componentDefinition.forCodeNativeIntegration = forCodeNativeIntegration;

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

  const dataSourceDefinitions = Object.values(dataSources || {}).map((dataSource) => {
    return {
      ...dataSource,
      examplePayload: dataSource?.examplePayload
        ? JSON.stringify(dataSource?.examplePayload)
        : JSON.stringify({}),
    };
  });

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
        $attributes: String
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
            attributes: $attributes
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
      attributes: attributes ? JSON.stringify(attributes) : undefined,
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
    {},
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
    const response = await axios.put(destinationUrl, await fs.readFile(filePath), {
      headers: { "Content-Type": mimetypes.contentType(extname(filePath)) },
    });
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
  connectionIconUploadUrls: Record<string, string>,
): Promise<void> => {
  if (
    !connections ||
    !connections.length ||
    !connectionIconUploadUrls ||
    !Object.keys(connectionIconUploadUrls).length
  ) {
    return;
  }

  const iconPaths = connections.reduce<Record<string, string>>((result, { key, iconPath }) => {
    if (!iconPath) {
      return result;
    }
    return {
      ...result,
      [key]: iconPath,
    };
  }, {});

  const promises = Object.entries(connectionIconUploadUrls).map(
    async ([connectionKey, uploadUrl]) => uploadFile(iconPaths[connectionKey], uploadUrl),
  );
  await Promise.all(promises);
};
