import { Errors } from "incur";
import { ClientError } from "../../graphql.js";

export function customerFailure(error: unknown, code: string, readOnly = false) {
  const message = error instanceof Error ? error.message : "The customer request failed.";
  if (error instanceof Errors.IncurError)
    return {
      code: error.code,
      message,
      exitCode: error.exitCode ?? 1,
      retryable: readOnly && error.retryable === true,
    };
  const declared =
    error && typeof error === "object" && "code" in error && typeof error.code === "string"
      ? error.code
      : undefined;
  const status = error instanceof ClientError ? error.response.status : undefined;
  return {
    code:
      declared ??
      (status === 401 ? "AUTHENTICATION_REQUIRED" : status === 403 ? "FORBIDDEN" : code),
    message,
    exitCode: 1,
    // A failed mutation may already have reached the server. Inspect state before retrying.
    retryable:
      readOnly &&
      (status === 429 ||
        (status !== undefined && status >= 500) ||
        /Network request .* failed|fetch failed/i.test(message)),
  };
}
