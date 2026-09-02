import {
  commandInput,
  commandOutput,
  defineCommand,
  option,
  type CommandContext,
} from "../../../command.js";
import { gql, gqlRequest } from "../../../graphql.js";

export default defineCommand({
  description: "Create a User for your Organization",
  examples: [
    {
      description: "Get the ID of the 'Integrator' role:",
      command:
        "ROLE_ID=$(prism organization:users:roles --columns id --no-header --filter 'name=^Integrator$')",
    },
    {
      description: "Create an organization user and assign the role:",
      command:
        // biome-ignore lint/suspicious/noTemplateCurlyInString: TODO
        "<%= config.bin %> <%= command.id %> --email 'foo@email.com' --name 'Susan Foo' --role ${ROLE_ID}",
    },
  ],
  options: {
    name: option.string({ char: "n", description: "name of the user" }),
    email: option.string({
      char: "e",
      required: true,
      description: "email address of the user",
    }),
    role: option.string({
      char: "r",
      required: true,
      description: "role the user should assume",
    }),
  },
  async run(_context: CommandContext) {
    const {
      flags: { name, email, role },
    } = commandInput();

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

    commandOutput.log(result.createOrganizationUser.user.id);
  },
});
