import { parseJsonOrUndefined } from "../../fields.js";
import { CreateInstanceDocument as CREATE_INSTANCE } from "../../graphql/operations/createInstance.generated.js";
import { gqlRequest } from "../../graphql.js";
import { warningsOutput } from "../../output.js";
import { z, Cli, Errors } from "incur";
export default Cli.command({
  output: z.object({ instanceId: z.string() }).extend(warningsOutput),
  description: "Create an Instance",
  examples: [
    { description: "Get the ID of the integration you want to deploy:" },
    { description: "Get the version ID of the latest available published version:" },
    { description: "Set up connection credentials (must be escaped):" },
    {
      description: "Create an instance with config variables and labels:",
      options: {
        name: "Acme Inc",
        description: "Acme Inc instance for Smith Rocket Co",
        integration: `\${VERSION_ID}`,
        customer: `\${CUSTOMER_ID}`,
        "config-vars": `[{"key":"My Endpoint","value":"https://example.com/api"},{"key":"Do Thing?","value":"true"},{"key":"Acme Basic Auth","values":"\${CREDENTIALS}"}]`,
        label: ["Production", "Paid"],
      },
    },
  ],
  options: z.object({
    name: z.string().describe("name of your new instance."),
    integration: z
      .string()
      .describe(
        "ID of the integration or a specific integration version ID this is an instance of",
      ),
    customer: z.string().describe("ID of customer to deploy to"),
    description: z.string().optional().describe("longer description of the instance"),
    "config-vars": z
      .string()
      .optional()
      .describe("config variables to bind to steps of your instance"),
    label: z
      .array(z.string())
      .optional()
      .describe("a label or set of labels to apply to the instance"),
  }),
  async run(context) {
    const {
      options: { name, description, integration, customer, "config-vars": configVars, label },
    } = context;

    const result = await gqlRequest({
      document: CREATE_INSTANCE,
      variables: {
        name,
        description,
        integration,
        customer,
        configVariables: parseJsonOrUndefined(configVars),
        labels: label,
      },
    });

    const resourceId = result.createInstance?.instance?.id;
    if (resourceId == null)
      throw new Errors.IncurError({
        code: "VALIDATION_ERROR",
        message: "Instance was not created",
        exitCode: 2,
      });
    return context.ok(
      { instanceId: resourceId },
      {
        cta: {
          commands: [
            {
              command: "instances flow-configs list",
              description: "Inspect this instance's flows",
              args: { instance: resourceId },
            },
          ],
        },
      },
    );
  },
  alias: {
    label: "l",
    "config-vars": "v",
    description: "d",
    customer: "c",
    integration: "i",
    name: "n",
  },
});
