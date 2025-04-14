/**
 * Datasources are used to dynamically fetch and display configuration
 * information within the configuration wizard. You can fetch data from
 * a third-party API, and present the data as input boxes, dropdown
 * menus, or JSON Forms.
 *
 * For information on data sources, see
 * https://prismatic.io/docs/custom-connectors/data-sources/
 */

import { type Element, dataSource, input } from "@prismatic-io/spectral";
import { createAcmeClient } from "./client";

interface Item {
  id: number;
  name: string;
  quantity: number;
}

/**
 * Create a dropdown menu, populated with items
 * from an API, for use in the config wizard
 */
export const selectItem = dataSource({
  display: {
    label: "Select Item",
    description:
      "This data source fetches a list of items, and presents them as a dropdown menu",
  },
  dataSourceType: "picklist",
  inputs: {
    acmeConnection: input({
      label: "Acme Connection",
      required: true,
      type: "connection",
    }),
  },
  perform: async (context, { acmeConnection }) => {
    const client = createAcmeClient(acmeConnection);
    const { data: items } = await client.get<Item[]>("/items");
    const options: Element[] = items.map((item) => ({
      key: `${item.id}`,
      label: item.name,
    }));
    return { result: options };
  },
  examplePayload: {
    result: [
      { key: "1", label: "Widgets" },
      { key: "2", label: "Whatsits" },
      { key: "3", label: "Gadgets" },
    ],
  },
});

export default { selectItem };
