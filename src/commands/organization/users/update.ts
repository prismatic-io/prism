import { Args, Flags } from "@oclif/core";
import { z } from "zod";
import { PrismaticBaseCommand } from "../../../baseCommand.js";
import { UpdateUserDocument as UPDATE_USER } from "../../../graphql/operations/updateUser.generated.js";
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

    const result = await gqlRequest({
      document: UPDATE_USER,
      variables: {
        user,
        name,
        phone,
        darkMode:
          darkMode === undefined ? undefined : z.enum(["true", "false"]).parse(darkMode) === "true",
        darkModeOsSync:
          darkModeOsSync === undefined
            ? undefined
            : z.enum(["true", "false"]).parse(darkModeOsSync) === "true",
      },
    });

    this.log(result.updateUser?.user?.id ?? this.error("The operation returned no resource"));
  }
}
