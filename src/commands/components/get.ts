import { Cli, z } from "incur";
import { inspectComponent } from "../../utils/component/catalog.js";
import { requestFailure } from "../../utils/failure.js";
import { renderDocument } from "./render.js";
import {
  componentInspectionSchema,
  componentKeyArg,
  toSelector,
  versionOption,
  visibilityOptions,
} from "./schemas.js";

export default Cli.command({
  description:
    "Describe a component: identity, version, and every action, trigger, data source, and connection it provides",
  output: componentInspectionSchema,
  examples: [
    { description: "Describe the latest Slack component:", args: { componentKey: "slack" } },
    {
      description: "Describe a pinned version of a private component:",
      args: { componentKey: "acme" },
      options: { private: true, version: 3 },
    },
  ],
  args: z.object({ componentKey: componentKeyArg("to describe") }),
  options: z.object({ ...visibilityOptions(), ...versionOption() }),
  async run(context) {
    const { options: flags, args } = context;
    try {
      const component = await inspectComponent(toSelector(args.componentKey, flags));
      renderDocument(context.agent, component);
      return context.ok(component, {
        cta: {
          commands: [
            {
              command: "components actions get",
              description: "Inspect one action's inputs and output",
              args: { componentKey: component.key, actionKey: "<actionKey>" },
            },
            {
              command: "components connections list",
              description: "Inspect the connection inputs this component needs",
              args: { componentKey: component.key },
            },
          ],
        },
      });
    } catch (error) {
      return context.error(requestFailure(error, "COMPONENT_GET_FAILED", true));
    }
  },
});
