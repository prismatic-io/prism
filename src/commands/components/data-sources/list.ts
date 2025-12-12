import { Args, Flags, ux } from "@oclif/core";
import { PrismaticBaseCommand } from "../../../baseCommand.js";
import { gql, gqlRequest } from "../../../graphql.js";

interface DataSourceNode {
  [index: string]: unknown;
  id: string;
  key: string;
  label: string;
  description: string;
  dataSourceType: string;
  detailDataSource?: string;
}

export default class ListCommand extends PrismaticBaseCommand {
  static description = "List Data Sources that Components implement";

  static examples = [
    {
      description: "Get data sources related to the Salesforce component:",
      command: "<%= config.bin %> <%= command.id %> salesforce",
    },
  ];

  static flags = {
    ...ux.table.flags(),
    public: Flags.boolean({
      required: false,
      description:
        "Show data sources for the public component with the given key. Use this flag when you have a private component with the same key as a public component.",
    }),
    private: Flags.boolean({
      required: false,
      description:
        "Show data sources for the private component with the given key. Use this flag when you have a private component with the same key as a public component.",
    }),
  };
  static args = {
    componentKey: Args.string({
      name: "Component Key",
      required: true,
      description: "The key of the component to show data sources for (e.g. 'salesforce')",
    }),
  };

  async run() {
    const {
      flags,
      args: { componentKey },
    } = await this.parse(ListCommand);

    let dataSources: DataSourceNode[] = [];
    let componentId: string;
    let hasNextPage = true;
    let cursor = "";

    while (hasNextPage) {
      const {
        components: {
          nodes: [component],
        },
      } = await gqlRequest({
        document: gql`
          query listComponentActions(
            $componentKey: String
            $after: String
            $public: Boolean
          ) {
            components(key: $componentKey, public: $public) {
              nodes {
                id
                key
                actions(isTrigger: false, isDataSource: true, after: $after) {
                  nodes {
                    id
                    key
                    label
                    description
                    dataSourceType
                    detailDataSource {
                      label
                    }
                  }
                  pageInfo {
                    hasNextPage
                    endCursor
                  }
                }
              }
            }
          }
        `,
        variables: {
          after: cursor,
          componentKey,
          public: flags.public ? true : flags.private ? false : null,
        },
      });
      if (!component) {
        console.log(
          "The key you provided is not valid. Please run 'prism components:list -x' and identify a valid component key.",
        );
        this.exit(1);
      }
      dataSources = [
        ...dataSources,
        ...component.actions.nodes.map((action: { detailDataSource: { label: string } }) => ({
          ...action,
          detailDataSource: action.detailDataSource?.label || "",
        })),
      ];
      componentId = component.id;
      cursor = component.actions.pageInfo.endCursor;
      hasNextPage = component.actions.pageInfo.hasNextPage;
    }

    ux.table(
      dataSources,
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
        description: {},
        dataSourceType: { header: "Type" },
        detailDataSource: {
          header: "Detail Data Source",
          extended: true,
        },
        componentid: {
          get: () => componentId,
          extended: true,
        },
        componentkey: {
          get: () => componentKey,
          extended: true,
        },
      },
      { ...flags },
    );
  }
}
