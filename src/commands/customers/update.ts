import { Args, Flags } from "@oclif/core";
import { PrismaticBaseCommand } from "../../baseCommand.js";
import { UpdateCustomerDocument as UPDATE_CUSTOMER } from "../../graphql/operations/updateCustomer.generated.js";
import { gqlRequest } from "../../graphql.js";

export default class UpdateCommand extends PrismaticBaseCommand {
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
        '<%= config.bin %> <%= command.id %> Q3VzdG9tZXI6MmUzZDllOTUtMWIyMy00N2FjLTk3MjUtMzU1OTA2YzgyZWZj --label "Prod Customers" --label "Beta Testers"',
    },
  ];

  async run() {
    const {
      args: { customer },
      flags: { name, description, externalId, label },
    } = await this.parse(UpdateCommand);

    const result = await gqlRequest({
      document: UPDATE_CUSTOMER,
      variables: {
        id: customer,
        name,
        description,
        externalId,
        labels: label,
      },
    });

    const customerId = result.updateCustomer?.customer?.id;
    if (customerId == null) {
      this.error("The operation returned no resource");
    }

    this.log(customerId);
  }
}
