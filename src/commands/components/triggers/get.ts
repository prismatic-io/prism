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
  description: "Describe one trigger: capabilities, inputs, example payload, and output schema",
  output: memberDetailSchema,
  examples: [
    {
      description: "Describe a trigger of the Universal Webhook component:",
      args: { componentKey: "webhook-triggers", triggerKey: "webhook" },
    },
  ],
  args: z.object({
    componentKey: componentKeyArg("that provides the trigger"),
    triggerKey: z.string().describe("The key of the trigger (e.g. 'webhook')"),
  }),
  options: z.object({ ...visibilityOptions("actions"), ...versionOption() }),
  async run(context) {
    const { options: flags, args } = context;
    try {
      const member = await getMember(
        toSelector(args.componentKey, flags),
        "trigger",
        args.triggerKey,
      );
      return context.ok(member);
    } catch (error) {
      return context.error(requestFailure(error, "COMPONENT_TRIGGERS_GET_FAILED", true));
    }
  },
});
