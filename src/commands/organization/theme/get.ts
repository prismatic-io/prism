import { Cli, z } from "incur";
import { warningsOutput } from "../../../output.js";
import { describeTheme, readTheme, variantOption } from "./theme.js";

const entries = z.record(z.string(), z.string());

export default Cli.command({
  output: z
    .object({
      variants: z.record(z.string(), z.object({ colors: entries, properties: entries })),
    })
    .extend(warningsOutput),
  description:
    "Show your Organization's theme colors and properties.\nVariants: light and dark style your team's Prismatic app; embedded-light and embedded-dark style embedded screens for your customers. Unset values use Prismatic defaults.",
  options: z.object({
    variant: variantOption.optional().describe("only show this theme variant"),
  }),
  examples: [
    {
      description: "Show the theme your customers see in embedded screens:",
      options: { variant: "embedded-light" },
    },
  ],
  async run(context) {
    return { variants: describeTheme(await readTheme(), context.options.variant) };
  },
});
