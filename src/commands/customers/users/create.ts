import { Command, Flags } from "@oclif/core";
import { gqlRequest, gql } from "../../../graphql";

export default class CreateCommand extends Command {
  static description = "Create a User for the specified Customer";
  static flags = {
    email: Flags.string({
      char: "e",
      required: true,
      description: "email address",
    }),
    role: Flags.string({
      char: "r",
      required: true,
      description: "ID of the role to assign the user",
    }),
    customer: Flags.string({
      char: "c",
      required: true,
      description: "ID of the customer this user is associated with",
    }),
    name: Flags.string({
      char: "n",
      description: "name of the new user",
      required: false,
    }),
  };

  async run() {
    const {
      flags: { name, email, role, customer },
    } = await this.parse(CreateCommand);

    const result = await gqlRequest({
      document: gql`
        mutation createCustomerUser(
          $name: String
          $email: String!
          $role: ID!
          $customer: ID!
        ) {
          createCustomerUser(
            input: {
              name: $name
              email: $email
              role: $role
              customer: $customer
            }
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
        customer,
      },
    });

    this.log(result.createCustomerUser.user.id);
  }
}
