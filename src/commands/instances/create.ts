import { commandOutput, defineCommand, optionsSchema } from "../../command.js";
import { parseJsonOrUndefined } from "../../fields.js";
import { CreateInstanceDocument as CREATE_INSTANCE } from "../../graphql/operations/createInstance.generated.js";
import { gqlRequest } from "../../graphql.js";
import { resourceOutput, resourceOutputSchema } from "../../output.js";
import { z } from "incur";
import type { ResultOf } from "@graphql-typed-document-node/core";

export default defineCommand({
  mutates: true,
  output: resourceOutputSchema("instanceId"),
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
  options: optionsSchema(
    z.object({
      name: z
        .string()
        .describe("name of your new instance.")
        .meta({ cli: { char: "n" } }),
      integration: z
        .string()
        .describe(
          "ID of the integration or a specific integration version ID this is an instance of",
        )
        .meta({ cli: { char: "i" } }),
      customer: z
        .string()
        .describe("ID of customer to deploy to")
        .meta({ cli: { char: "c" } }),
      description: z
        .string()
        .optional()
        .describe("longer description of the instance")
        .meta({ cli: { char: "d" } }),
      "config-vars": z
        .string()
        .optional()
        .describe("config variables to bind to steps of your instance")
        .meta({ cli: { char: "v" } }),
      label: z
        .array(z.string())
        .optional()
        .describe("a label or set of labels to apply to the instance")
        .meta({ cli: { char: "l" } }),
    }),
  ),
  async run(context) {
    const {
      options: { name, description, integration, customer, "config-vars": configVars, label },
    } = context;

    const result: ResultOf<typeof CREATE_INSTANCE> = await gqlRequest({
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

    return resourceOutput(
      context,
      "instanceId",
      result.createInstance?.instance?.id ?? commandOutput.error("Instance was not created"),
    );
  },
});
