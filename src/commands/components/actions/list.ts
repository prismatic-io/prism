import { Cli, z } from "incur";
import { listMembers } from "../../../utils/component/catalog.js";
import { requestFailure } from "../../../utils/failure.js";
import { nextPageCta } from "../../../utils/pagination.js";
import {
  paginationFlags,
  printTable,
  tableFlags,
  tableOutputSchema,
} from "../../../utils/table.js";
import { memberColumns } from "../members.js";
import { componentKeyArg, toSelector, versionOption, visibilityOptions } from "../schemas.js";

export default Cli.command({
  outputPolicy: "agent-only",
  description: "List Actions that Components implement",
  output: tableOutputSchema(
    [
      "id",
      "key",
      "label",
      "description",
      "important",
      "allowsBranching",
      "terminateExecution",
      "componentKey",
      "componentVersion",
      "public",
    ],
    true,
  ),
  examples: [
    { description: "List actions of the Slack component:", args: { componentKey: "slack" } },
    {
      description: "Search the actions of a component by keyword:",
      args: { componentKey: "salesforce" },
      options: { search: "record" },
    },
  ],
  args: z.object({ componentKey: componentKeyArg("to show actions for") }),
  options: z.object({
    ...tableFlags(),
    ...paginationFlags(),
    ...visibilityOptions("actions"),
    ...versionOption(),
    search: z
      .string()
      .optional()
      .describe("Full-text search across action labels and descriptions"),
  }),
  alias: { search: "s" },
  async run(context) {
    const { options: flags, args } = context;
    try {
      const { component, items, pageInfo } = await listMembers(
        toSelector(args.componentKey, flags),
        {
          kind: "action",
          search: flags.search,
          after: flags.after,
          first: flags.first,
          all: flags.all === true || !context.agent,
        },
      );
      const result = printTable(
        items,
        memberColumns(component, {
          important: { extended: true },
          allowsBranching: { extended: true },
          terminateExecution: { extended: true },
        }),
        { ...flags },
      );
      return context.ok(
        { ...result, pageInfo },
        nextPageCta(
          "components actions list",
          { componentKey: args.componentKey },
          flags,
          pageInfo,
          context.agent,
          "Fetch the next page of actions",
        ),
      );
    } catch (error) {
      return context.error(requestFailure(error, "COMPONENT_ACTIONS_LIST_FAILED", true));
    }
  },
});
