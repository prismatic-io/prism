import {
  arg,
  commandInput,
  commandOutput,
  defineCommand,
  option,
  type CommandContext,
} from "../../command.js";
import { parseJsonOrUndefined } from "../../fields.js";
import { gql, gqlRequest } from "../../graphql.js";

export default defineCommand({
  description: "Update an Integration's name or description",
  args: {
    integration: arg.string({
      required: true,
      description: "ID of an integration",
    }),
  },
  options: {
    name: option.string({
      char: "n",
      description: "new name to give the integration",
    }),
    description: option.string({
      char: "d",
      description: "new description to give the integration",
    }),
    customer: option.string({
      char: "c",
      description: "ID of customer with which to associate the integration",
    }),
    "test-config-vars": option.string({
      description: "JSON-formatted config variables to be used for testing",
    }),
  },
  async run(_context: CommandContext) {
    const {
      args: { integration },
      flags: { name, description, customer, "test-config-vars": testConfigVars },
    } = commandInput();
    const result = await gqlRequest({
      document: gql`
        mutation updateIntegration(
          $id: ID!
          $name: String
          $description: String
          $customer: ID
          $testConfigVars: [InputInstanceConfigVariable]
        ) {
          updateIntegration(
            input: {
              id: $id
              name: $name
              description: $description
              customer: $customer
              testConfigVariables: $testConfigVars
            }
          ) {
            integration {
              id
            }
            errors {
              field
              messages
            }
          }
        }
      `,
      variables: {
        id: integration,
        name,
        description,
        customer,
        testConfigVars: parseJsonOrUndefined(testConfigVars),
      },
    });

    commandOutput.log(result.updateIntegration.integration.id);
  },
});
