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

const processedProperties = new Set<string>();

const setResultProperty = (property?: string | null) => {
  if (property && !processedProperties.has(property)) {
    processedProperties.add(property);
  }
};

const processProperties = (properties: Array<string | undefined | null>) => {
  properties.forEach((property) => setResultProperty(property));
};

const processIntegration = (integration: MarketplaceIntegration) => {
  const { name, description, category, overview, definition, instances } =
    integration;

  processProperties([name, description, category, overview]);

  if (definition) {
    processIntegrationDefinition(definition);
  }

  instances.nodes.forEach((instance) => processIntegrationInstance(instance));
};

const processIntegrationInstance = (instance: MarketplaceInstance | null) => {
  if (!instance) {
    return;
  }

  const { name, integration } = instance;

  setResultProperty(name);

  if (integration) {
    processIntegration(instance.integration as MarketplaceIntegration);
  }
};

const processIntegrationDefinition = (unparsedYamlDefinition: string) => {
  const definition: IntegrationSchema = loadYaml(unparsedYamlDefinition);

  const {
    category,
    description,
    configPages,
    flows,
    labels,
    requiredConfigVars,
  } = definition;

  processProperties([description, category]);

  configPages?.forEach((page) => {
    setResultProperty(page.name);
    setResultProperty(page.tagline);
    page.elements.forEach((element) => setResultProperty(element.value));
  });

  flows?.forEach(traverseFlow);
  processProperties(labels ?? []);

  requiredConfigVars?.forEach((configVar) => {
    setResultProperty(configVar.key);
    setResultProperty(configVar.description);
    if (configVar.dataType === "picklist") {
      processProperties(configVar.pickList ?? []);
    }

    if (
      configVar.dataType === "jsonForm" &&
      "inputs" in configVar &&
      typeof configVar?.inputs?.schema?.value === "string"
    ) {
      try {
        const valueParsed: ParsedConfigVarStringValue = JSON.parse(
          configVar.inputs.schema.value
        );
        Object.entries(valueParsed.properties).forEach(([key, value]) => {
          setResultProperty(key);
          setResultProperty(value.description);
        });
      } catch (error) {
        console.error(`JSON Parsing Error: ${error}`);
      }
    }
  });
};

const traverseFlow = (flow: Flow) => {
  const { name, description, steps } = flow;
  setResultProperty(name);
  setResultProperty(description);

  steps.forEach((step) => {
    const { name, description, steps, branches } = step;
    setResultProperty(name);
    setResultProperty(description);

    steps?.forEach((nestedStep) => {
      traverseStep(nestedStep);
    });

    branches?.forEach((branch) => {
      setResultProperty(branch.name);
      branch.steps.forEach((branchStep) => {
        traverseStep(branchStep);
      });
    });
  });
};

const traverseStep = (step: Step) => {
  const {
    name,
    action: {
      component: { key },
    },
    steps,
    branches,
    description,
  } = step;

  processProperties([name, description, key]);

  steps?.forEach((nestedStep) => {
    traverseStep(nestedStep);
  });

  branches?.forEach((branch) => {
    setResultProperty(branch.name);
    branch.steps.forEach((branchStep) => {
      traverseStep(branchStep);
    });
  });
};

export const processIntegrationsForTranslations = (
  data: MarketplaceTranslations
): ProcessedData => {
  data.marketplaceIntegrations.nodes.forEach((integration) => {
    if (!integration) {
      return;
    }
    processIntegration(integration);
  });

  const result = Object.fromEntries(processedProperties.entries());

  return result;
};

// export type Phrases = keyof typeof result
