import {
  commandInput,
  commandOutput,
  defineCommand,
  option,
  type CommandContext,
} from "../../command.js";
import { gql, gqlRequest } from "../../graphql.js";

export default defineCommand({
  description: "Update your Organization Avatar URL",
  options: {
    organizationId: option.string({
      name: "organization",
      required: true,
      description: "ID of an organization",
    }),
    avatarUrl: option.string({
      char: "n",
      required: false,
      description: "Url of the organization avatar",
    }),
  },
  async run(_context: CommandContext) {
    const {
      flags: { organizationId, avatarUrl },
    } = commandInput();

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

    commandOutput.log(result.updateOrganization.organization.id);
  },
});
