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

    const components: any[] = await fetchComponents(showAllVersions, search);

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

const fetchComponents = async (showAllVersions: boolean, search?: string): Promise<any[]> => {
  let components: any[] = [];
  let hasNextPage = true;
  let cursor = "";

  while (hasNextPage) {
    const {
      components: { nodes, pageInfo },
    } = await gqlRequest({
      document: gql`
        query listComponents($showAllVersions: Boolean, $after: String, $filterQuery: JSONString) {
              components(allVersions: $showAllVersions, after: $after, filterQuery: $filterQuery) {
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
        filterQuery: JSON.stringify(["or", ["in", "key", search], ["in", "label", search]]),
      },
    });
    components = [...components, ...nodes];
    cursor = pageInfo.endCursor;
    hasNextPage = pageInfo.hasNextPage;
  }
  return components;
};
