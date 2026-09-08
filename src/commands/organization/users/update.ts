import type { ResultOf } from "@graphql-typed-document-node/core";
import { UpdateUserDocument as UPDATE_USER } from "../../../graphql/operations/updateUser.generated.js";
import { Args, Flags } from "@oclif/core";
import { PrismaticBaseCommand } from "../../../baseCommand.js";
import { gqlRequest } from "../../../graphql.js";

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

    const result: ResultOf<typeof UPDATE_USER> = await gqlRequest({
      document: UPDATE_USER,
      variables: {
        user,
        name,
        phone,
        darkMode: darkMode === undefined ? undefined : darkMode === "true",
        darkModeOsSync: darkModeOsSync === undefined ? undefined : darkModeOsSync === "true",
      },
    });

    this.log(result.updateUser?.user?.id ?? this.error("Organization user was not updated"));
  }
}
