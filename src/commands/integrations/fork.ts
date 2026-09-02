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
  description: "Fork an Integration",
  options: {
    name: option.string({
      char: "n",
      required: true,
      description: "name of the forked integration",
    }),
    description: option.string({
      char: "d",
      required: true,
      description: "longer description of the forked integration",
    }),
  },
  args: {
    parent: arg.string({
      required: true,
      description: "ID of the Integration to fork",
    }),
  },
  async run(_context: CommandContext) {
    const {
      flags: { name, description },
      args: { parent },
    } = commandInput();

    const result = await gqlRequest({
      document: gql`
        mutation forkIntegration(
          $parentID: ID!
          $name: String!
          $description: String!
        ) {
          forkIntegration(
            input: { parent: $parentID, name: $name, description: $description }
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
        parentID: parent,
        name,
        description,
      },
    });

    commandOutput.log(result.forkIntegration.integration.id);
  },
});
