import { runCommand } from "../../test-command.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { runWithMcpTransport } from "../../command.js";
import { gqlRequest } from "../../graphql.js";
import GraphqlQueryCommand, { hasMutationOperation } from "./query.js";

vi.mock("../../graphql.js", () => ({
  gqlRequest: vi.fn(async () => ({ viewer: { id: "viewer-id" } })),
}));

describe("graphql query operation safety", () => {
  beforeEach(() => vi.mocked(gqlRequest).mockClear());

  it("classifies parsed operations rather than matching mutation text", () => {
    expect(hasMutationOperation('query { search(term: "mutation") }')).toBe(false);
    expect(hasMutationOperation("mutation Rename { updateOrganization(input: {}) { id } }")).toBe(
      true,
    );
  });

  it("allows query operations in agent read-only mode", async () => {
    await expect(
      runCommand(GraphqlQueryCommand, ["--agent", "--read-only", "query Viewer { viewer { id } }"]),
    ).resolves.toMatchObject({ success: true });
    expect(gqlRequest).toHaveBeenCalledOnce();
  });

  it("requires agent approval before executing mutation operations", async () => {
    await expect(
      runCommand(GraphqlQueryCommand, [
        "--agent",
        "mutation { updateOrganization(input: {}) { id } }",
      ]),
    ).rejects.toMatchObject({ code: "CONFIRMATION_REQUIRED", exitCode: 2 });
    expect(gqlRequest).not.toHaveBeenCalled();

    await expect(
      runCommand(GraphqlQueryCommand, [
        "--agent",
        "--yes",
        "mutation { updateOrganization(input: {}) { id } }",
      ]),
    ).resolves.toMatchObject({ success: true });
    expect(gqlRequest).toHaveBeenCalledOnce();
  });

  it("rejects mutation operations in read-only mode even with approval", async () => {
    await expect(
      runCommand(GraphqlQueryCommand, [
        "--agent",
        "--yes",
        "--read-only",
        "mutation { updateOrganization(input: {}) { id } }",
      ]),
    ).rejects.toMatchObject({ code: "READ_ONLY", exitCode: 2 });
    expect(gqlRequest).not.toHaveBeenCalled();
  });

  it("rejects invalid documents before making a request", async () => {
    await expect(runCommand(GraphqlQueryCommand, ["--agent", "query {"])).rejects.toMatchObject({
      exitCode: 2,
    });
    expect(gqlRequest).not.toHaveBeenCalled();
  });
});

describe("GraphQL agent results", () => {
  it.each(["json", "yaml"])("returns typed data for legacy %s formatting", async (format) => {
    await expect(
      runCommand(GraphqlQueryCommand, ["--agent", "query { viewer { id } }", "--output", format]),
    ).resolves.toEqual({ success: true, data: { viewer: { id: "viewer-id" } } });
  });
  it("returns the selected table rows", async () => {
    await expect(
      runCommand(GraphqlQueryCommand, [
        "--agent",
        "query { viewer { id } }",
        "--output",
        "table",
        "--data-path",
        "viewer",
        "--columns",
        "id",
      ]),
    ).resolves.toEqual({ success: true, data: { items: [{ id: "viewer-id" }] } });
  });
});

it("rejects reading MCP stdin before attaching listeners or making a query", async () => {
  vi.mocked(gqlRequest).mockClear();
  const listeners = process.stdin.eventNames().map((name) => [name, process.stdin.listeners(name)]);
  await expect(
    runWithMcpTransport(() => runCommand(GraphqlQueryCommand, ["--agent"])),
  ).rejects.toMatchObject({ code: "STDIN_UNAVAILABLE" });
  expect(process.stdin.eventNames().map((name) => [name, process.stdin.listeners(name)])).toEqual(
    listeners,
  );
  expect(gqlRequest).not.toHaveBeenCalled();
});
