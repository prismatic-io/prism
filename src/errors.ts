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
    ? "You are not logged to the Prismatic platform at the specified endpoint URL. Check the value for PRISMATIC_URL."
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

/** Accept arbitrary errors and convert them to something oclif handles. */
export const processError = (error: unknown): ErrorToHandle => {
  // Pass OclifErrors through unchanged
  if (isOclifError(error)) {
    return error;
  }

  // Try to process GraphQL errors into more user-friendly forms
  if (isClientError(error)) {
    return {
      ...error,
      name: errorName(error, "ClientError"),
      message: extractResponseError(error),
    };
  }

  // Error.name is usually non-enumerable, so preserve it explicitly. Oclif's formatter requires
  // both name and message and otherwise renders an empty string.
  if (isError(error)) {
    return {
      ...error,
      name: errorName(error),
      message: fallbackMessage(error.message, "Unknown error"),
    };
  }

  // Last ditch best effort
  return {
    name: "Error",
    message: fallbackMessage(String(error), "Unknown error"),
  };
};
