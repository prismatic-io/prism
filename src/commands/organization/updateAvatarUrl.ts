import { Command, Flags } from "@oclif/core";
import { gqlRequest, gql } from "../../graphql";

export default class UpdateAvatarUrlCommand extends Command {
  // TODO: Add more flags once optional updates are implemented
  static description = "Update your Organization Avatar URL";

  static flags = {
    organizationId: Flags.string({
      name: "organization",
      required: true,
      description: "ID of an organization",
    }),
    avatarUrl: Flags.string({
      char: "n",
      required: false,
      description: "Url of the organization avatar",
    }),
  };

  async run() {
    const {
      flags: { organizationId, avatarUrl },
    } = await this.parse(UpdateAvatarUrlCommand);

    const result = await gqlRequest({
      document: gql`
        mutation commitAvatarUpload($organizationId: ID!, $avatarUrl: String!) {
          updateOrganization(
            input: { id: $organizationId, avatarUrl: $avatarUrl }
          ) {
            organization {
              id
              avatarUrl
            }
            errors {
              field
              messages
            }
          }
        }
      `,
      variables: {
        organizationId,
        avatarUrl,
      },
    });

    this.log(result.updateOrganization.organization.id);
  }
}
