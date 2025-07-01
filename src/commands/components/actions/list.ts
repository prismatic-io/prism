import { Args, Flags, ux } from "@oclif/core";
import { PrismaticBaseCommand } from "../../../baseCommand.js";
import { gql, gqlRequest } from "../../../graphql.js";

interface ActionNode {
  [index: string]: unknown;
  id: string;
  key: string;
  label: string;
  description: string;
}

export default class ListCommand extends PrismaticBaseCommand {
  static description = "List Actions that Components implement";
  static flags = {
    ...PrismaticBaseCommand.baseFlags,
    ...ux.table.flags(),
    public: Flags.boolean({
      required: false,
      description:
        "Show actions for the public component with the given key. Use this flag when you have a private component with the same key as a public component.",
    }),
    private: Flags.boolean({
      required: false,
      description:
        "Show actions for the private component with the given key. Use this flag when you have a private component with the same key as a public component.",
    }),
  };
  static args = {
    componentKey: Args.string({
      name: "Component Key",
      required: true,
      description: "The key of the component to show actions for (e.g. 'salesforce')",
    }),
  };

  async run() {
    const {
      flags,
      args: { componentKey },
    } = await this.parse(ListCommand);

    let actions: ActionNode[] = [];
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
                actions(isTrigger: false, isDataSource: false, after: $after) {
                  nodes {
                    id
                    key
                    label
                    description
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
      actions = [...actions, ...component.actions.nodes];
      componentId = component.id;
      cursor = component.actions.pageInfo.endCursor;
      hasNextPage = component.actions.pageInfo.hasNextPage;
    }

    if (flags.json) {
      this.logJsonOutput(actions);
    } else {
      ux.table(
        actions,
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
}
