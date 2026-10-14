import { expect, it } from "vitest";
import type { MarketplaceTranslationsQuery } from "../../graphql/translations/marketplaceTranslations.generated.js";
import { processIntegrationsForTranslations } from "./processDataForTranslations.js";

it("collects marketplace and instance integration translations while allowing nullable text", () => {
  const fragment = {
    description: null,
    definition: null,
    category: null,
    overview: null,
    configPages: [],
    requiredConfigVariables: { nodes: [] },
  };
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
