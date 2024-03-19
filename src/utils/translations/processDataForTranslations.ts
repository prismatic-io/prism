import {
  MarketplaceTranslations,
  MarketplaceTranslations_marketplaceIntegrations_nodes_instances_nodes as MarketplaceInstance,
  MarketplaceTranslations_marketplaceIntegrations_nodes as MarketplaceIntegration,
  Step,
  Flow,
  IntegrationSchema,
  Branch,
} from "../../types.js";

import { loadYaml } from "../serialize.js";

type ProcessedData = {
  [key: string]: string;
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
  const { name, description, category, overview, definition, instances } = integration;

  processProperties([name, description, category, overview]);

  if (definition) {
    processIntegrationDefinition(definition);
  }

  if (!instances) {
    return;
  }

  instances.nodes.forEach((instance) => processIntegrationInstance(instance));
};

const processIntegrationInstance = (instance: MarketplaceInstance | null) => {
  if (!instance) {
    return;
  }

  const { name, integration } = instance;

  setResultProperty(name);

  if (!integration) {
    return;
  }

  processIntegration(instance.integration as MarketplaceIntegration);
};

const processIntegrationDefinition = (unparsedYamlDefinition: string) => {
  const definition = loadYaml<IntegrationSchema>(unparsedYamlDefinition);

  const { category, description, configPages, flows, labels, requiredConfigVars } = definition;

  processProperties([description, category]);

  configPages?.forEach((page) => {
    setResultProperty(page.name);
    setResultProperty(page.tagline);
    page.elements.forEach((element) => setResultProperty(element.value));
  });

  flows?.forEach(traverse);
  processProperties(labels ?? []);

  requiredConfigVars?.forEach((configVar) => {
    if (
      configVar.dataType === "date" ||
      configVar.dataType === "timestamp" ||
      configVar.dataType === "schedule"
    ) {
      return;
    }
    setResultProperty(configVar.key);
    setResultProperty(configVar.description);

    if ("collectionType" in configVar) {
      try {
        const valueParsed = JSON.parse(configVar.defaultValue ?? "");
        valueParsed.forEach((value: any) => {
          if (typeof value === "string") {
            setResultProperty(value);
          }

          if (typeof value === "object") {
            Object.entries(value).forEach(([key, value]) => {
              setResultProperty(key);
              setResultProperty(value as string);
            });
          }
        });
      } catch (error) {
        console.error(`JSON Parsing Error: ${error}`);
      }
    }

    if (configVar.dataType === "picklist") {
      processProperties(configVar.pickList ?? []);
    }
  });
};

const traverse = (flowOrStep: Flow | Step) => {
  const stack: Array<Flow | Step | Branch> = [flowOrStep];

  while (stack.length > 0) {
    const current = stack.pop();

    if (current === undefined) continue;

    if (isFlow(current)) {
      // Handling Flow type
      processProperties([current.name, current.description]);
      stack.push(...current.steps);
    } else if (isStep(current)) {
      // Handling Step type
      processProperties([current.name, current.description, current.action?.component?.key]);
      if (current.steps) {
        stack.push(...current.steps);
      }
      if (current.branches) {
        stack.push(
          ...current.branches.map((branch) => ({
            name: branch.name,
            steps: branch.steps,
          })),
        );
      }
    } else {
      // Handling Branch type
      setResultProperty(current.name);
      stack.push(...current.steps);
    }
  }
};

const isFlow = (object: Flow | Step): object is Flow => {
  return "steps" in object && Array.isArray(object.steps);
};

const isStep = (object: Flow | Step): object is Step => {
  return "action" in object;
};

export const processIntegrationsForTranslations = (
  data: MarketplaceTranslations,
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
