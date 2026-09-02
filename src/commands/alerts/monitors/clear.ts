import { arg, commandInput, defineCommand, type CommandContext } from "../../../command.js";
import { gql, gqlRequest } from "../../../graphql.js";

export default defineCommand({
  description: "Clear an Alert Monitor",
  args: {
    monitor: arg.string({
      required: true,
      description: "ID of the monitor to clear",
    }),
  },
  async run(_context: CommandContext) {
    const {
      args: { monitor },
    } = commandInput();

    await gqlRequest({
      document: gql`
        mutation clearAlertMonitor($id: ID!) {
          clearAlertMonitor(input: { id: $id }) {
            alertMonitor {
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
        id: monitor,
      },
    });
  },
});
