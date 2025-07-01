import { ux } from "@oclif/core";
import { PrismaticBaseCommand } from "../../../baseCommand.js";
import { gql, gqlRequest } from "../../../graphql.js";

export default class ListCommand extends PrismaticBaseCommand {
  static description = "List Credentials available to the entire Organization";
  static flags = {
    ...PrismaticBaseCommand.baseFlags,
    ...ux.table.flags(),
  };

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

    if (flags.json) {
      this.logJsonOutput(result.organization.credentials.nodes);
    } else {
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
}
