import { Command, ux } from "@oclif/core";
import { gql, gqlRequest } from "../../../graphql";

export default class ListCommand extends Command {
  static description = "List Log Severities for use by Alert Triggers";
  static flags = { ...ux.table.flags() };

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

    ux.table(
      result.logSeverityLevels,
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
