import { Flags } from "@oclif/core";
import { PrismaticBaseCommand } from "../../baseCommand.js";
import { CreateIntegrationDocument as CREATE_INTEGRATION } from "../../graphql/operations/createIntegration.generated.js";
import { gqlRequest } from "../../graphql.js";

export default class CreateCommand extends PrismaticBaseCommand {
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
      document: CREATE_INTEGRATION,
      variables: {
        name,
        description,
        customer,
      },
    });

    const integrationId = result.createIntegration?.integration?.id;
    if (integrationId == null) {
      this.error("The operation returned no resource");
    }

    this.log(integrationId);
  }
}
