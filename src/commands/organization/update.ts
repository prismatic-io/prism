import {
  commandInput,
  commandOutput,
  defineCommand,
  option,
  type CommandContext,
} from "../../command.js";
import { gql, gqlRequest } from "../../graphql.js";

export default defineCommand({
  description: "Update your Organization",
  options: {
    name: option.string({
      char: "n",
      description: "name of the organization",
    }),
  },
  async run(_context: CommandContext) {
    const {
      flags: { name },
    } = commandInput();

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

    commandOutput.log(result.updateOrganization.organization.id);
  },
});
