import type { ResultOf } from "@graphql-typed-document-node/core";
import { ListComponentActionsDocument as LIST_COMPONENT_ACTIONS } from "../../../graphql/operations/listComponentActions.generated.js";
import { commandOutput, defineCommand, argsSchema, optionsSchema } from "../../../command.js";
import { gqlRequest } from "../../../graphql.js";
import { ux } from "../../../utils/ux.js";
import { paginationFlags, tableOutputSchema } from "../../../utils/table.js";
import { z } from "incur";

interface ActionNode {
  [index: string]: unknown;
  id: string;
  key: string;
  label: string;
  description: string;
}

export default defineCommand({
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
  options: optionsSchema(
    z.object({
      ...ux.table.flags(),
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
  ),
  args: argsSchema(
    z.object({
      componentKey: z
        .string()
        .describe("The key of the component to show actions for (e.g. 'salesforce')")
        .meta({ cli: { name: "Component Key" } }),
    }),
  ),
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
      }: ResultOf<typeof LIST_COMPONENT_ACTIONS> = await gqlRequest({
        document: LIST_COMPONENT_ACTIONS,
        variables: {
          after: cursor,
          first: flags.first,
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
      finalPageInfo = component.actions.pageInfo;
      hasNextPage =
        component.actions.pageInfo.hasNextPage && (flags.all === true || !context.agent);
    }

    const result = ux.table(
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
