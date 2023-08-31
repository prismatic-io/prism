import { Command, Args } from "@oclif/core";
import { gql, gqlRequest } from "../../graphql";

export default class DeleteCommand extends Command {
  static description = "Delete a Customer";
  static args = {
    customer: Args.string({
      required: true,
      description: "ID of the customer to delete",
    }),
  };

  async run() {
    const {
      args: { customer },
    } = await this.parse(DeleteCommand);

    await gqlRequest({
      document: gql`
        mutation deleteCustomer($id: ID!) {
          deleteCustomer(input: { id: $id }) {
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
      },
    });
  }
}
