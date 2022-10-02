import { Command, Flags } from "@oclif/core";
import { gql, gqlRequest } from "../../graphql";

export default class UpdateCommand extends Command {
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
      document: gql`
        mutation updateOrganization($name: String) {
          updateOrganization(input: { name: $name }) {
            organization {
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
      },
    });

    this.log(result.updateOrganization.organization.id);
  }
}
