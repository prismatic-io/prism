import { Cli, z } from "incur";
import { getMember } from "../../../utils/component/catalog.js";
import { requestFailure } from "../../../utils/failure.js";
import {
  componentKeyArg,
  memberDetailSchema,
  toSelector,
  versionOption,
  visibilityOptions,
} from "../schemas.js";

export default Cli.command({
  description: "Describe one data source: capabilities, inputs, example payload, and output schema",
  output: memberDetailSchema,
  examples: [
    {
      description: "Describe a data source of the Slack component:",
      args: { componentKey: "slack", dataSourceKey: "selectChannels" },
    },
  ],
  args: z.object({
    componentKey: componentKeyArg("that provides the data source"),
    dataSourceKey: z.string().describe("The key of the data source (e.g. 'selectChannels')"),
  }),
  options: z.object({ ...visibilityOptions("data sources"), ...versionOption() }),
  async run(context) {
    const { options: flags, args } = context;
    try {
      const member = await getMember(
        toSelector(args.componentKey, flags),
        "dataSource",
        args.dataSourceKey,
      );
      return context.ok(member);
    } catch (error) {
      return context.error(requestFailure(error, "COMPONENT_DATA_SOURCES_GET_FAILED", true));
    }
  },
});
