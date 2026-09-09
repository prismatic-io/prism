import {
  ListComponentActionsDocument as LIST_COMPONENT_ACTIONS,
  type ListComponentActionsQuery,
} from "../../../graphql/operations/listComponentActions.generated.js";
import { writeCommandStatus } from "../../../command.js";
import { gqlRequest } from "../../../graphql.js";
import {
  paginationFlags,
  tableOutputSchema,
  tableFlags,
  printTable,
} from "../../../utils/table.js";
import { z, Cli, Errors } from "incur";

type ActionNode =
  ListComponentActionsQuery["components"]["nodes"][number]["actions"]["nodes"][number];

export default Cli.command({
  outputPolicy: "agent-only",
  output: tableOutputSchema(
    ["id", "key", "label", "description", "componentid", "componentkey"],
    true,
  ),
  description: "List Actions that Components implement",
  examples: [
    {
      description: "Get the ID of the GET action of the HTTP component by action key:",
      args: { componentKey: "http" },
      options: { columns: "id", filter: "key=^httpGet$", header: false },
    },
    { description: "Get actions related to the SFTP component:", args: { componentKey: "sftp" } },
  ],
  options: z.object({
    ...tableFlags(),
    ...paginationFlags(),
    public: z
      .boolean()
      .optional()
      .describe(
        "Show actions for the public component with the given key. Use this flag when you have a private component with the same key as a public component.",
      ),
    private: z
      .boolean()
      .optional()
      .describe(
        "Show actions for the private component with the given key. Use this flag when you have a private component with the same key as a public component.",
      ),
  }),
  args: z.object({
    componentKey: z
      .string()
      .describe("The key of the component to show actions for (e.g. 'salesforce')"),
  }),
  async run(context) {
    const {
      options: flags,
      args: { componentKey },
    } = context;

    let actions: ActionNode[] = [];
    let componentId: string;
    let hasNextPage = true;
    let cursor: string | null = flags.after ?? "";
    let finalPageInfo = {
      hasNextPage: false,
      endCursor: null as string | null,
    };

    while (hasNextPage) {
      const {
        components: {
          nodes: [component],
        },
      }: ListComponentActionsQuery = await gqlRequest({
        document: LIST_COMPONENT_ACTIONS,
        variables: {
          after: cursor,
          first: flags.first,
          componentKey,
          public: flags.public ? true : flags.private ? false : null,
        },
      });
      if (!component) {
        writeCommandStatus(
          "The key you provided is not valid. Please run 'prism components:list -x' and identify a valid component key.",
        );
        throw new Errors.IncurError({
          code: "COMMAND_FAILED",
          message: "Exited with status 1",
          exitCode: 1,
        });
      }
      actions = [...actions, ...component.actions.nodes];
      componentId = component.id;
      cursor = component.actions.pageInfo.endCursor;
      finalPageInfo = component.actions.pageInfo;
      hasNextPage =
        component.actions.pageInfo.hasNextPage && (flags.all === true || !context.agent);
    }

    const result = printTable(
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
    return { ...result, pageInfo: finalPageInfo };
  },
});
