import { getReasonPhrase, StatusCodes } from "http-status-codes";
import type { ClientError } from "./graphql.js";

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
