import { z } from "zod";

/**
 * Format a Zod error into a user-friendly message for CLI output.
 */
export function formatValidationError(error: z.ZodError): string {
  const issues = error.issues.map(formatIssue);
  return issues.join("\n");
}

function formatIssue(issue: z.core.$ZodIssue): string {
  const path = issue.path.length > 0 ? `--${issue.path.join(".")}` : "input";
  return `${path}: ${issue.message}`;
}

/**
 * Validate command flags against a Zod schema.
 * Throws an error with a formatted message if validation fails.
 *
 * Use oclif's built-in flag options for simple cases:
 * - `required: true` for required flags
 * - `exclusive: ["other-flag"]` for mutual exclusivity
 * - `dependsOn: ["other-flag"]` for dependencies
 *
 * Use Zod's `.refine()` or `.superRefine()` for complex conditional logic
 * that oclif can't express.
 */
export function validateFlags<T extends z.ZodType>(schema: T, flags: unknown): z.infer<T> {
  const result = schema.safeParse(flags);

  if (!result.success) {
    const message = formatValidationError(result.error);
    throw new Error(`Invalid command arguments:\n${message}`);
  }

  return result.data;
}
