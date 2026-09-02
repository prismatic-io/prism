import {
  arg,
  commandInput,
  commandOutput,
  defineCommand,
  option,
  type CommandContext,
} from "../../command.js";
import { gql, gqlRequest } from "../../graphql.js";

export default defineCommand({
  description: "Mark an Integration version as available or unavailable",
  args: {
    integration: arg.string({
      required: true,
      description: "ID of an integration version",
    }),
  },
  options: {
    available: option.boolean({
      required: true,
      char: "a",
      description: "Version is available or unavailable",
      allowNo: true,
    }),
  },
  async run(_context: CommandContext) {
    const {
      args: { integration },
      flags: { available },
    } = commandInput();

    const result = await gqlRequest({
      document: gql`
        mutation markAvailability($id: ID!, $available: Boolean!) {
          updateIntegrationVersionAvailability(
            input: { id: $id, available: $available }
          ) {
            integration {
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
        id: integration,
        available,
      },
    });

    commandOutput.log(result.updateIntegrationVersionAvailability.integration.id);
  },
});
