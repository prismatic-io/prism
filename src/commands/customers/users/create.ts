import { Flags } from "@oclif/core";
import { PrismaticBaseCommand } from "../../../baseCommand.js";
import { gqlRequest, gql } from "../../../graphql.js";

export default class CreateCommand extends PrismaticBaseCommand {
  static description = "Create a User for the specified Customer";

  static examples = [
    {
      description: "Get the ID of a customer named 'My First Customer':",
      command:
        "CUSTOMER_ID=$(prism customers:list --columns id --no-header --filter 'name=^My First Customer$')",
    },
    {
      description: "Get the ID of the 'Member' role:",
      command:
        "ROLE_ID=$(prism customers:users:roles --columns id --no-header --filter 'name=^Member$')",
    },
    {
      description: "Add a new 'Member' user for the customer:",
      command:
        "<%= config.bin %> <%= command.id %> --email 'bar@email.com' --name 'Thomas Bar' --customer ${CUSTOMER_ID} --role ${ROLE_ID}",
    },
  ];

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
