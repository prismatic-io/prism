import { arg, commandInput, defineCommand, type CommandContext } from "../../command.js";
import { gql, gqlRequest } from "../../graphql.js";

export default defineCommand({
  description: "Delete a Component",
  args: {
    component: arg.string({
      required: true,
      description: "ID of the component to delete",
    }),
  },
  async run(_context: CommandContext) {
    const {
      args: { component },
    } = commandInput();

    await gqlRequest({
      document: gql`
        mutation deleteComponent($id: ID!) {
          deleteComponent(input: { id: $id }) {
            component {
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
        id: component,
      },
    });
  },
});
