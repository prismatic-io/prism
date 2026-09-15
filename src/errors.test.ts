import { Errors } from "incur";
import { describe, expect, it } from "vitest";
import { CommandFailedError, NotFoundError, processError, ValidationError } from "./errors.js";
import { ClientError } from "./graphql.js";

describe.each([
  [ValidationError, "VALIDATION_ERROR", 2],
  [CommandFailedError, "COMMAND_FAILED", 1],
  [NotFoundError, "NOT_FOUND", 1],
] as const)("command error %s", (ErrorType, code, exitCode) => {
  it("preserves incur details and identity through error normalization", () => {
    const cause = new Error("Underlying failure");
    const error = new ErrorType({
      message: "Request failed",
      hint: "Inspect the request",
      cause,
      retryable: true,
    });
    expect(error).toBeInstanceOf(Errors.IncurError);
    expect(processError(error)).toBe(error);
    expect(error).toMatchObject({ code, exitCode, hint: "Inspect the request", retryable: true });
    expect(error.walk()).toBe(cause);
    expect(error.message).toContain("Underlying failure");
    expect(JSON.parse(JSON.stringify(error.toResult()))).toEqual({
      code,
      exitCode,
      message: error.message,
      retryable: true,
    });
  });

  it("owns its classification even when options contain conflicting properties", () => {
    const options = { message: "Request failed", code: "WRONG", exitCode: 99 };
    expect(new ErrorType(options)).toMatchObject({ code, exitCode, retryable: false });
  });
});

describe("processError", () => {
  it("passes framework errors through unchanged", () => {
    const err = Object.assign(new Error("boom"), { exitCode: 2 });
    const out = processError(err);
    expect(out).toBe(err);
  });

  it("extracts GraphQL error messages from a ClientError", () => {
    const err = new ClientError(
      {
        status: 500,
        headers: {},
        errors: [{ message: "rate limited" }, { message: "retry" }],
      },
      { query: "query { me { id } }" },
    );
    const out = processError(err);
    expect(out.message).toContain("rate limited");
    expect(out.message).toContain("retry");
  });

  it("provides a fallback when a GraphQL response has no data or errors", () => {
    const err = new ClientError(
      { status: 200, headers: {}, errors: [] },
      { query: "query { me { id } }" },
    );
    const out = processError(err);
    expect(out.name).toBe("ClientError");
    expect(out.message).toBe("GraphQL Error (Code: 200)");
  });

  it("substitutes the unauthenticated message for a 401 ClientError", () => {
    const err = new ClientError(
      { status: 401, headers: {}, errors: [] },
      { query: "query { me { id } }" },
    );
    const out = processError(err);
    expect(out.message).toMatch(/not authenticated/i);
  });

  it("preserves the message on a plain Error", () => {
    const out = processError(new Error("plain error"));
    expect(out.name).toBe("Error");
    expect(out.message).toBe("plain error");
  });

  it("provides a fallback for an Error with an empty message", () => {
    const out = processError(new Error());
    expect(out.name).toBe("Error");
    expect(out.message).toBe("Unknown error");
  });

  it("handles non-Error values", () => {
    const out = processError("a string error");
    expect(out.name).toBe("Error");
    expect(out.message).toBe("a string error");
  });

  it.each([
    [null, "null"],
    [undefined, "undefined"],
    ["", "Unknown error"],
  ])("provides a non-empty message for an unhelpful thrown value", (value, message) => {
    const out = processError(value);
    expect(out.name).toBe("Error");
    expect(out.message).toBe(message);
  });
});
