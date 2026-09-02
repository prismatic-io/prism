import {
  arg,
  commandInput,
  commandOutput,
  defineCommand,
  option,
  type CommandContext,
} from "../../../command.js";
import { gql, gqlRequest } from "../../../graphql.js";

export default defineCommand({
  description: "Update a User",
  args: {
    user: arg.string({
      required: true,
      description: "ID of a user",
    }),
  },
  options: {
    name: option.string({
      char: "n",
      description: "name of the user",
      required: false,
    }),
    phone: option.string({
      char: "p",
      description: "phone number of the user",
      required: false,
    }),
    "dark-mode": option.string({
      char: "d",
      description: "whether the user should have dark mode enabled",
      required: false,
    }),
    "dark-mode-os-sync": option.string({
      char: "o",
      description: "whether dark mode should sync with OS settings",
      required: false,
    }),
  },
  async run(_context: CommandContext) {
    const {
      args: { user },
      flags: { name, phone, "dark-mode": darkMode, "dark-mode-os-sync": darkModeOsSync },
    } = commandInput();

    const result = await gqlRequest({
      document: gql`
        mutation updateUser(
          $user: ID!
          $name: String
          $phone: String
          $darkMode: Boolean
          $darkModeOsSync: Boolean
        ) {
          updateUser(
            input: {
              id: $user
              name: $name
              phone: $phone
              darkMode: $darkMode
              darkModeSyncWithOs: $darkModeOsSync
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
        user,
        name,
        phone,
        darkMode,
        darkModeOsSync,
      },
    });

    commandOutput.log(result.updateUser.user.id);
  },
});
