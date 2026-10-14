import { Cli, z } from "incur";
import { listConnections } from "../../../utils/component/catalog.js";
import { requestFailure } from "../../../utils/failure.js";
import { printTable, tableFlags, tableOutputSchema } from "../../../utils/table.js";
import { componentKeyArg, toSelector, versionOption, visibilityOptions } from "../schemas.js";

export default Cli.command({
  outputPolicy: "agent-only",
  description: "List the connections a component provides and the inputs each one requires",
  output: tableOutputSchema(
    [
      "id",
      "key",
      "label",
      "isDefault",
      "oauth2Type",
      "onPremiseAvailable",
      "requiredInputs",
      "inputs",
      "comments",
      "componentKey",
      "componentVersion",
      "public",
    ],
    false,
  ),
  examples: [
    { description: "List connections of the Slack component:", args: { componentKey: "slack" } },
  ],
  args: z.object({ componentKey: componentKeyArg("to list connections for") }),
  options: z.object({ ...tableFlags(), ...visibilityOptions(), ...versionOption() }),
  async run(context) {
    const { options: flags, args } = context;
    try {
      const { component, items } = await listConnections(toSelector(args.componentKey, flags));
      const result = printTable(
        items,
        {
          id: { minWidth: 8, extended: true },
          key: { minWidth: 10 },
          label: {},
          isDefault: { header: "Default", get: ({ default: isDefault }) => isDefault },
          oauth2Type: { header: "OAuth2" },
          onPremiseAvailable: { header: "On-Prem", extended: true },
          requiredInputs: {
            header: "Required Inputs",
            get: ({ inputs }) =>
              inputs
                .filter(({ required }) => required)
                .map(({ key }) => key)
                .join(", "),
          },
          inputs: { extended: true, get: ({ inputs }) => inputs.map(({ key }) => key).join(", ") },
          comments: { extended: true },
          componentKey: { extended: true, get: () => component.key },
          componentVersion: { extended: true, get: () => component.versionNumber },
          public: { extended: true, get: () => component.public },
        },
        { ...flags },
      );
      return context.ok(result);
    } catch (error) {
      return context.error(requestFailure(error, "COMPONENT_CONNECTIONS_LIST_FAILED", true));
    }
  },
});
