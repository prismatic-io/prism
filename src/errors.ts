import { handle } from "@oclif/core";
import { OclifError } from "@oclif/core/lib/interfaces";
import { ClientError } from "./graphql.js";
import { StatusCodes, getReasonPhrase } from "http-status-codes";

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

const extractResponseError = ({ response: { errors = [], status } }: ClientError): string => {
  try {
    const statusMessage = getStatusMessage(status);
    const errorMessages = errors.map(({ message }) => message);
    return [statusMessage, ...errorMessages].filter(Boolean).join("\n");
  } catch (e) {
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
      message: extractResponseError(error),
    };
  }

  // If a conventional error, only pass along the message for presentation
  if (isError(error)) {
    return {
      ...error,
      message: error.message,
    };
  }

  // Last ditch best effort
  return {
    name: "",
    message: error as string,
  };
};
