import {
  ListComponentTriggersDocument as LIST_COMPONENT_TRIGGERS,
  type ListComponentTriggersQuery,
} from "../../../graphql/operations/listComponentTriggers.generated.js";
import { writeCommandStatus } from "../../../command.js";
import { gqlRequest } from "../../../graphql.js";
import {
  paginationFlags,
  tableOutputSchema,
  tableFlags,
  printTable,
} from "../../../utils/table.js";
import { z, Cli, Errors } from "incur";

type TriggerNode =
  ListComponentTriggersQuery["components"]["nodes"][number]["actions"]["nodes"][number];

export default Cli.command({
  outputPolicy: "agent-only",
  output: tableOutputSchema(
    ["id", "key", "label", "description", "componentid", "componentkey"],
    true,
  ),
  description: "List Triggers that Components implement",
  examples: [
    {
      description: "Get the ID of the Webhook trigger of the Webhook Triggers component by key:",
      args: { componentKey: "webhook-triggers" },
      options: { columns: "id", filter: "key=^webhook$", header: false },
    },
    {
      description: "Get triggers related to the Management Triggers component:",
      args: { componentKey: "management-triggers" },
    },
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
      .describe("The key of the component to show triggers for (e.g. 'salesforce')"),
  }),
  async run(context) {
    const {
      options: flags,
      args: { componentKey },
    } = context;

    let triggers: TriggerNode[] = [];
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
      }: ListComponentTriggersQuery = await gqlRequest({
        document: LIST_COMPONENT_TRIGGERS,
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
      triggers = [...triggers, ...component.actions.nodes];
      componentId = component.id;
      cursor = component.actions.pageInfo.endCursor;
      finalPageInfo = component.actions.pageInfo;
      hasNextPage =
        component.actions.pageInfo.hasNextPage && (flags.all === true || !context.agent);
    }

    const result = printTable(
      triggers,
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
