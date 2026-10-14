import dayjs from "dayjs";
import { Cli, z } from "incur";
import { listVersions } from "../../utils/component/catalog.js";
import { requestFailure } from "../../utils/failure.js";
import { nextPageCta } from "../../utils/pagination.js";
import { paginationFlags, printTable, tableFlags, tableOutputSchema } from "../../utils/table.js";
import { componentKeyArg, resolveVisibility, visibilityOptions } from "./schemas.js";

export default Cli.command({
  outputPolicy: "agent-only",
  description: "List the published versions of a component",
  output: tableOutputSchema(
    [
      "versionNumber",
      "publishedAt",
      "publishedBy",
      "comment",
      "isAvailable",
      "componentKey",
      "public",
      "id",
    ],
    true,
  ),
  examples: [
    { description: "List versions of the Slack component:", args: { componentKey: "slack" } },
  ],
  args: z.object({ componentKey: componentKeyArg("to list versions for") }),
  options: z.object({ ...tableFlags(), ...paginationFlags(), ...visibilityOptions() }),
  async run(context) {
    const { options: flags, args } = context;
    try {
      const { component, items, pageInfo } = await listVersions(
        { key: args.componentKey, public: resolveVisibility(flags) },
        { after: flags.after, first: flags.first, all: flags.all === true || !context.agent },
      );
      const result = printTable(
        items,
        {
          versionNumber: { header: "Version" },
          publishedAt: { get: ({ publishedAt }) => dayjs(publishedAt).format() },
          publishedBy: { get: ({ publishedBy }) => publishedBy?.name ?? "" },
          comment: {},
          isAvailable: { header: "Available" },
          componentKey: { extended: true, get: () => component.key },
          public: { extended: true, get: () => component.public },
          id: { extended: true },
        },
        { ...flags },
      );
      return context.ok(
        { ...result, pageInfo },
        nextPageCta(
          "components versions",
          { componentKey: args.componentKey },
          flags,
          pageInfo,
          context.agent,
          "Fetch the next page of versions",
        ),
      );
    } catch (error) {
      return context.error(requestFailure(error, "COMPONENT_VERSIONS_FAILED", true));
    }
  },
});
