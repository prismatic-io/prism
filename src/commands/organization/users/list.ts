import { Command, CliUx } from "@oclif/core";
import { gql, gqlRequest } from "../../../graphql";

export default class ListCommand extends Command {
  static description = "List Users of your Organization";
  static flags = { ...CliUx.ux.table.flags() };

  async run() {
    const { flags } = await this.parse(ListCommand);

    let customerUsers: any[] = [];
    let hasNextPage = true;
    let cursor = "";

    while (hasNextPage) {
      const {
        organization: {
          users: { nodes, pageInfo },
        },
      } = await gqlRequest({
        document: gql`
          query listUsers($after: String) {
            organization {
              users(after: $after) {
                nodes {
                  id
                  name
                  email
                  externalId
                  phone
                  role {
                    name
                  }
                }
                pageInfo {
                  hasNextPage
                  endCursor
                }
              }
            }
          }
        `,
        variables: { after: cursor },
      });
      customerUsers = [...customerUsers, ...nodes];
      cursor = pageInfo.endCursor;
      hasNextPage = pageInfo.hasNextPage;
    }

    CliUx.ux.table(
      customerUsers,
      {
        id: {
          minWidth: 8,
          extended: true,
        },
        name: {},
        email: {},
        phone: {},
        role: {
          get: ({ role }) => role.name,
        },
        externalId: {
          get: ({ externalId }) => externalId || "",
        },
      },
      { ...flags }
    );
  }
}
