import { arg, commandInput, defineCommand, type CommandContext } from "../../command.js";
import { gql, gqlRequest } from "../../graphql.js";

export default defineCommand({
  description: "Delete an On-Premise Resource",
  args: {
    resource: arg.string({
      required: true,
      description: "ID of the On-Premise Resource to delete",
    }),
  },
  async run(_context: CommandContext) {
    const {
      args: { resource },
    } = commandInput();

    await gqlRequest({
      document: gql`
        mutation deleteOnPremiseResource($id: ID!) {
          deleteOnPremiseResource(input: { id: $id }) {
            onPremiseResource {
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
        id: resource,
      },
    });
  },
});
