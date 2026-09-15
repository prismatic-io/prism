import { getReasonPhrase, StatusCodes } from "http-status-codes";
import { Errors } from "incur";
import type { ClientError } from "./graphql.js";

type CommandErrorOptions = Omit<Errors.IncurError.Options, "code" | "exitCode">;

abstract class CommandError extends Errors.IncurError {
  // Native result envelopes spread their inputs; Error.message is not enumerable.
  toResult() {
    return {
      code: this.code,
      message: this.message,
      exitCode: this.exitCode,
      retryable: this.retryable,
    };
  }
}

export class ValidationError extends CommandError {
  constructor(options: CommandErrorOptions) {
    super({ ...options, code: "VALIDATION_ERROR", exitCode: 2 });
  }
}

export class CommandFailedError extends CommandError {
  constructor(options: CommandErrorOptions) {
    super({ ...options, code: "COMMAND_FAILED", exitCode: 1 });
  }
}

export class NotFoundError extends CommandError {
  constructor(options: CommandErrorOptions) {
    super({ ...options, code: "NOT_FOUND", exitCode: 1 });
  }
}

const isError = (error: unknown): error is Error =>
  Boolean(error) && typeof error === "object" && error !== null && "message" in error;

const isClientError = (error: unknown): error is ClientError =>
  isError(error) && "response" in error && "request" in error;

const getStatusMessage = (status: number): string | undefined => {
  if (status === StatusCodes.OK) {
    return;
  }
  return status === StatusCodes.UNAUTHORIZED
    ? "Not authenticated. Run 'prism login' or select another profile."
    : getReasonPhrase(status);
};

const fallbackMessage = (message: unknown, fallback: string): string => {
  if (typeof message === "string" && message.trim()) {
    return message;
  }
  return fallback;
};

const errorName = (error: Error, fallback = "Error"): string =>
  typeof error.name === "string" && error.name.trim() ? error.name : fallback;

const extractResponseError = ({ response: { errors = [], status } }: ClientError): string => {
  try {
    const statusMessage = getStatusMessage(status);
    const errorMessages = errors.map(({ message }) => message);
    return fallbackMessage(
      [statusMessage, ...errorMessages].filter(Boolean).join("\n"),
      `GraphQL Error (Code: ${status})`,
    );
  } catch (_e) {
    return `GraphQL Error (Code: ${status})`;
  }
};

export const processError = (error: unknown): Error => {
  if (isClientError(error)) {
    return Object.assign(new Error(extractResponseError(error)), {
      name: errorName(error, "ClientError"),
    });
  }

  // Preserve the non-enumerable error name when normalizing errors.
  if (isError(error)) {
    return Object.assign(error, {
      name: errorName(error),
      message: fallbackMessage(error.message, "Unknown error"),
    });
  }

  return new Error(fallbackMessage(String(error), "Unknown error"));
};
