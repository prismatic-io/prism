import type { ResultOf } from "@graphql-typed-document-node/core";
import { UpdateOrganizationDocument as UPDATE_ORGANIZATION } from "../../graphql/operations/updateOrganization.generated.js";
import { Flags } from "@oclif/core";
import { PrismaticBaseCommand } from "../../baseCommand.js";
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

    const result: ResultOf<typeof UPDATE_ORGANIZATION> = await gqlRequest({
      document: UPDATE_ORGANIZATION,
      variables: {
        name,
      },
    });

    this.log(
      result.updateOrganization?.organization?.id ?? this.error("Organization was not updated"),
    );
  }
}
