import { OclifError, PrettyPrintableError } from "@oclif/core/lib/interfaces";
import { ClientError } from "graphql-request";
import { StatusCodes, getReasonPhrase } from "http-status-codes";

const isOclifError = (error: unknown): error is OclifError =>
  Boolean(error) &&
  typeof error === "object" &&
  error !== null &&
  "oclif" in error;

const isError = (error: unknown): error is Error =>
  Boolean(error) &&
  typeof error === "object" &&
  error !== null &&
  "message" in error;

const getStatusMessage = (status: number): string | undefined => {
  if (status === StatusCodes.OK) {
    return;
  }
  return status === StatusCodes.UNAUTHORIZED
    ? "You are not logged in."
    : getReasonPhrase(status);
};

const extractResponseError = ({
  response: { errors = [], status },
}: ClientError): string => {
  try {
    const statusMessage = getStatusMessage(status);
    const errorMessages = errors.map(({ message }) => message);
    return [statusMessage, ...errorMessages].filter(Boolean).join("\n");
  } catch (e) {
    return `GraphQL Error (Code: ${status})`;
  }
};

/** Accept arbitrary errors and convert them to OClif's error types. */
export const processError = (
  error: unknown
): OclifError | PrettyPrintableError => {
  // Pass OclifErrors through unchanged
  if (isOclifError(error)) {
    return error;
  }

  // Try to process GraphQL errors into more user-friendly forms
  if (error instanceof ClientError) {
    return {
      message: extractResponseError(error),
    };
  }

  // If a conventional error, only pass along the message for presentation
  if (isError(error)) {
    return {
      message: error.message,
    };
  }

  // Last ditch best effort
  return {
    message: error as string,
  };
};
