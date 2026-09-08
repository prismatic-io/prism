import { Errors, z } from "incur";
import { isLoggedIn, login } from "../../auth.js";
import { defineCommand, isCommandTransportExecution, optionsSchema } from "../../command.js";
import { getActiveProfileName } from "../../config.js";

export const loginEventSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("authentication-challenge"), profile: z.string(), url: z.string() }),
  z.object({
    type: z.literal("authenticated"),
    profile: z.string(),
    alreadyAuthenticated: z.boolean(),
  }),
]);
export default defineCommand({
  mutates: true,
  output: loginEventSchema,
  description: "Log in to your Prismatic account",
  options: optionsSchema(
    z.object({
      force: z
        .boolean()
        .default(false)
        .describe("re-authenticate, even if you are already logged in")
        .meta({ cli: { char: "f" } }),
      url: z
        .boolean()
        .default(false)
        .describe("returns a challenge url without automatically opening a browser")
        .meta({ cli: { char: "u" } }),
      "tenant-id": z
        .string()
        .optional()
        .describe("Select this tenant without prompting after authentication"),
    }),
  ),
  authContext: "profile" as const,
  async *run(context): AsyncGenerator<z.infer<typeof loginEventSchema>> {
    const { force, url, "tenant-id": tenantId } = context.options;
    const profile = await getActiveProfileName();
    if (!force && (await isLoggedIn())) {
      yield { type: "authenticated", profile, alreadyAuthenticated: true };
      return;
    }
    if (
      context.agent &&
      (isCommandTransportExecution() || (context.formatExplicit && context.format !== "jsonl"))
    ) {
      throw new Errors.IncurError({
        code: "AUTHENTICATION_REQUIRED",
        exitCode: 2,
        message:
          "Authentication requires a browser challenge. Run prism login --url in a terminal, or prism login --agent --yes --format jsonl to receive the challenge immediately. Then retry with the authenticated profile.",
      });
    }
    const abort = new AbortController();
    const signal = context.var.signal
      ? AbortSignal.any([context.var.signal, abort.signal])
      : abort.signal;
    let showChallenge!: (url: string) => void;
    const challenge = new Promise<string>((resolve) => {
      showChallenge = resolve;
    });
    const authentication = login({
      nonInteractive: context.agent,
      url: url || context.agent,
      profileName: profile,
      tenantId,
      signal,
      onChallenge: showChallenge,
    });
    try {
      const first = await Promise.race([
        challenge.then((url) => ({ url })),
        authentication.then(() => ({ url: undefined })),
      ]);
      if (first.url) yield { type: "authentication-challenge", profile, url: first.url };
      await authentication;
      yield { type: "authenticated", profile, alreadyAuthenticated: false };
    } finally {
      abort.abort();
      await authentication.catch(() => {});
    }
  },
});
