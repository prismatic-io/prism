import { Command, Args, Flags } from "@oclif/core";
import { gql, gqlRequest } from "../../graphql.js";

export default class AvailableCommand extends Command {
  static description = "Mark an Integration version as available or unavailable";
  static args = {
    integration: Args.string({
      required: true,
      description: "ID of an integration version",
    }),
  };
  static flags = {
    available: Flags.boolean({
      required: true,
      char: "a",
      description: "Version is available or unavailable",
      allowNo: true,
    }),
  };

  async run() {
    const {
      args: { integration },
      flags: { available },
    } = await this.parse(AvailableCommand);

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

    this.log(result.updateIntegrationVersionAvailability.integration.id);
  }
}
