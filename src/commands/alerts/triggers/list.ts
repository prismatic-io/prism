import { Command, CliUx } from "@oclif/core";
import { gqlRequest, gql } from "../../../graphql";

export default class ListCommand extends Command {
  static description = "List Alert Triggers";
  static flags = { ...CliUx.ux.table.flags() };

  async run() {
    const { flags } = await this.parse(ListCommand);

    const result = await gqlRequest({
      document: gql`
        query listAlertTriggers {
          alertTriggers {
            nodes {
              id
              name
            }
          }
        }
      `,
    });

    CliUx.ux.table(
      result.alertTriggers.nodes,
      {
        id: {
          minWidth: 8,
          extended: true,
        },
        name: {},
      },
      { ...flags }
    );
  }
}
