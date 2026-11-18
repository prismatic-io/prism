import { expect, it } from "vitest";
import type { MarketplaceTranslationsQuery } from "../../graphql/translations/marketplaceTranslations.generated.js";
import type { IntegrationSchema } from "../../types.js";
import { dumpYaml } from "../serialize.js";
import { processIntegrationsForTranslations } from "./processDataForTranslations.js";

const fragment = {
  description: null,
  definition: null,
  category: null,
  overview: null,
  configPages: [],
  requiredConfigVariables: { nodes: [] },
};

const marketplaceData = (
  integrations: Array<{ name: string; definition?: string }>,
): MarketplaceTranslationsQuery => ({
  marketplaceIntegrations: {
    nodes: integrations.map((integration, index) => ({
      ...fragment,
      ...integration,
      id: `integration-${index}`,
      instances: { nodes: [] },
    })),
  },
});

it("collects marketplace and instance integration translations while allowing nullable text", () => {
  const data: MarketplaceTranslationsQuery = {
    marketplaceIntegrations: {
      nodes: [
        {
          ...fragment,
          id: "integration-1",
          name: "Marketplace Integration",
          instances: {
            nodes: [
              {
                id: "instance-1",
                name: "Customer Instance",
                integration: {
                  ...fragment,
                  name: "Configured Integration",
                  description: "Configured description",
                },
              },
            ],
          },
        },
      ],
    },
  };
  expect(processIntegrationsForTranslations(data)).toEqual({
    "Marketplace Integration": "Marketplace Integration",
    "Customer Instance": "Customer Instance",
    "Configured Integration": "Configured Integration",
    "Configured description": "Configured description",
  });
});

it("collects the key and description of a fieldMapping config var but not its field keys", () => {
  const definition: IntegrationSchema = {
    definitionVersion: 7,
    name: "Lead Sync",
    description: "",
    flows: [],
    requiredConfigVars: [
      {
        key: "Lead Mapping",
        description: "Map the lead fields",
        dataType: "fieldMapping",
        fieldMapping: {
          source: {
            dataSource: {
              component: { key: "acme-leads", version: 1, isPublic: false },
              key: "selectLeadField",
            },
            inputs: { objectType: { type: "value", value: "lead" } },
          },
          destination: { staticOptions: [{ key: "email", label: "Email Address" }] },
          allowAdditionalMappings: true,
          allowNewFields: false,
          rules: [
            { mode: "static", sourceField: "lead_email", destField: "email" },
            { mode: "optional", sourceField: "lead_name" },
          ],
        },
      },
    ],
  };

  expect(
    processIntegrationsForTranslations(
      marketplaceData([{ name: "Lead Sync", definition: dumpYaml(definition) }]),
    ),
  ).toEqual({
    "Lead Sync": "Lead Sync",
    "Lead Mapping": "Lead Mapping",
    "Map the lead fields": "Map the lead fields",
  });
});

it("returns only the phrases of the data that it gets", () => {
  processIntegrationsForTranslations(marketplaceData([{ name: "First Integration" }]));

  expect(
    processIntegrationsForTranslations(marketplaceData([{ name: "Second Integration" }])),
  ).toEqual({ "Second Integration": "Second Integration" });
});
