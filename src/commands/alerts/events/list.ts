import { Command, CliUx } from "@oclif/core";
import { gqlRequest, gql } from "../../../graphql";

export default class ListCommand extends Command {
  static description = "List Alert Events for an Alert Monitor";
  static args = [
    {
      name: "alertMonitorId",
      description: "ID of an alert monitor",
      required: true,
    },
  ];
  static flags = {
    ...CliUx.ux.table.flags(),
  };

  async run() {
    const {
      flags,
      args: { alertMonitorId },
    } = await this.parse(ListCommand);

    const result = await gqlRequest({
      document: gql`
        query listAlertEvents($alertMonitorId: ID) {
          alertEvents(
            monitor: $alertMonitorId
            sortBy: [{ field: CREATED_AT, direction: DESC }]
          ) {
            nodes {
              id
              monitor {
                name
              }
              createdAt
              details
            }
          }
        }
      `,
      variables: {
        alertMonitorId,
      },
    });

    CliUx.ux.table(
      result.alertEvents.nodes,
      {
        id: {
          minWidth: 8,
          extended: true,
        },
        name: {
          get: (row: any) => row.monitor.name,
          header: "Name",
        },
        createdAt: {
          header: "Timestamp",
        },
        details: {},
      },
      { ...flags }
    );
  }
}
