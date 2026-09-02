import {
  arg,
  commandInput,
  commandOutput,
  defineCommand,
  option,
  type CommandContext,
} from "../../command.js";
import { gql, gqlRequest } from "../../graphql.js";

export default defineCommand({
  description: "Update a Customer",
  args: {
    customer: arg.string({
      required: true,
      description: "ID of a customer",
    }),
  },
  options: {
    name: option.string({
      char: "n",
      description: "name of the customer",
      required: false,
    }),
    description: option.string({
      char: "d",
      description: "description of the customer",
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
      description:
        "Apply multiple labels to a customer (note: previously set labels will be overwritten)",
      command:
        '<%= config.bin %> <%= command.id %> Q3VzdG9tZXI6MmUzZDllOTUtMWIyMy00N2FjLTk3MjUtMzU1OTA2YzgyZWZj --label "Prod Customers" --label "Beta Testers"',
    },
  ],
  async run(_context: CommandContext) {
    const {
      args: { customer },
      flags: { name, description, externalId, label },
    } = commandInput();

    const result = await gqlRequest({
      document: gql`
        mutation updateCustomer(
          $id: ID!
          $name: String
          $description: String
          $externalId: String
          $labels: [String]
        ) {
          updateCustomer(
            input: {
              id: $id
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
        id: customer,
        name,
        description,
        externalId,
        labels: label,
      },
    });

    commandOutput.log(result.updateCustomer.customer.id);
  },
});
