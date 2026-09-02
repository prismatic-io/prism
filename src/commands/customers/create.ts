import {
  commandInput,
  commandOutput,
  defineCommand,
  option,
  type CommandContext,
} from "../../command.js";
import { gql, gqlRequest } from "../../graphql.js";

export default defineCommand({
  description: "Create a new Customer",
  options: {
    name: option.string({
      char: "n",
      required: true,
      description: "short name of the new customer",
    }),
    description: option.string({
      char: "d",
      description: "longer description of the customer",
      required: false,
    }),
    externalId: option.string({
      char: "e",
      description: "external ID of the customer from your system",
    }),
    label: option.string({
      char: "l",
      description: "a label to apply to the customer",
      multiple: true,
    }),
  },
  examples: [
    {
      description: "Apply multiple labels to a customer",
      command:
        '<%= config.bin %> <%= command.id %> --name "Widgets Inc" --externalId "abc-123" --label "Prod Customers" --label "Beta Testers"',
    },
  ],
  async run(_context: CommandContext) {
    const {
      flags: { name, description, externalId, label },
    } = commandInput();

    const result = await gqlRequest({
      document: gql`
        mutation createCustomer(
          $name: String!
          $description: String
          $externalId: String
          $labels: [String]
        ) {
          createCustomer(
            input: {
              name: $name
              description: $description
              externalId: $externalId
              labels: $labels
            }
          ) {
            customer {
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
        externalId,
        labels: label,
      },
    });

    commandOutput.log(result.createCustomer.customer.id);
  },
});
