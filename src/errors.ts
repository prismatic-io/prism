import type { handle, Interfaces } from "@oclif/core";
import { getReasonPhrase, StatusCodes } from "http-status-codes";
import type { ClientError } from "./graphql.js";

type OclifError = Interfaces.OclifError;

const isError = (error: unknown): error is Error =>
  Boolean(error) && typeof error === "object" && error !== null && "message" in error;

const isOclifError = (error: unknown): error is Error & OclifError =>
  isError(error) && "oclif" in error;

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

type ErrorToHandle = Parameters<typeof handle>[0];

export const processError = (error: unknown): ErrorToHandle => {
  if (isOclifError(error)) {
    return error;
  }

  if (isClientError(error)) {
    return {
      ...error,
      name: errorName(error, "ClientError"),
      message: extractResponseError(error),
    };
  }

  // Oclif needs the non-enumerable error name copied explicitly.
  if (isError(error)) {
    return {
      ...error,
      name: errorName(error),
      message: fallbackMessage(error.message, "Unknown error"),
    };
  }

  return {
    name: "Error",
    message: fallbackMessage(String(error), "Unknown error"),
  };
};
