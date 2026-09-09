import { encode } from "@msgpack/msgpack";
import { describe, expect, it, vi } from "vitest";
import { getStdout } from "../vitest.setup.js";
import DeleteCustomer from "./commands/customers/delete.js";
import GetStepResult from "./commands/executions/step-result/get.js";
import ConvertIntegration from "./commands/integrations/convert/index.js";
import DeleteProfile from "./commands/profiles/delete.js";
import { ConfigStore } from "./config-store.js";
import { fs } from "./fs.js";
import { gqlRequest } from "./graphql.js";
import { runCommandInput } from "./test-command.js";
import { fetch } from "./utils/http.js";

vi.mock(import("./graphql.js"), () => ({ gqlRequest: vi.fn() }));
vi.mock(import("./utils/http.js"), () => ({ fetch: vi.fn(), createFetch: vi.fn() }));

const context = (agent = true) => ({
  agent,
  args: {},
  options: {},
  globals: { yes: true },
  formatExplicit: agent,
});

describe("named operation results", () => {
  it("identifies the deleted customer in native output", async () => {
    vi.mocked(gqlRequest).mockResolvedValue({ deleteCustomer: { errors: [] } });
    const result = await runCommandInput(DeleteCustomer, {
      ...context(),
      args: { customer: "customer-1" },
    });
    expect(result).toEqual({ customerId: "customer-1", deleted: true });
    expect(DeleteCustomer.output.safeParse(result).success).toBe(true);
    await runCommandInput(DeleteCustomer, { ...context(false), args: { customer: "customer-1" } });
    expect(getStdout()).toContain("customer-1");
    expect(vi.mocked(gqlRequest).mock.lastCall?.[0].variables).toEqual({ id: "customer-1" });
  });

  it("distinguishes a missing step result from an empty successful payload", async () => {
    vi.mocked(gqlRequest).mockResolvedValue({ executionResult: { stepResults: { nodes: [] } } });
    const result = await runCommandInput(GetStepResult, {
      ...context(),
      options: { executionId: "execution-1", stepName: "Fetch" },
    });
    expect(result).toEqual({
      executionId: "execution-1",
      stepName: "Fetch",
      found: false,
      warnings: ["No step results found. Did you enter the correct step name?"],
    });
    expect(GetStepResult.output.safeParse(result).success).toBe(true);
  });

  it("returns native JSON results or their saved path with unchanged file contents", async () => {
    vi.mocked(gqlRequest).mockResolvedValue({
      executionResult: { stepResults: { nodes: [{ resultsUrl: "https://example.com/result" }] } },
    });
    const bytes = encode({ data: '{"count":2,"enabled":false}', contentType: "application/json" });
    vi.mocked(fetch).mockImplementation(async () => new Response(bytes));
    const options = { executionId: "execution-1", stepName: "Fetch" };
    const result = await runCommandInput(GetStepResult, { ...context(), options });
    expect(result).toEqual({
      ...options,
      found: true,
      contentType: "application/json",
      result: { count: 2, enabled: false },
    });
    expect(GetStepResult.output.safeParse(result).success).toBe(true);
    const write = vi.spyOn(fs, "writeFile").mockResolvedValue();
    try {
      const saved = await runCommandInput(GetStepResult, {
        ...context(),
        options: { ...options, outputPath: "result.json" },
      });
      expect(saved).toEqual({
        ...options,
        found: true,
        contentType: "application/json",
        path: "result.json",
      });
      expect(write).toHaveBeenCalledWith("result.json", '{"count":2,"enabled":false}');
      expect(GetStepResult.output.safeParse(saved).success).toBe(true);
      expect(getStdout()).toBe("");
    } finally {
      write.mockRestore();
    }
  });

  it("returns conversion diagnostics as fields and retains warning messages", async () => {
    const issue = {
      path: "flows/0",
      error: "Manual adjustment required",
      errorType: "UNSUPPORTED",
    };
    vi.mocked(gqlRequest).mockResolvedValue({
      convertLowCodeIntegration: {
        convertLowCodeIntegrationFormResult: {
          url: "https://example.com/archive.zip",
          conversionErrors: [issue, null],
        },
      },
    });
    const result = await runCommandInput(ConvertIntegration, {
      ...context(),
      args: { integration: "integration-1" },
    });
    expect(result).toMatchObject({
      integrationId: "integration-1",
      downloadUrl: "https://example.com/archive.zip",
      conversionErrors: [issue],
    });
    expect(result).toHaveProperty("warnings");
    expect(ConvertIntegration.output.safeParse(result).success).toBe(true);
  });

  it("reports that deleting the last profile leaves no default", async () => {
    vi.spyOn(ConfigStore.prototype, "deleteProfile").mockResolvedValue({
      deleted: true,
      isLast: true,
    });
    const result = await runCommandInput(DeleteProfile, {
      ...context(),
      args: { name: "development" },
    });
    expect(result).toEqual({ profile: "development", deleted: true, defaultProfile: null });
    expect(DeleteProfile.output.safeParse(result).success).toBe(true);
  });
});
