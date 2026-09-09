import { UpdateUserDocument as UPDATE_USER } from "../../../graphql/operations/updateUser.generated.js";
import { gqlRequest } from "../../../graphql.js";
import { warningsOutput } from "../../../output.js";
import { z, Cli } from "incur";

export default Cli.command({
  output: z.object({ userId: z.string() }).extend(warningsOutput),
  description: "Update a User",
  args: z.object({
    user: z.string().describe("ID of a user"),
  }),
  options: z.object({
    name: z.string().optional().describe("name of the user"),
    phone: z.string().optional().describe("phone number of the user"),
    "dark-mode": z.string().optional().describe("whether the user should have dark mode enabled"),
    "dark-mode-os-sync": z
      .string()
      .optional()
      .describe("whether dark mode should sync with OS settings"),
  }),
  alias: { "dark-mode-os-sync": "o", "dark-mode": "d", phone: "p", name: "n" },
  async run(context) {
    const {
      args: { user },
      options: { name, phone, "dark-mode": darkMode, "dark-mode-os-sync": darkModeOsSync },
    } = context;

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
    const userId = result.updateUser?.user?.id;
    if (userId == null)
      return context.error({
        code: "CUSTOMER_USERS_UPDATE_FAILED",
        message: "Customer user was not updated",
        exitCode: 2,
        retryable: false,
        cta: {
          commands: [
            {
              command: "customers list",
              description: "Inspect customers before retrying this change",
            },
          ],
        },
      });

    return {
      userId,
    };
  },
});
