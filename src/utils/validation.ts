import type { z } from "zod";

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
