import { Flags, ux } from "@oclif/core";
import dayjs from "dayjs";
import { PrismaticBaseCommand } from "../../baseCommand.js";
import { gql, gqlRequest } from "../../graphql.js";

export default class ListCommand extends PrismaticBaseCommand {
  static description = "List available Components";
  static flags = {
    ...ux.table.flags(),
    showAllVersions: Flags.boolean({
      char: "a",
      required: false,
      description:
        "If specified this command returns all versions of all components rather than only the latest version",
    }),
    search: Flags.string({
      char: "s",
      required: false,
      description: "Search components by label first, then by key (case insensitive)",
    }),
  };

  async run() {
    const { flags } = await this.parse(ListCommand);
    const { showAllVersions, search } = flags;

    let components: any[] = [];

    if (search) {
      // First try searching by label
      components = await fetchComponents(showAllVersions, undefined, search);

      // If no results found by label, try searching by key
      if (components.length === 0) {
        components = await fetchComponents(showAllVersions, search, undefined);
      }
    } else {
      // No search term provided, get all components
      components = await fetchComponents(showAllVersions);
    }

    ux.table(
      components,
      {
        id: {
          minWidth: 8,
          extended: true,
        },
        key: {
          minWidth: 10,
          extended: true,
        },
        label: {},
        public: {},
        description: {},
        versionNumber: { header: "Version" },
        versionCreatedAt: {
          header: "Last Published",
          extended: true,
          get: ({ versionCreatedAt }) => dayjs(versionCreatedAt).format(),
        },
        category: { get: ({ category }) => category || "" },
        customerId: {
          extended: true,
          get: ({ customer }) => customer?.id ?? "",
        },
        customerName: {
          extended: true,
          get: ({ customer }) => customer?.name ?? "",
        },
        customerExternalId: {
          extended: true,
          get: ({ customer }) => customer?.externalId ?? "",
        },
      },
      { ...flags },
    );
  }
}

const fetchComponents = async (
  showAllVersions: boolean,
  keySearch?: string,
  labelSearch?: string,
): Promise<any[]> => {
  let components: any[] = [];
  let hasNextPage = true;
  let cursor = "";

  while (hasNextPage) {
    const {
      components: { nodes, pageInfo },
    } = await gqlRequest({
      document: gql`
        query listComponents($showAllVersions: Boolean, $after: String, $keySearch: String, $labelSearch: String) {
              components(allVersions: $showAllVersions, after: $after, key_Icontains: $keySearch, label_Icontains: $labelSearch) {
                nodes {
                  id
                  key
                  public
                  label
                  description
                  versionNumber
                  category
                  versionCreatedAt
                  customer {
                    id
                    externalId
                    name
                  }
                }
                pageInfo {
                  hasNextPage
                  endCursor
                }
              }
            }
          `,
      variables: {
        showAllVersions,
        after: cursor,
        keySearch,
        labelSearch,
      },
    });
    components = [...components, ...nodes];
    cursor = pageInfo.endCursor;
    hasNextPage = pageInfo.hasNextPage;
  }
  return components;
};
