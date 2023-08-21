import { Command, Args, Flags } from "@oclif/core";
import { gql, gqlRequest } from "../../graphql";

export default class UpdateCommand extends Command {
  // TODO: Add more flags once optional updates are implemented
  static description = "Update a Customer";
  static args = {
    customer: Args.string({
      required: true,
      description: "ID of a customer",
    }),
  };

  static flags = {
    name: Flags.string({
      char: "n",
      description: "name of the customer",
      required: false,
    }),
    description: Flags.string({
      char: "d",
      description: "description of the customer",
      required: false,
    }),
    externalId: Flags.string({
      char: "e",
      description: "external ID of the customer from your system",
    }),
    label: Flags.string({
      char: "l",
      description: "a label to apply to the customer",
      multiple: true,
    }),
  };

  static examples = [
    {
      description:
        "Apply multiple labels to a customer (note: previously set labels will be overwritten)",
      command:
        'prism customers:update Q3VzdG9tZXI6MmUzZDllOTUtMWIyMy00N2FjLTk3MjUtMzU1OTA2YzgyZWZj --label "Prod Customers" --label "Beta Testers"',
    },
  ];

  async run() {
    const {
      args: { customer },
      flags: { name, description, externalId, label },
    } = await this.parse(UpdateCommand);

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

    this.log(result.updateCustomer.customer.id);
  }
}
