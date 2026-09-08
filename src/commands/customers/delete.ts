import { DeleteCustomerDocument as DELETE_CUSTOMER } from "../../graphql/operations/deleteCustomer.generated.js";
import { Args } from "@oclif/core";
import { PrismaticBaseCommand } from "../../baseCommand.js";
import { gqlRequest } from "../../graphql.js";

export default class DeleteCommand extends PrismaticBaseCommand {
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
      document: DELETE_CUSTOMER,
      variables: {
        id: customer,
      },
    });
  }
}
