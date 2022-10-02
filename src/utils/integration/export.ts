import { gqlRequest, gql } from "../../graphql";
import { loadYaml } from "../serialize";

/** The version of the Integration definition to request.
 *  It's important to request a version that corresponds with the
 *  feature set in this version.
 */
export const INTEGRATION_DEFINITION_VERSION = 7;

interface ExportDefinitionProps {
  integrationId: string;
  latestComponents?: boolean;
  definitionVersion?: number;
}

export interface ComponentInfo {
  key: string;
  isPublic: boolean;
  version: string | number;
}

export interface Expression {
  type: "value" | "configVar" | "reference";
  value: string;
}

export interface ConfigVar {
  key: string;
  description?: string;
  dataType: string;
  value?: string;
  connection?: {
    component: ComponentInfo;
    key: string;
  };
  inputs?: Record<string, Expression>;
}

export interface Step {
  name: string;
  isTrigger?: boolean;
  action: {
    component: ComponentInfo;
    key: string;
  };
  inputs?: Record<string, Expression>;
}

export interface Flow {
  name: string;
  description?: string;
  steps: Step[];
}

export interface IntegrationDefinition {
  definitionVersion: number;
  name: string;
  description?: string;
  requiredConfigVars?: ConfigVar[];
  flows: Flow[];
}

export const exportDefinition = async ({
  integrationId,
  latestComponents = false,
  definitionVersion = INTEGRATION_DEFINITION_VERSION,
}: ExportDefinitionProps): Promise<IntegrationDefinition> => {
  const result = await gqlRequest({
    document: gql`
      query export(
        $id: ID!
        $version: Int!
        $useLatestComponentVersions: Boolean!
      ) {
        integration(id: $id) {
          definition(
            version: $version
            useLatestComponentVersions: $useLatestComponentVersions
          )
        }
      }
    `,
    variables: {
      id: integrationId,
      version: definitionVersion,
      useLatestComponentVersions: latestComponents,
    },
  });
  const definition: string = result.integration.definition;
  return loadYaml(definition) as IntegrationDefinition;
};
