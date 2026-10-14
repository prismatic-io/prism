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
  description: "Describe one action: capabilities, inputs, example payload, and output schema",
  output: memberDetailSchema,
  examples: [
    {
      description: "Describe an action of the Slack component:",
      args: { componentKey: "slack", actionKey: "postMessage" },
    },
  ],
  args: z.object({
    componentKey: componentKeyArg("that provides the action"),
    actionKey: z.string().describe("The key of the action (e.g. 'postMessage')"),
  }),
  options: z.object({ ...visibilityOptions("actions"), ...versionOption() }),
  async run(context) {
    const { options: flags, args } = context;
    try {
      const member = await getMember(
        toSelector(args.componentKey, flags),
        "action",
        args.actionKey,
      );
      return context.ok(member);
    } catch (error) {
      return context.error(requestFailure(error, "COMPONENT_ACTIONS_GET_FAILED", true));
    }
  },
});
