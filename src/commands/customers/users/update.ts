import { Command, Args, Flags } from "@oclif/core";
import { gqlRequest, gql } from "../../../graphql.js";

export default class UpdateCommand extends Command {
  static description = "Update a User";
  static args = {
    user: Args.string({
      required: true,
      description: "ID of a user",
    }),
  };

  static flags = {
    name: Flags.string({
      char: "n",
      description: "name of the user",
      required: false,
    }),
    phone: Flags.string({
      char: "p",
      description: "phone number of the user",
      required: false,
    }),
    "dark-mode": Flags.string({
      char: "d",
      description: "whether the user should have dark mode enabled",
      required: false,
    }),
    "dark-mode-os-sync": Flags.string({
      char: "o",
      description: "whether dark mode should sync with OS settings",
      required: false,
    }),
  };

  async run() {
    const {
      args: { user },
      flags: { name, phone, "dark-mode": darkMode, "dark-mode-os-sync": darkModeOsSync },
    } = await this.parse(UpdateCommand);

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

    this.log(result.updateUser.user.id);
  }
}
