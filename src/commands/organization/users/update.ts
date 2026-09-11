import { Args, Flags } from "@oclif/core";
import { PrismaticBaseCommand } from "../../../baseCommand.js";
import { UpdateUserDocument as UPDATE_USER } from "../../../graphql/operations/updateUser.generated.js";
import { gqlRequest } from "../../../graphql.js";
import { parseOptionalBoolean } from "../../../utils/boolean.js";

export default class UpdateCommand extends PrismaticBaseCommand {
  static description = "Update a User";
  static args = {
    user: Args.string({
      required: true,
      description: "ID of a user",
    }),
  };

  static flags = {
    name: Flags.string({ char: "n", description: "name of the user" }),
    phone: Flags.string({ char: "p", description: "phone number of the user" }),
    "dark-mode": Flags.string({
      char: "d",
      description: "whether the user should have dark mode enabled",
    }),
    "dark-mode-os-sync": Flags.string({
      char: "o",
      description: "whether dark mode should sync with OS settings",
    }),
  };

  async run() {
    const {
      args: { user },
      flags: { name, phone, "dark-mode": darkMode, "dark-mode-os-sync": darkModeOsSync },
    } = await this.parse(UpdateCommand);

    const result = await gqlRequest({
      document: UPDATE_USER,
      variables: {
        user,
        name,
        phone,
        darkMode: parseOptionalBoolean(darkMode),
        darkModeOsSync: parseOptionalBoolean(darkModeOsSync),
      },
    });

    const userId = result.updateUser?.user?.id;
    if (userId == null) {
      this.error("The operation returned no resource");
    }

    this.log(userId);
  }
}
