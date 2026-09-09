import { Flags } from "@oclif/core";
import { PrismaticBaseCommand } from "../../baseCommand.js";
import { CreateCustomerDocument as CREATE_CUSTOMER } from "../../graphql/operations/createCustomer.generated.js";
import { gqlRequest } from "../../graphql.js";

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
        '<%= config.bin %> <%= command.id %> --name "Widgets Inc" --externalId "abc-123" --label "Prod Customers" --label "Beta Testers"',
    },
  ];

  async run() {
    const {
      flags: { name, description, externalId, label },
    } = await this.parse(CreateCommand);

    const result = await gqlRequest({
      document: CREATE_CUSTOMER,
      variables: {
        name,
        description,
        externalId,
        labels: label,
      },
    });

    this.log(
      result.createCustomer?.customer?.id ?? this.error("The operation returned no resource"),
    );
  }
}
