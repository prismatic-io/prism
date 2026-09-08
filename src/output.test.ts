import { runCommandInput } from "./test-command.js";
import { execFileSync } from "node:child_process";
import { Cli, z } from "incur";
import { describe, expect, it, vi } from "vitest";
import { getStdout } from "../vitest.setup.js";
import {
  commandOutput,
  defineCommand,
  globalOptions,
  environmentOptions,
  commandVars,
  commandMiddleware,
} from "./command.js";
import CreateCustomer from "./commands/customers/create.js";
import DeployInstance from "./commands/instances/deploy.js";
import ForkIntegration from "./commands/integrations/fork.js";
import Me from "./commands/me/index.js";
import Token from "./commands/me/token.js";
import ExportWorkflow from "./commands/workflows/export.js";
import { getAuthContext } from "./context.js";
import { gqlRequest } from "./graphql.js";
import { resourceOutput, resourceOutputSchema } from "./output.js";

vi.mock(import("./graphql.js"), () => ({ gqlRequest: vi.fn() }));

const context = (agent: boolean) => ({
  agent,
  args: {},
  options: {},
  globals: { yes: true },
  formatExplicit: agent,
});

describe("resource results", () => {
  it("preserves warnings alongside named results and incur CTAs", async () => {
    const command = defineCommand({
      output: resourceOutputSchema("integrationId"),
      run(c) {
        commandOutput.warn("Some config variables are missing");
        return resourceOutput(c, "integrationId", "integration-1");
      },
    });
    const writes: string[] = [];
    await Cli.create("prism", {
      globals: globalOptions,
      env: environmentOptions,
      vars: commandVars,
    })
      .use(commandMiddleware)
      .command("test", command)
      .serve(["test", "--json", "--full-output"], {
        stdout: (value) => writes.push(value),
        exit: () => {},
      });
    const result = JSON.parse(writes.join(""));
    expect(result.data).toEqual({
      integrationId: "integration-1",
      warnings: ["Some config variables are missing"],
    });
    expect(command.output.safeParse(result.data).success).toBe(true);
    expect(result.meta.cta.commands).toHaveLength(1);
  });

  it.each([
    "QA Team",
    "Ryan's Development",
    "$(printf expanded)",
  ])("keeps profile %s as one literal CTA argument", async (profile) => {
    const command = defineCommand({
      output: resourceOutputSchema("integrationId"),
      run(c) {
        return resourceOutput(
          { ...c, globals: { ...c.globals, profile } },
          "integrationId",
          "integration-1",
        );
      },
    });
    const writes: string[] = [];
    await Cli.create("prism", {
      globals: globalOptions,
      env: environmentOptions,
      vars: commandVars,
    })
      .use(commandMiddleware)
      .command("test", command)
      .serve(["test", "--json", "--full-output"], {
        stdout: (value) => writes.push(value),
        exit: () => {},
      });
    const commandText = JSON.parse(writes.join("")).meta.cta.commands[0].command;
    // Parse the rendered suggestion with a shell without executing the suggested command.
    // Git for Windows supplies sh.exe on Windows CI.
    const shell = process.platform === "win32" ? "sh.exe" : "/bin/sh";
    const parsed = execFileSync(shell, ["-c", `set -- ${commandText}; printf '%s\\n' "$@"`], {
      encoding: "utf8",
    })
      .trimEnd()
      .split("\n");
    expect(parsed).toEqual([
      "prism",
      "integrations",
      "flows",
      "list",
      "integration-1",
      "--profile",
      profile,
    ]);
  });
  it.each([
    [
      CreateCustomer,
      { createCustomer: { customer: { id: "customer-1" } } },
      "customerId",
      "customer-1",
      { options: { name: "Example" } },
    ],
    [
      DeployInstance,
      { deployInstance: { instance: { id: "instance-1" } } },
      "instanceId",
      "instance-1",
      { args: { instance: "instance-1" } },
    ],
    [
      ForkIntegration,
      { forkIntegration: { integration: { id: "integration-1" } } },
      "integrationId",
      "integration-1",
      {
        args: { parent: "parent-1" },
        options: { name: "Fork", description: "Forked integration" },
      },
    ],
  ] as const)("returns a named resource through native human and agent execution", async (command, response, field, id, input) => {
    vi.mocked(gqlRequest).mockResolvedValue(response);
    const human = await runCommandInput(command, { ...context(false), ...input });
    expect(getStdout()).toContain(id);
    expect(human).toEqual({ [field]: id });
    expect(command.output.safeParse(human).success).toBe(true);
    const agent = await runCommandInput(command, { ...context(true), ...input });
    expect(agent).toEqual({ [field]: id });
    expect(getStdout()).toContain(id);
  });

  it("returns the access token directly with its type", async () => {
    const result = await runCommandInput(Token, { ...context(true), options: { type: "access" } });
    expect(result).toEqual({ token: "test-token", type: "access" });
    expect(Token.output.safeParse(result).success).toBe(true);
    expect(getStdout()).toBe("");
  });

  it("exports reusable YAML as a named definition", async () => {
    vi.mocked(gqlRequest).mockResolvedValue({ workflow: { definition: "name: Example\n" } });
    const result = await runCommandInput(ExportWorkflow, {
      ...context(true),
      args: { workflow: "workflow-1" },
    });
    expect(result).toEqual({ definition: "name: Example\n" });
    expect(ExportWorkflow.output.safeParse(result).success).toBe(true);
    expect(getStdout()).toBe("");
    await runCommandInput(ExportWorkflow, { ...context(false), args: { workflow: "workflow-1" } });
    expect(getStdout()).toContain("definition:");
    expect(getStdout()).toContain("Example");
  });

  it("returns profile identity as fields without exposing authentication credentials", async () => {
    vi.mocked(getAuthContext).mockResolvedValue({
      source: "profile",
      profileName: "development",
      url: "https://example.com",
      accessToken: "private-access",
      refreshToken: "private-refresh",
    });
    vi.mocked(gqlRequest).mockResolvedValue({
      authenticatedUser: {
        name: "Example User",
        email: "user@example.com",
        tenantId: "tenant-1",
        org: { id: "org-1", name: "Example Org" },
        customer: null,
      },
    });
    const result = await runCommandInput(Me, context(true));
    expect(result).toEqual({
      name: "Example User",
      email: "user@example.com",
      tenantId: "tenant-1",
      organization: { id: "org-1", name: "Example Org" },
      customer: undefined,
      endpointUrl: "https://example.com",
      authentication: "profile",
      profile: "development",
    });
    expect(Me.output.safeParse(result).success).toBe(true);
    expect(getStdout()).toBe("");
  });

  it("passes domain data and a read-only next command through incur", async () => {
    const command = defineCommand({
      output: resourceOutputSchema("integrationId"),
      run(c) {
        return resourceOutput(c, "integrationId", "integration-1");
      },
    });
    const cli = Cli.create("prism-output-test", {
      globals: globalOptions,
      env: environmentOptions,
      vars: commandVars,
    })
      .use(commandMiddleware)
      .command("test", command);
    const writes: string[] = [];
    await cli.serve(["test", "--json", "--full-output"], {
      stdout: (value) => writes.push(value),
      exit: () => {},
    });
    const result = JSON.parse(writes.join(""));
    expect(result.ok).toBe(true);
    expect(result.data).toEqual({ integrationId: "integration-1" });
    expect(result.meta.cta.commands[0].command).toContain("integrations flows list");
    expect(result.meta.cta.commands[0].command).toContain("integration-1");
    expect(getStdout()).toBe("");
    expect(z.toJSONSchema(command.output).properties).toHaveProperty("integrationId");
  });
});
