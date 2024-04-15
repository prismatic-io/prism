import { Command, Flags } from "@oclif/core";
import { gqlRequest, gql } from "../../graphql.js";

export default class CreateCommand extends Command {
  static description = "Create an Integration";
  static flags = {
    name: Flags.string({
      char: "n",
      required: true,
      description: "name of the integration to create",
    }),
    description: Flags.string({
      char: "d",
      required: true,
      description: "longer description of the integration",
    }),
    customer: Flags.string({
      char: "c",
      description: "ID of customer with which to associate the integration",
    }),
  };

  async run() {
    const {
      flags: { name, description, customer },
    } = await this.parse(CreateCommand);

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

    this.log(result.createIntegration.integration.id);
  }
}
