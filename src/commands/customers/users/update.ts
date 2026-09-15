import { Cli, z } from "incur";
import { UpdateUserDocument as UPDATE_USER } from "../../../graphql/operations/updateUser.generated.js";
import { gqlRequest } from "../../../graphql.js";
import { warningsOutput } from "../../../output.js";
import { customerFailure } from "../errors.js";
import { nonBlank } from "../schemas.js";

export default Cli.command({
  output: z.object({ userId: nonBlank }).extend(warningsOutput),
  description: "Update a User",
  args: z.object({
    user: nonBlank.describe("ID of a user"),
  }),
  options: z
    .object({
      name: nonBlank.optional().describe("name of the user"),
      phone: z.string().optional().describe("phone number of the user"),
      "dark-mode": z
        .enum(["true", "false"])
        .optional()
        .describe("whether the user should have dark mode enabled"),
      "dark-mode-os-sync": z
        .enum(["true", "false"])
        .optional()
        .describe("whether dark mode should sync with OS settings"),
    })
    .refine(
      (options) =>
        options.name !== undefined ||
        options.phone !== undefined ||
        options["dark-mode"] !== undefined ||
        options["dark-mode-os-sync"] !== undefined,
      {
        message: "Provide at least one field to update",
      },
    ),
  alias: { "dark-mode-os-sync": "o", "dark-mode": "d", phone: "p", name: "n" },
  async run(context) {
    const {
      args: { user },
      options: { name, phone, "dark-mode": darkMode, "dark-mode-os-sync": darkModeOsSync },
    } = context;

    try {
      const result = await gqlRequest({
        document: UPDATE_USER,
        variables: {
          user,
          name,
          phone,
          darkMode: darkMode === undefined ? undefined : darkMode === "true",
          darkModeOsSync: darkModeOsSync === undefined ? undefined : darkModeOsSync === "true",
        },
      });
      const userId = result.updateUser?.user?.id;
      if (!userId)
        return context.error({
          code: "CUSTOMER_USERS_UPDATE_FAILED",
          message: "Customer user was not updated",
          exitCode: 1,
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

      return context.ok(
        { userId },
        {
          cta: {
            commands: [
              {
                command: "customers list",
                description: "Find the customer whose users you want to inspect",
              },
            ],
          },
        },
      );
    } catch (error) {
      return context.error({
        ...customerFailure(error, "CUSTOMER_USERS_UPDATE_FAILED"),
        cta: {
          commands: [
            {
              command: "customers list",
              description: "Inspect customers before retrying this change",
            },
          ],
        },
      });
    }
  },
});
