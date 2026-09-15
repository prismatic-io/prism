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
  description: "List Data Sources that Components implement",
  output: tableOutputSchema(
    [
      "id",
      "key",
      "label",
      "description",
      "dataSourceType",
      "isDetailDataSource",
      "detailDataSource",
      "componentKey",
      "componentVersion",
      "public",
    ],
    true,
  ),
  examples: [
    { description: "List data sources of the Slack component:", args: { componentKey: "slack" } },
    {
      description: "List only picklist data sources:",
      args: { componentKey: "salesforce" },
      options: { type: "picklist" },
    },
  ],
  args: z.object({ componentKey: componentKeyArg("to show data sources for") }),
  options: z.object({
    ...tableFlags(),
    ...paginationFlags(),
    ...visibilityOptions("data sources"),
    ...versionOption(),
    search: z
      .string()
      .optional()
      .describe("Full-text search across data source labels and descriptions"),
    type: z
      .string()
      .optional()
      .describe("Only list data sources that produce this type (for example picklist or jsonform)"),
  }),
  alias: { search: "s" },
  async run(context) {
    const { options: flags, args } = context;
    try {
      const { component, items, pageInfo } = await listMembers(
        toSelector(args.componentKey, flags),
        {
          kind: "dataSource",
          search: flags.search,
          dataSourceType: flags.type,
          after: flags.after,
          first: flags.first,
          all: flags.all === true || !context.agent,
        },
      );
      const result = printTable(
        items,
        memberColumns(component, {
          dataSourceType: { header: "Type" },
          isDetailDataSource: { extended: true },
          detailDataSource: {
            extended: true,
            get: ({ detailDataSource }) => detailDataSource?.key ?? "",
          },
        }),
        { ...flags },
      );
      return context.ok(
        { ...result, pageInfo },
        nextPageCta(
          "components data-sources list",
          { componentKey: args.componentKey },
          flags,
          pageInfo,
          context.agent,
          "Fetch the next page of data sources",
        ),
      );
    } catch (error) {
      return context.error(requestFailure(error, "COMPONENT_DATA_SOURCES_LIST_FAILED", true));
    }
  },
});
