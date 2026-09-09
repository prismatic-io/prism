import { Flags } from "@oclif/core";
import { PrismaticBaseCommand } from "../../baseCommand.js";
import { UpdateOrganizationDocument as UPDATE_ORGANIZATION } from "../../graphql/operations/updateOrganization.generated.js";
import { gqlRequest } from "../../graphql.js";

export default class UpdateCommand extends PrismaticBaseCommand {
  // TODO: Add more flags once optional updates are implemented
  static description = "Update your Organization";
  static flags = {
    name: Flags.string({
      char: "n",
      description: "name of the organization",
    }),
  };

  async run() {
    const {
      flags: { name },
    } = await this.parse(UpdateCommand);

    const result = await gqlRequest({
      document: UPDATE_ORGANIZATION,
      variables: {
        name,
      },
    });

    this.log(
      result.updateOrganization?.organization?.id ??
        this.error("The operation returned no resource"),
    );
  }
}
