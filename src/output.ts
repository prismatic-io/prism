import { z } from "incur";

export const warningsOutput = { warnings: z.array(z.string()).optional() };

// Incur appends CTA values verbatim. Preserve shell arguments and the selected
// profile at the transport boundary, while commands declare native CTAs.
const quoteArgument = (value: unknown) =>
  typeof value !== "string" || /^[-A-Za-z0-9_./:@%+=,]+$/.test(value)
    ? value
    : `'${value.replaceAll("'", "'\\''")}'`;

export function prepareCta(cta: unknown, profile?: string): unknown {
  if (!cta || typeof cta !== "object" || !("commands" in cta) || !Array.isArray(cta.commands))
    return cta;
  const quoteValues = (values: unknown) =>
    values && typeof values === "object"
      ? Object.fromEntries(
          Object.entries(values).map(([key, value]) => [key, quoteArgument(value)]),
        )
      : values;
  return {
    ...cta,
    commands: cta.commands.map((command) =>
      typeof command === "string"
        ? command
        : {
            ...command,
            args: quoteValues(command.args),
            options: quoteValues(profile ? { ...command.options, profile } : command.options),
          },
    ),
  };
}
