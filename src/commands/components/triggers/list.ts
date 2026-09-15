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
  description: "List Triggers that Components implement",
  output: tableOutputSchema(
    [
      "id",
      "key",
      "label",
      "description",
      "isCommonTrigger",
      "isPollingTrigger",
      "scheduleSupport",
      "synchronousResponseSupport",
      "batchSupport",
      "componentKey",
      "componentVersion",
      "public",
    ],
    true,
  ),
  examples: [
    {
      description: "List triggers of the Universal Webhook component:",
      args: { componentKey: "webhook-triggers" },
    },
    {
      description: "Search the triggers of a component by keyword:",
      args: { componentKey: "salesforce" },
      options: { search: "record" },
    },
  ],
  args: z.object({ componentKey: componentKeyArg("to show triggers for") }),
  options: z.object({
    ...tableFlags(),
    ...paginationFlags(),
    ...visibilityOptions("actions"),
    ...versionOption(),
    search: z
      .string()
      .optional()
      .describe("Full-text search across trigger labels and descriptions"),
  }),
  alias: { search: "s" },
  async run(context) {
    const { options: flags, args } = context;
    try {
      const { component, items, pageInfo } = await listMembers(
        toSelector(args.componentKey, flags),
        {
          kind: "trigger",
          search: flags.search,
          after: flags.after,
          first: flags.first,
          all: flags.all === true || !context.agent,
        },
      );
      const result = printTable(
        items,
        memberColumns(component, {
          isCommonTrigger: {
            extended: true,
            get: ({ isCommonTrigger }) => isCommonTrigger ?? false,
          },
          isPollingTrigger: {
            extended: true,
            get: ({ isPollingTrigger }) => isPollingTrigger ?? false,
          },
          scheduleSupport: { extended: true },
          synchronousResponseSupport: { extended: true },
          batchSupport: { extended: true },
        }),
        { ...flags },
      );
      return context.ok(
        { ...result, pageInfo },
        nextPageCta(
          "components triggers list",
          { componentKey: args.componentKey },
          flags,
          pageInfo,
          context.agent,
          "Fetch the next page of triggers",
        ),
      );
    } catch (error) {
      return context.error(requestFailure(error, "COMPONENT_TRIGGERS_LIST_FAILED", true));
    }
  },
});
