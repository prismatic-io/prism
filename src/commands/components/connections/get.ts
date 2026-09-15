import { Cli, z } from "incur";
import { listConnections } from "../../../utils/component/catalog.js";
import { requestFailure } from "../../../utils/failure.js";
import {
  componentKeyArg,
  connectionDetailSchema,
  toSelector,
  versionOption,
  visibilityOptions,
} from "../schemas.js";

export default Cli.command({
  description: "Describe one connection: authentication type, templates, and every input field",
  output: connectionDetailSchema,
  examples: [
    {
      description: "Describe the Slack OAuth 2.0 connection:",
      args: { componentKey: "slack", connectionKey: "oauth2" },
    },
  ],
  args: z.object({
    componentKey: componentKeyArg("that provides the connection"),
    connectionKey: z.string().describe("The key of the connection (for example 'oauth2')"),
  }),
  options: z.object({ ...visibilityOptions(), ...versionOption() }),
  async run(context) {
    const { options: flags, args } = context;
    try {
      const { component, items } = await listConnections(
        toSelector(args.componentKey, flags),
        args.connectionKey,
      );
      const connection = { ...items[0], component };
      return context.ok(connection);
    } catch (error) {
      return context.error(requestFailure(error, "COMPONENT_CONNECTIONS_GET_FAILED", true));
    }
  },
});
