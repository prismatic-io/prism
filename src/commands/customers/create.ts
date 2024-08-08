import { Flags } from "@oclif/core";
import { PrismaticBaseCommand } from "../../baseCommand.js";
import { gql, gqlRequest } from "../../graphql.js";

export default class CreateCommand extends PrismaticBaseCommand {
  static description = "Create a new Customer";
  static flags = {
    name: Flags.string({
      char: "n",
      required: true,
      description: "short name of the new customer",
    }),
    description: Flags.string({
      char: "d",
      description: "longer description of the customer",
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
      description: "Apply multiple labels to a customer",
      command:
        'prism customers:create --name "Widgets Inc" --externalId "abc-123" --label "Prod Customers" --label "Beta Testers"',
    },
  ];

  async run() {
    const {
      flags: { name, description, externalId, label },
    } = await this.parse(CreateCommand);

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

    this.log(result.createCustomer.customer.id);
  }
}
