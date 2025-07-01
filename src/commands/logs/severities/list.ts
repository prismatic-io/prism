import { ux } from "@oclif/core";
import { PrismaticBaseCommand } from "../../../baseCommand.js";
import { gql, gqlRequest } from "../../../graphql.js";

export default class ListCommand extends PrismaticBaseCommand {
  static description = "List Log Severities for use by Alert Triggers";
  static flags = {
    ...PrismaticBaseCommand.baseFlags,
    ...ux.table.flags(),
  };

  async run() {
    const { flags } = await this.parse(ListCommand);

    const result = await gqlRequest({
      document: gql`
        query listLogSeverityLevels {
          logSeverityLevels {
            id
            name
          }
        }
      `,
    });

    if (flags.json) {
      this.logJsonOutput(result.logSeverityLevels);
    } else {
      ux.table(
        result.logSeverityLevels,
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
