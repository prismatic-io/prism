import { Command, ux } from "@oclif/core";
import { gql, gqlRequest } from "../../../graphql.js";

export default class ListCommand extends Command {
  static description = "List Credentials available to the entire Organization";
  static flags = { ...ux.table.flags() };

  async run() {
    const { flags } = await this.parse(ListCommand);

    const result = await gqlRequest({
      document: gql`
        query listOrganizationCredentials {
          organization {
            credentials {
              nodes {
                id
                label
                authorizationMethod {
                  id
                  label
                }
                readyForUse
              }
            }
          }
        }
      `,
    });

    ux.table(
      result.organization.credentials.nodes,
      {
        id: {
          minWidth: 8,
          extended: true,
        },
        label: {},
        authorizationMethod: {
          header: "Authorization Method",
          get: (row: any) => row.authorizationMethod.label,
        },
        readyForUse: {
          header: "Ready for Use",
        },
      },
      { ...flags },
    );
  }
}
