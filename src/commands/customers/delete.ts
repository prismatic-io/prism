import { arg, commandInput, defineCommand, type CommandContext } from "../../command.js";
import { gql, gqlRequest } from "../../graphql.js";

export default defineCommand({
  description: "Delete a Customer",
  args: {
    customer: arg.string({
      required: true,
      description: "ID of the customer to delete",
    }),
  },
  async run(_context: CommandContext) {
    const {
      args: { customer },
    } = commandInput();

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
  },
});
