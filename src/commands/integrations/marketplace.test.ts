import { runCommand } from "../../test-command.js";
import { afterEach, describe, expect, it, vi } from "vitest";
import MarketplaceCommand from "./marketplace.js";

const mockGqlRequest = vi.fn();

vi.mock(import("../../graphql.js"), async (importOriginal) => {
  const original = await importOriginal();
  return {
    ...original,
    gqlRequest: (...args: unknown[]) => mockGqlRequest(...args),
  };
});

const variablesFromLastCall = () => mockGqlRequest.mock.calls.at(-1)?.[0].variables;

describe("MarketplaceCommand", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    mockGqlRequest.mockReset();
  });

  const mockSuccess = () =>
    mockGqlRequest.mockResolvedValue({
      updateIntegrationMarketplaceConfiguration: { integration: { id: "int_1" }, errors: [] },
    });

  describe("overview flag", () => {
    it("passes the provided overview through to the mutation", async () => {
      mockSuccess();

      await runCommand(MarketplaceCommand, [
        "int_1",
        "--available",
        "--overview",
        "A useful integration",
      ]);

      expect(variablesFromLastCall()).toMatchObject({ overview: "A useful integration" });
    });

    it("defaults overview to an empty string when the flag is omitted", async () => {
      mockSuccess();

      await runCommand(MarketplaceCommand, ["int_1", "--available"]);

      expect(variablesFromLastCall()).toMatchObject({ overview: "" });
    });
  });

  it("returns the updated integration id", async () => {
    mockSuccess();
    const result = await runCommand(MarketplaceCommand, ["int_1", "--available"]);
    expect(result).toEqual({ integrationId: "int_1" });
    expect(MarketplaceCommand.output.safeParse(result).success).toBe(true);
  });
});
