import { arg, commandInput, defineCommand, type CommandContext } from "../../command.js";
import { gql, gqlRequest } from "../../graphql.js";

export default defineCommand({
  description: "Delete an Instance",
  args: {
    instance: arg.string({
      required: true,
      description: "ID of the instance to delete",
    }),
  },
  async run(_context: CommandContext) {
    const {
      args: { instance },
    } = commandInput();

    await gqlRequest({
      document: gql`
        mutation deleteInstance($id: ID!) {
          deleteInstance(input: { id: $id }) {
            instance {
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
        id: instance,
      },
    });
  },
});
