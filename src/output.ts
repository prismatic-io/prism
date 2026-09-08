import { z } from "incur";
import { type CommandContext, commandWarnings } from "./command.js";

export const warningsOutput = { warnings: z.array(z.string()).optional() };

// Incur appends CTA values verbatim, so preserve each value as one shell argument.
const quoteArgument = (value: unknown) =>
  typeof value !== "string" || /^[-A-Za-z0-9_./:@%+=,]+$/.test(value)
    ? value
    : `'${value.replaceAll("'", "'\\''")}'`;

type NextCommand = {
  command: string;
  description: string;
  args?: Record<string, unknown>;
  options?: Record<string, unknown>;
};

/** Keep human rendering in the handler; expose domain data to incur unchanged. */
type ResultContext<T> = Pick<CommandContext, "agent" | "globals"> & {
  ok: (data: T, meta?: { cta: { commands: NextCommand[] } }) => never;
};
export const resultOutput = <const T>(
  context: ResultContext<NoInfer<T>>,
  data: T,
  next?: NextCommand,
): T => {
  const warnings = commandWarnings();
  const result = warnings.length > 0 ? { ...data, warnings } : data;
  if (!next) return result;
  const profile = context.globals.profile;
  const command =
    typeof profile === "string" ? { ...next, options: { ...next.options, profile } } : next;
  const quoteValues = (values: Record<string, unknown> | undefined) =>
    values &&
    Object.fromEntries(Object.entries(values).map(([key, value]) => [key, quoteArgument(value)]));
  return context.ok(result, {
    cta: {
      commands: [
        { ...command, args: quoteValues(command.args), options: quoteValues(command.options) },
      ],
    },
  });
};

export const resourceOutputSchema = <K extends string>(field: K) =>
  z.object({ [field]: z.string() } as { [P in K]: z.ZodString }).extend(warningsOutput);

const resourceNextCommand = (field: string, value: string): NextCommand | undefined => {
  if (field === "integrationId") {
    return {
      command: "integrations flows list",
      description: "Inspect this integration's flows",
      args: { integration: value },
    };
  }
  if (field === "instanceId") {
    return {
      command: "instances flow-configs list",
      description: "Inspect this instance's flows",
      args: { instance: value },
    };
  }
  if (field === "customerId") {
    return {
      command: "customers users list",
      description: "Inspect this customer's users",
      args: { customer: value },
    };
  }
  return undefined;
};

/** Preserve the historical single-value stdout while returning a named resource. */
export const resourceOutput = <K extends string>(
  context: ResultContext<Record<K, string>>,
  field: K,
  value: string,
) => {
  return resultOutput(
    context,
    { [field]: value } as Record<K, string>,
    resourceNextCommand(field, value),
  );
};
