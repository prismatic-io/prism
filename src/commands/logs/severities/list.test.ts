import { expect, it, vi } from "vitest";
import { gqlRequest } from "../../../graphql.js";
import { runCommand } from "../../../test-command.js";
import command from "./list.js";

vi.mock(import("../../../graphql.js"), () => ({ gqlRequest: vi.fn() }));

it("returns numeric severity identifiers through the declared native schema", async () => {
  vi.mocked(gqlRequest).mockResolvedValue({ logSeverityLevels: [{ id: 20, name: "Info" }] });
  const result = await runCommand(command, ["--agent"]);
  expect(result).toEqual({ items: [{ id: 20, name: "Info" }] });
  expect(command.output.parse(result)).toEqual(result);
});
