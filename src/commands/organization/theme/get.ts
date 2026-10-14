import { Cli, z } from "incur";
import { warningsOutput } from "../../../output.js";
import { describeTheme, readTheme, variantOption } from "./values.js";

const entries = z.record(z.string(), z.string());

export default Cli.command({
  output: z
    .object({
      variants: z.record(z.string(), z.object({ colors: entries, properties: entries })),
    })
    .extend(warningsOutput),
  description: "Show your organization's theme colors and properties by variant",
  options: z.object({
    variant: variantOption
      .optional()
      .describe(
        "only show this variant: light and dark style your team's Prismatic app, embedded-light and embedded-dark style embedded screens",
      ),
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
