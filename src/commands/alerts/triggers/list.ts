import { ux } from "@oclif/core";
import { PrismaticBaseCommand } from "../../../baseCommand.js";
import { gqlRequest, gql } from "../../../graphql.js";

export default class ListCommand extends PrismaticBaseCommand {
  static description = "List Alert Triggers";
  static flags = { ...PrismaticBaseCommand.baseFlags, ...ux.table.flags() };

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

    if (flags.json) {
      this.logJsonOutput(result.alertTriggers.nodes);
    } else {
      ux.table(
        result.alertTriggers.nodes,
        {
          id: {
            minWidth: 8,
            extended: true,
          },
          name: {},
        },
        { ...flags },
      );
    }
  }
}
