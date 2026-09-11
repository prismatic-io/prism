import { Args, Flags } from "@oclif/core";
import { PrismaticBaseCommand } from "../../../baseCommand.js";
import {
  ListComponentActions2Document as LIST_COMPONENT_ACTIONS2,
  type ListComponentActions2Query,
} from "../../../graphql/operations/listComponentActions2.generated.js";
import { gqlRequest } from "../../../graphql.js";
import { ux } from "../../../utils/ux.js";

type DataSourceNode =
  ListComponentActions2Query["components"]["nodes"][number]["actions"]["nodes"][number];

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
    let cursor: string | null = "";

    while (hasNextPage) {
      const {
        components: {
          nodes: [component],
        },
      }: ListComponentActions2Query = await gqlRequest({
        document: LIST_COMPONENT_ACTIONS2,
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
      dataSources = [...dataSources, ...component.actions.nodes];
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
          get: ({ detailDataSource }) => detailDataSource?.label || "",
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
