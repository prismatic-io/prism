import {
  commandInput,
  commandOutput,
  defineCommand,
  option,
  type CommandContext,
} from "../../command.js";
import { gql, gqlRequest } from "../../graphql.js";

export default defineCommand({
  description: "Create an Integration",
  options: {
    name: option.string({
      char: "n",
      required: true,
      description: "name of the integration to create",
    }),
    description: option.string({
      char: "d",
      required: true,
      description: "longer description of the integration",
    }),
    customer: option.string({
      char: "c",
      description: "ID of customer with which to associate the integration",
    }),
  },
  async run(_context: CommandContext) {
    const {
      flags: { name, description, customer },
    } = commandInput();

    const result = await gqlRequest({
      document: gql`
        mutation createIntegration(
          $name: String!
          $description: String!
          $customer: ID
        ) {
          createIntegration(
            input: {
              name: $name
              description: $description
              customer: $customer
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
        name,
        description,
        customer,
      },
    });

    commandOutput.log(result.createIntegration.integration.id);
  },
});
