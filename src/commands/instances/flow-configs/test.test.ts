import { expect, it, vi } from "vitest";
import { gqlRequest } from "../../../graphql.js";
import { runCommand } from "../../../test-command.js";
import TestFlowConfigCommand from "./test.js";

vi.mock("../../../graphql.js", () => ({
  gql: (strings: TemplateStringsArray) => strings.join(""),
  gqlRequest: vi.fn(),
}));

it("returns the named execution ID without requiring log tailing", async () => {
  vi.mocked(gqlRequest).mockResolvedValue({
    testInstanceFlowConfig: {
      testInstanceFlowConfigResult: {
        execution: { id: "execution-id" },
        flowConfig: { id: "flow-config-id" },
      },
      errors: [],
    },
  });
  const result = await runCommand(TestFlowConfigCommand, ["--agent", "--yes", "flow-config-id"]);
  expect(result).toEqual([
    { type: "execution", executionId: "execution-id", flowConfigId: "flow-config-id" },
    { type: "completed", executionId: "execution-id", status: "submitted" },
  ]);
  for (const event of result as unknown[])
    expect(TestFlowConfigCommand.output.safeParse(event).success).toBe(true);
});

it("tails projected native log events until execution completion", async () => {
  vi.mocked(gqlRequest)
    .mockResolvedValueOnce({
      testInstanceFlowConfig: {
        testInstanceFlowConfigResult: { execution: { id: "execution-id" } },
      },
    })
    .mockResolvedValueOnce({
      logs: {
        edges: [
          {
            cursor: "last",
            node: {
              timestamp: "2026-09-08T00:00:00Z",
              severity: "INFO",
              message: "Ending Instance Execution",
            },
          },
        ],
      },
    });
  const result = await runCommand(TestFlowConfigCommand, [
    "--agent",
    "--yes",
    "flow-config-id",
    "--tail",
    "--columns",
    "message",
  ]);
  expect(result).toEqual([
    { type: "execution", executionId: "execution-id", flowConfigId: "flow-config-id" },
    { type: "log", executionId: "execution-id", data: { message: "Ending Instance Execution" } },
    { type: "completed", executionId: "execution-id", status: "completed" },
  ]);
  for (const event of result as unknown[])
    expect(TestFlowConfigCommand.output.safeParse(event).success).toBe(true);
});

it.each([
  false,
  true,
])("preserves section metadata and warning events on lookup failure=%s", async (fail) => {
  vi.mocked(gqlRequest).mockReset();
  vi.mocked(gqlRequest)
    .mockResolvedValueOnce({
      testInstanceFlowConfig: {
        testInstanceFlowConfigResult: { execution: { id: "execution-id" } },
      },
    })
    .mockResolvedValueOnce({
      logs: {
        edges: [
          {
            cursor: "last",
            node: {
              timestamp: "2026-09-08T00:00:00Z",
              severity: "INFO",
              message: "Ending Instance Execution",
              sectionId: "section-id",
            },
          },
        ],
      },
    });
  if (fail) vi.mocked(gqlRequest).mockRejectedValueOnce(new Error("lookup unavailable"));
  else
    vi.mocked(gqlRequest).mockResolvedValueOnce({
      executionSections: { nodes: [{ sectionId: "section-id", label: "Configuration" }] },
    });
  const result = await runCommand(TestFlowConfigCommand, [
    "--agent",
    "--yes",
    "flow-config-id",
    "--tail",
  ]);
  expect(result).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        type: "log",
        data: expect.objectContaining({
          sectionId: "section-id",
          sectionName: fail ? "section-id" : "Configuration",
        }),
      }),
    ]),
  );
  if (fail)
    expect(result).toEqual(
      expect.arrayContaining([
        { type: "warning", message: expect.stringContaining("lookup unavailable") },
      ]),
    );
  for (const event of result as unknown[])
    expect(TestFlowConfigCommand.output.parse(event)).toEqual(event);
});
