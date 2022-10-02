import { Command, CliUx } from "@oclif/core";
import { gqlRequest, gql } from "../../graphql";

interface AuthMethod {
  [index: string]: unknown;
  id: string;
  key: string;
  label: string;
  fields: {
    nodes: {
      key: string;
    }[];
  };
}

export default class ListCommand extends Command {
  static description = "List Authorization Methods that Components can use";
  static flags = { ...CliUx.ux.table.flags() };

  async run() {
    const { flags } = await this.parse(ListCommand);

    const result = await gqlRequest({
      document: gql`
        query listAuthorizationMethods {
          authorizationMethods {
            nodes {
              id
              key
              label
              fields {
                nodes {
                  key
                }
              }
            }
          }
        }
      `,
    });

    const authMethods: AuthMethod[] = result.authorizationMethods.nodes;

    CliUx.ux.table(
      authMethods,
      {
        id: {
          minWidth: 8,
          extended: true,
        },
        key: {},
        label: {},
        fields: {
          get: ({ fields }) => fields.nodes.map((field) => field.key).join(" "),
        },
      },
      { ...flags }
    );
  }
}
