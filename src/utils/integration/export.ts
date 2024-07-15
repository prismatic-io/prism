import { filter } from "lodash-es";
import { gqlRequest, gql } from "../../graphql.js";
import { loadYaml } from "../serialize.js";
import YAML from "js-yaml";

/** The version of the Integration definition to request.
 *  It's important to request a version that corresponds with the
 *  feature set in this version.
 */
export const INTEGRATION_DEFINITION_VERSION = 7;

interface ExportDefinitionProps {
  integrationId: string;
  latestComponents?: boolean;
  definitionVersion?: number;
  sanitizeConnectionInputs?: boolean;
  sanitizeInput?: string;
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
  sanitizeConnectionInputs,
  sanitizeInput,
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

  if (sanitizeConnectionInputs) {
    try {
      const parsedYaml: any = YAML.load(definition);

      parsedYaml.requiredConfigVars?.forEach((configVar: any) => {
        const keys = Object.keys(configVar.inputs);
        keys.forEach((key) => {
          if (configVar.inputs?.[key] && configVar.dataType === "connection" && key !== "scopes") {
            configVar.inputs[key].value = `Add your ${key} here`;
          }
        });
      });

      return loadYaml(YAML.dump(parsedYaml)) as IntegrationDefinition;
    } catch (e) {
      console.log(e);
      return loadYaml(definition) as IntegrationDefinition;
    }
  } else if (sanitizeInput) {
    try {
      const parsedYaml: any = YAML.load(definition);
      const input = sanitizeInput;

      parsedYaml.requiredConfigVars?.forEach((configVar: any) => {
        if (configVar.inputs?.[input]) {
          configVar.inputs[input].value = `Add your ${input} here`;
        }
      });

      return loadYaml(YAML.dump(parsedYaml)) as IntegrationDefinition;
    } catch (e) {
      console.log(e);
      return loadYaml(definition) as IntegrationDefinition;
    }
  } else {
    return loadYaml(definition) as IntegrationDefinition;
  }
};
