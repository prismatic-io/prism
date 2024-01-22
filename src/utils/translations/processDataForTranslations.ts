import { MarketplaceTranslations } from "../../types";

type ProcessedData = {
  [key: string]: string;
};

const processIntegration = (
  data: MarketplaceTranslations,
  obj: Set<string> = new Set()
): ProcessedData => {
  console.log(data);
  data.marketplaceIntegrations.nodes.forEach((integration) => {
    if (!integration) {
      return;
    }

    Object.entries(integration).forEach(([key, value]) => {
      if (obj.has(value) || obj.has(key)) {
        return;
      }

      if (typeof value === "string") {
        obj.add(value);
      } else if (Array.isArray(value)) {
        value.forEach((item) => {
          if (typeof item === "string") {
            obj.add(item);
          } else if (typeof item === "object") {
            processIntegration(item, obj);
          }
        });
      } else if (typeof value === "object") {
        processIntegration(value, obj);
      }

      obj.add(key);
    });
  });

  const myObject: { [key: string]: string } = {};

  obj.forEach((item) => {
    myObject[item] = item;
  });

  return myObject;
};

export default processIntegration;
