import {
  arg,
  commandInput,
  commandOutput,
  defineCommand,
  option,
  type CommandContext,
} from "../../../command.js";
import { gql, gqlRequest } from "../../../graphql.js";
import { ux } from "../../../utils/ux.js";

interface ActionNode {
  [index: string]: unknown;
  id: string;
  key: string;
  label: string;
  description: string;
}

export default defineCommand({
  description: "List Actions that Components implement",
  examples: [
    {
      description: "Get the ID of the GET action of the HTTP component by action key:",
      command:
        "<%= config.bin %> <%= command.id %> --columns id --filter 'key=^httpGet$' --no-header http",
    },
    {
      description: "Get actions related to the SFTP component:",
      command: "<%= config.bin %> <%= command.id %> sftp",
    },
  ],
  options: {
    ...ux.table.flags(),
    public: option.boolean({
      required: false,
      description:
        "Show actions for the public component with the given key. Use this flag when you have a private component with the same key as a public component.",
    }),
    private: option.boolean({
      required: false,
      description:
        "Show actions for the private component with the given key. Use this flag when you have a private component with the same key as a public component.",
    }),
  },
  args: {
    componentKey: arg.string({
      name: "Component Key",
      required: true,
      description: "The key of the component to show actions for (e.g. 'salesforce')",
    }),
  },
  async run(_context: CommandContext) {
    const {
      flags,
      args: { componentKey },
    } = commandInput();

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
        commandOutput.log(
          "The key you provided is not valid. Please run 'prism components:list -x' and identify a valid component key.",
        );
        commandOutput.exit(1);
      }
      actions = [...actions, ...component.actions.nodes];
      componentId = component.id;
      cursor = component.actions.pageInfo.endCursor;
      hasNextPage = component.actions.pageInfo.hasNextPage;
    }

    return ux.table(
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
  },
});
