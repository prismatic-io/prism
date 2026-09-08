import { commandOutput, defineCommand, argsSchema, optionsSchema } from "../../../command.js";
import { UpdateUserDocument as UPDATE_USER } from "../../../graphql/operations/updateUser.generated.js";
import { gqlRequest } from "../../../graphql.js";
import { resourceOutput, resourceOutputSchema } from "../../../output.js";
import { z } from "incur";
import type { ResultOf } from "@graphql-typed-document-node/core";

export default defineCommand({
  mutates: true,
  output: resourceOutputSchema("userId"),
  description: "Update a User",
  args: argsSchema(
    z.object({
      user: z.string().describe("ID of a user"),
    }),
  ),
  options: optionsSchema(
    z.object({
      name: z
        .string()
        .optional()
        .describe("name of the user")
        .meta({ cli: { char: "n" } }),
      phone: z
        .string()
        .optional()
        .describe("phone number of the user")
        .meta({ cli: { char: "p" } }),
      "dark-mode": z
        .string()
        .optional()
        .describe("whether the user should have dark mode enabled")
        .meta({ cli: { char: "d" } }),
      "dark-mode-os-sync": z
        .string()
        .optional()
        .describe("whether dark mode should sync with OS settings")
        .meta({ cli: { char: "o" } }),
    }),
  ),
  async run(context) {
    const {
      args: { user },
      options: { name, phone, "dark-mode": darkMode, "dark-mode-os-sync": darkModeOsSync },
    } = context;

    const result: ResultOf<typeof UPDATE_USER> = await gqlRequest({
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

    return resourceOutput(
      context,
      "userId",
      result.updateUser?.user?.id ?? commandOutput.error("Organization user was not updated"),
    );
  },
});
