import { Cli, Errors, Mcp, z } from "incur";
import { afterEach, describe, expect, expectTypeOf, it } from "vitest";
import {
  assertMutationAllowed,
  commandMiddleware,
  commandOutput,
  commandVars,
  commandWarnings,
  defineCommand,
  environmentOptions,
  globalOptions,
} from "./command.js";
import { getRuntimeState, isPrintRequestsEnabled, isQuiet } from "./runtime.js";
import { runCommand } from "./test-command.js";
import { ux } from "./utils/ux.js";

const environmentCommand = defineCommand({
  run: () => ({ printRequests: isPrintRequestsEnabled(), quiet: isQuiet() }),
});

afterEach(() => {
  delete process.env.PRISMATIC_PRINT_REQUESTS;
  delete process.env.PRISM_QUIET;
});

describe("native schemas and execution context", () => {
  it("infers handler inputs from native schemas and applies native defaults", async () => {
    const command = defineCommand({
      args: z.object({ name: z.string() }),
      options: z.object({
        count: z.coerce.number().int().default(1),
        enabled: z.boolean().optional(),
      }),
      output: z.object({ name: z.string(), count: z.number(), enabled: z.boolean() }),
      run(context) {
        expectTypeOf(context.args.name).toEqualTypeOf<string>();
        expectTypeOf(context.options.count).toEqualTypeOf<number>();
        expectTypeOf(context.options.enabled).toEqualTypeOf<boolean | undefined>();
        expectTypeOf(context.globals.profile).toEqualTypeOf<string | undefined>();
        return {
          name: context.args.name,
          count: context.options.count,
          enabled: context.options.enabled ?? false,
        };
      },
    });
    await expect(runCommand(command, ["example", "--agent"])).resolves.toEqual({
      name: "example",
      count: 1,
      enabled: false,
    });
    await expect(
      runCommand(command, ["example", "--count", "3", "--enabled", "--agent"]),
    ).resolves.toEqual({ name: "example", count: 3, enabled: true });
    await expect(
      runCommand(command, ["example", "--count", "invalid", "--agent"]),
    ).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
  });

  it("keeps presence-checked environment switches invocation-local", async () => {
    await expect(runCommand(environmentCommand, [])).resolves.toEqual({
      printRequests: false,
      quiet: false,
    });
    await expect(runCommand(environmentCommand, ["--print-requests", "--quiet"])).resolves.toEqual({
      printRequests: true,
      quiet: true,
    });
    expect(process.env.PRISMATIC_PRINT_REQUESTS).toBeUndefined();
    expect(process.env.PRISM_QUIET).toBeUndefined();
  });

  it("allows concurrent native commands while isolating runtime state", async () => {
    let active = 0;
    let maximumActive = 0;
    const command = defineCommand({
      async run() {
        active += 1;
        maximumActive = Math.max(maximumActive, active);
        const before = { ...getRuntimeState() };
        await new Promise((resolve) => setTimeout(resolve, 10));
        const after = { ...getRuntimeState() };
        active -= 1;
        return { before, after };
      },
    });
    const [alpha, beta] = await Promise.all([
      runCommand(command, ["--profile", "alpha", "--print-requests"]),
      runCommand(command, ["--profile", "beta", "--quiet"]),
    ]);
    expect(maximumActive).toBe(2);
    expect(alpha).toMatchObject({
      before: { printRequests: true, quiet: false, selectedProfile: "alpha" },
      after: { printRequests: true, quiet: false, selectedProfile: "alpha" },
    });
    expect(beta).toMatchObject({
      before: { printRequests: false, quiet: true, selectedProfile: "beta" },
      after: { printRequests: false, quiet: true, selectedProfile: "beta" },
    });
  });
});

describe("native mutation and interaction middleware", () => {
  it("requires explicit approval and enforces read-only mode", async () => {
    const command = defineCommand({ mutates: true, run: () => ({ changed: true }) });
    await expect(runCommand(command, ["--agent"])).rejects.toMatchObject({
      code: "CONFIRMATION_REQUIRED",
      exitCode: 2,
    });
    await expect(runCommand(command, ["--agent", "--yes", "--read-only"])).rejects.toMatchObject({
      code: "READ_ONLY",
      exitCode: 2,
    });
    await expect(runCommand(command, ["--agent", "--yes"])).resolves.toEqual({ changed: true });
  });

  it("preserves context and safeguards when invoking a shared operation", async () => {
    const operation = (context: Parameters<typeof assertMutationAllowed>[0]) => {
      assertMutationAllowed(context);
      return { agent: context.agent, profile: getRuntimeState().selectedProfile };
    };
    const command = defineCommand({ run: (context) => operation(context) });
    await expect(runCommand(command, ["--agent"])).rejects.toMatchObject({
      code: "CONFIRMATION_REQUIRED",
    });
    await expect(
      runCommand(command, ["--agent", "--yes", "--profile", "selected"]),
    ).resolves.toEqual({ agent: true, profile: "selected" });
  });

  it("does not silently approve an interactive prompt", async () => {
    const command = defineCommand({
      async run() {
        return { confirmed: await ux.confirm("Proceed?") };
      },
    });
    await expect(runCommand(command, ["--agent"])).rejects.toMatchObject({ exitCode: 2 });
    await expect(runCommand(command, ["--agent", "--yes"])).resolves.toEqual({ confirmed: true });
  });

  it("preserves declared error status through the native pipeline", async () => {
    const command = defineCommand({ run: () => ux.error("runtime failure", { exit: 1 }) });
    await expect(runCommand(command, [])).rejects.toMatchObject({ exitCode: 1 });
  });
});

describe("native results and streaming", () => {
  it("streams native domain events exactly once", async () => {
    const command = defineCommand({
      output: z.object({ type: z.literal("log"), count: z.number() }),
      async *run() {
        yield { type: "log" as const, count: 1 };
        await Promise.resolve();
        yield { type: "log" as const, count: 2 };
      },
    });
    await expect(runCommand(command, ["--agent"])).resolves.toEqual([
      { type: "log", count: 1 },
      { type: "log", count: 2 },
    ]);
  });

  it.each([
    false,
    true,
  ])("returns explicit warning data through native MCP with c.ok=%s", async (useOk) => {
    const command = defineCommand({
      run(context) {
        commandOutput.warn("partial result");
        const data = { customerId: "customer-id", warnings: commandWarnings() };
        return useOk ? context.ok(data) : data;
      },
    });
    const result = await Mcp.callTool(
      { name: "warn", inputSchema: { type: "object", properties: {} }, command },
      {},
      { middlewares: [commandMiddleware], vars: commandVars, env: environmentOptions },
    );
    expect(result.isError).not.toBe(true);
    expect(JSON.parse(result.content[0].text)).toEqual({
      customerId: "customer-id",
      warnings: ["partial result"],
    });
  });

  it.each([
    false,
    true,
  ])("propagates native MCP generator errors with c.error=%s", async (useError) => {
    const command = defineCommand({
      async *run(context) {
        yield { type: "started" };
        if (useError)
          return context.error({ code: "NOT_FOUND", message: "Execution not found", exitCode: 2 });
        throw Object.assign(new Error("Execution not found"), { code: "NOT_FOUND", exitCode: 2 });
      },
    });
    const result = await Mcp.callTool(
      { name: "fail", inputSchema: { type: "object", properties: {} }, command },
      {},
      { middlewares: [commandMiddleware], vars: commandVars, env: environmentOptions },
    );
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Execution not found");
  });

  it.each(["json", "jsonl"])("reports generator failure through native CLI %s", async (format) => {
    const command = defineCommand({
      async *run(context) {
        yield { type: "started" };
        return context.error({ code: "NOT_FOUND", message: "Execution not found", exitCode: 2 });
      },
    });
    const cli = Cli.create("test", {
      globals: globalOptions,
      vars: commandVars,
      env: environmentOptions,
    })
      .use(commandMiddleware)
      .command("fail", command);
    const output: string[] = [];
    const exits: number[] = [];
    await cli.serve(["fail", "--format", format], {
      stdout: (value) => {
        output.push(value);
      },
      exit: (code) => {
        exits.push(code);
      },
    });
    expect(exits).toContain(2);
    expect(output.join("")).toContain('"NOT_FOUND"');
    expect(output.join("")).not.toContain('"ok":true');
  });
});

describe("native output and error contracts", () => {
  it.each([false, true])("normalizes declared outputs including c.ok=%s", async (useOk) => {
    const command = defineCommand({
      output: z.object({ id: z.string() }),
      run(context) {
        const data = { id: "resource", undeclared: "must not escape" };
        return useOk ? context.ok(data) : data;
      },
    });
    const result = await Mcp.callTool(
      {
        name: "normalize",
        inputSchema: { type: "object", properties: {} },
        outputSchema: { type: "object", properties: { id: { type: "string" } } },
        command,
      },
      {},
      { middlewares: [commandMiddleware], vars: commandVars, env: environmentOptions },
    );
    expect(result.structuredContent).toEqual({ id: "resource" });
  });

  it("retains native error sentinel retryability and CTAs", async () => {
    const command = defineCommand({
      output: z.object({ id: z.string() }),
      run(context) {
        return context.error({
          code: "RATE_LIMITED",
          message: "Wait a minute",
          retryable: true,
          cta: { commands: [{ command: "help", description: "Read retry guidance" }] },
        });
      },
    });
    const cli = Cli.create("test", {
      globals: globalOptions,
      vars: commandVars,
      env: environmentOptions,
    })
      .use(commandMiddleware)
      .command("run", command);
    let output = "";
    await cli.serve(["run", "--agent", "--json"], {
      stdout: (chunk) => {
        output += chunk;
      },
      exit: () => {},
    });
    expect(JSON.parse(output)).toMatchObject({ code: "RATE_LIMITED", retryable: true });
    const result = await Mcp.callTool(
      { name: "retry", inputSchema: { type: "object", properties: {} }, command },
      {},
      { middlewares: [commandMiddleware], vars: commandVars, env: environmentOptions },
    );
    expect(result.isError).toBe(true);
    expect(result._meta?.cta).toBeDefined();
  });

  it("enforces read-only mode from the invocation environment", async () => {
    let invoked = false;
    const command = defineCommand({
      mutates: true,
      run() {
        invoked = true;
        return { success: true };
      },
    });
    const cli = Cli.create("test", {
      globals: globalOptions,
      vars: commandVars,
      env: environmentOptions,
    })
      .use(commandMiddleware)
      .command("run", command);
    let output = "";
    await cli.serve(["run", "--agent", "--yes", "--json"], {
      env: { PRISM_READ_ONLY: "true" },
      stdout: (chunk) => {
        output += chunk;
      },
      exit: () => {},
    });
    expect(invoked).toBe(false);
    expect(JSON.parse(output)).toMatchObject({ code: "READ_ONLY" });
  });
});

describe("native stream validation", () => {
  it("normalizes yielded data and preserves native retryable failures", async () => {
    const command = defineCommand({
      output: z.object({ id: z.string() }),
      async *run() {
        yield { id: "resource", undeclared: "must not escape" };
        throw new Errors.IncurError({
          code: "RATE_LIMITED",
          message: "Wait",
          retryable: true,
          hint: "Retry later",
        });
      },
    });
    const cli = Cli.create("test", {
      globals: globalOptions,
      vars: commandVars,
      env: environmentOptions,
    })
      .use(commandMiddleware)
      .command("run", command);
    let output = "";
    await cli.serve(["run", "--agent", "--format", "jsonl"], {
      stdout: (chunk) => {
        output += chunk;
      },
      exit: () => {},
    });
    const chunks = output
      .trim()
      .split("\n")
      .map((line) => JSON.parse(line));
    expect(chunks[0]).toEqual({ type: "chunk", data: { id: "resource" } });
    expect(JSON.stringify(chunks)).not.toContain("must not escape");
    expect(JSON.stringify(chunks)).toContain('"retryable":true');
  });
});
