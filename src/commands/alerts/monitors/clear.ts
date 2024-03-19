import { Command, Args } from "@oclif/core";
import { gqlRequest, gql } from "../../../graphql.js";

export default class ClearCommand extends Command {
  static description = "Clear an Alert Monitor";
  static args = {
    monitor: Args.string({
      required: true,
      description: "ID of the monitor to clear",
    }),
  };

  async run() {
    const {
      args: { monitor },
    } = await this.parse(ClearCommand);

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
  }
}
