import {
  MarketplaceTranslations,
  MarketplaceTranslations_marketplaceIntegrations_nodes_instances_nodes as MarketplaceInstance,
  MarketplaceTranslations_marketplaceIntegrations_nodes as MarketplaceIntegration,
  Step,
  Flow,
  IntegrationSchema,
} from "../../types";

import { loadYaml } from "../serialize";

type ProcessedData = {
  [key: string]: string;
};

type ParsedConfigVarStringValue = {
  type: string;
  properties: {
    [key: string]: {
      type: string;
      minLength?: number;
      description?: string;
    };
  };
};

function extractValues(data: MarketplaceTranslations): ProcessedData {
  const result: ProcessedData = {};

  function processIntegration(integration: MarketplaceIntegration) {
    if (integration.name) {
      result[integration.name] = integration.name;
    }

    if (integration.description) {
      result[integration.description] = integration.description;
    }

    if (integration.category) {
      result[integration.category] = integration.category;
    }

    if (integration.overview) {
      result[integration.overview] = integration.overview;
    }

    if (integration.definition) {
      processIntegrationDefinition(integration.definition);
    }

    integration.instances.nodes.forEach((instance) => {
      if (!instance) {
        return;
      }
      processIntegrationInstance(instance);
    });
  }

  function processIntegrationInstance(instance: MarketplaceInstance) {
    if (instance.name) {
      result[instance.name] = instance.name;
    }

    if (instance.integration) {
      processIntegration(instance.integration as MarketplaceIntegration);
    }
  }

  function processIntegrationDefinition(unparsedYamlDefinition: string) {
    const definition: IntegrationSchema = loadYaml(unparsedYamlDefinition);

    if (definition.category) {
      result[definition.category] = definition.category;
    }

    if (definition.description) {
      result[definition.description] = definition.description;
    }

    if (definition.configPages) {
      definition.configPages.forEach((page) => {
        result[page.name] = page.name;

        if (page.tagline) {
          result[page.tagline] = page.tagline;
        }

        if (page.elements.length) {
          page.elements.forEach((element) => {
            result[element.value] = element.value;
          });
        }
      });
    }

    if (definition.flows) {
      definition.flows.forEach((flow: Flow) => {
        traverseFlow(flow);
      });
    }

    if (definition.labels) {
      definition.labels.forEach((label) => {
        result[label] = label;
      });
    }

    if (definition.requiredConfigVars) {
      definition.requiredConfigVars.forEach((configVar) => {
        result[configVar.key] = configVar.key;
        if (configVar.description) {
          result[configVar.description] = configVar.description;
        }

        if (configVar.dataType && configVar.dataType === "picklist") {
          configVar.pickList?.forEach((item) => {
            result[item] = item;
          });
        }

        if (configVar.dataType === "jsonForm") {
          if ("inputs" in configVar && configVar?.inputs?.schema) {
            if (typeof configVar.inputs.schema.value === "string")
              try {
                const valueParsed: ParsedConfigVarStringValue = JSON.parse(
                  configVar.inputs.schema.value
                );

                Object.entries(valueParsed.properties).forEach(
                  ([key, value]) => {
                    result[key] = key;
                    if (value.description) {
                      result[value.description] = value.description;
                    }
                  }
                );
              } catch (error) {
                console.error(error);
              }
          }
        }
      });
    }
  }

  function traverseFlow(flow: Flow) {
    result[flow.name] = flow.name;

    if (flow.description) {
      result[flow.description] = flow.description;
    }

    flow.steps.forEach((step) => {
      result[step.name] = step.name;

      if (step.description) {
        result[step.description] = step.description;
      }

      if (step.steps && step.steps.length) {
        step.steps.forEach((nestedStep) => {
          traverseStep(nestedStep);
        });
      }

      if (step.branches) {
        step.branches.forEach((branch) => {
          result[branch.name] = branch.name;
          if (branch.steps.length) {
            branch.steps.forEach((branchStep) => {
              traverseStep(branchStep);
            });
          }
        });
      }
    });
  }

  function traverseStep(step: Step) {
    result[step.name] = step.name;
    result[step.action.component.key] = step.action.component.key;

    if (step.steps && step.steps.length) {
      step.steps.forEach((nestedStep) => {
        // Recurse for nested steps
        traverseStep(nestedStep);
      });
    }

    if (step.branches) {
      step.branches.forEach((branch) => {
        result[branch.name] = branch.name;
        if (branch.steps.length) {
          // Recurse for branch steps
          branch.steps.forEach((branchStep) => {
            traverseStep(branchStep);
          });
        }
      });
    }

    if (step.description) {
      result[step.description] = step.description;
    }
  }

  data.marketplaceIntegrations.nodes.forEach((integration) => {
    if (!integration) {
      return;
    }
    processIntegration(integration);
  });

  return result;
}

export default extractValues;

// export type Phrases = keyof typeof result
