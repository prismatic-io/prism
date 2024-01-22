import { MarketplaceTranslations } from "../../types";

const processIntegration = (data: MarketplaceTranslations): void => {
  data.marketplaceIntegrations.nodes.forEach((integration) => {
    if (!integration) {
      return;
    }
    console.log(integration);
  });
};

export default processIntegration;
