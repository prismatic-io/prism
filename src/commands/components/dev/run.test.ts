import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, it, vi } from "vitest";
import { gqlRequest } from "../../../graphql.js";
import { runCommand } from "../../../test-command.js";
import RunCommand from "./run.js";

vi.mock("../../../graphql.js", () => ({ gqlRequest: vi.fn() }));

it("returns native subprocess stream events with a schema-valid completion", async () => {
  vi.mocked(gqlRequest).mockResolvedValue({
    integration: {
      testConfigVariables: {
        nodes: [
          {
            requiredConfigVariable: { key: "connection" },
            inputs: { nodes: [{ name: "token", value: "test-token" }] },
            meta: "{}",
          },
        ],
      },
    },
  });
  const directory = await mkdtemp(path.join(tmpdir(), "prism-dev-run-stream-"));
  const script = path.join(directory, "child.cjs");
  try {
    await writeFile(
      script,
      'console.log(JSON.parse(process.env.PRISMATIC_CONNECTION_VALUE).fields.token); setTimeout(() => console.error("diagnostic"), 50);',
    );
    const events = await runCommand(RunCommand, [
      "--agent",
      "--yes",
      "--integrationId",
      "integration-id",
      "--connectionKey",
      "connection",
      process.execPath,
      script,
    ]);
    expect(events).toEqual([
      { type: "stdout", data: "test-token\n" },
      { type: "stderr", data: "diagnostic\n" },
      { type: "completed", exitCode: 0 },
    ]);
    for (const event of events as unknown[])
      expect(RunCommand.output?.safeParse(event).success).toBe(true);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

it.each([
  {},
  { integrationId: "integration", instanceId: "instance" },
])("rejects ambiguous connection origins in the native schema: %j", async (origins) => {
  expect(RunCommand.options?.safeParse({ connectionKey: "connection", ...origins }).success).toBe(
    false,
  );
  const argv = Object.entries(origins).flatMap(([key, value]) => [`--${key}`, value]);
  await expect(
    runCommand(RunCommand, ["--agent", "--yes", "--connectionKey", "connection", ...argv, "node"]),
  ).rejects.toThrow(/Exactly one/);
  expect(gqlRequest).not.toHaveBeenCalled();
});
