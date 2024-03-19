import { Command, Flags } from "@oclif/core";
import { gql, gqlRequest } from "../../../graphql.js";

export default class CreateCommand extends Command {
  static description = "Create a User for your Organization";
  static flags = {
    name: Flags.string({ char: "n", description: "name of the user" }),
    email: Flags.string({
      char: "e",
      required: true,
      description: "email address of the user",
    }),
    role: Flags.string({
      char: "r",
      required: true,
      description: "role the user should assume",
    }),
  };

  async run() {
    const {
      flags: { name, email, role },
    } = await this.parse(CreateCommand);

    const result = await gqlRequest({
      document: gql`
        mutation createOrganizationUser(
          $name: String
          $email: String!
          $role: ID!
        ) {
          createOrganizationUser(
            input: { name: $name, email: $email, role: $role }
          ) {
            user {
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
        name,
        email,
        role,
      },
    });

    this.log(result.createOrganizationUser.user.id);
  }
}
