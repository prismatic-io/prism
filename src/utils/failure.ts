import { Errors } from "incur";
import { ClientError } from "../graphql.js";

export function requestFailure(error: unknown, code: string, readOnly = false) {
  const message = error instanceof Error ? error.message : "The request failed.";
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
  const statusCodes: Record<number, string> = {
    401: "AUTHENTICATION_REQUIRED",
    403: "FORBIDDEN",
  };
  return {
    code: declared ?? (status === undefined ? code : statusCodes[status]) ?? code,
    message,
    exitCode: 1,
    retryable:
      readOnly &&
      (status === 429 ||
        (status !== undefined && status >= 500) ||
        /Network request .* failed|fetch failed/i.test(message)),
  };
}
