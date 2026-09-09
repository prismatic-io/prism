import { Cli, Mcp, z } from "incur";
import { describe, expect, it, vi } from "vitest";
import {
  commandMiddleware,
  commandVars,
  applyCommandPolicy,
  environmentOptions,
  globalOptions,
} from "./command.js";
import { getMcpGlobals, runWithMcpTransport, type McpGlobals } from "./compatibility.js";
import { parseMcpLaunchGlobals } from "./cli.js";
import { getRuntimeState } from "./runtime.js";

const makeTool = () => {
  const executed = vi.fn();
  const command = applyCommandPolicy({
    mutates: true,
    options: z.object({ name: z.string() }),
    run(context) {
      executed(context.options.name);
      return {
        name: context.options.name,
        profile: getRuntimeState().selectedProfile ?? null,
        quiet: getRuntimeState().quiet,
        printRequests: getRuntimeState().printRequests,
      };
    },
  });
  const [tool] = Mcp.collectTools(new Map([["probe", command]]), []);
  if (!tool) throw new Error("Native MCP tool was not registered");
  const call = (params: Record<string, unknown>, launch: McpGlobals = {}) =>
    runWithMcpTransport(
      () =>
        Mcp.callTool(tool, params, {
          middlewares: [commandMiddleware],
          vars: commandVars,
          env: environmentOptions,
        }),
      launch,
    );
  const cli = Cli.create("test", {
    globals: globalOptions,
    vars: commandVars,
    env: environmentOptions,
    mcp: { tools: { discovery: "direct" } },
  })
    .use(commandMiddleware)
    .command("probe", command);
  return { call, command, executed, tool, cli };
};

describe("native MCP invocation globals", () => {
  it("advertises per-call approval/profile/read-only fields in the native tool schema", () => {
    const { tool } = makeTool();
    expect(tool.inputSchema.properties.context).toMatchObject({
      type: "object",
      properties: {
        yes: { type: "boolean" },
        profile: { type: "string" },
        readOnly: { type: "boolean" },
        quiet: { type: "boolean" },
        printRequests: { type: "boolean" },
      },
    });
  });

  it("rejects missing approval and accepts explicit per-call approval", async () => {
    const { call, executed } = makeTool();
    const rejected = await call({ name: "first" });
    expect(rejected.isError).toBe(true);
    expect(rejected.content[0].text).toContain("--yes");
    expect(executed).not.toHaveBeenCalled();
    const accepted = await call({ name: "second", context: { yes: true } });
    expect(accepted.isError).not.toBe(true);
    expect(JSON.parse(accepted.content[0].text)).toMatchObject({ name: "second" });
    expect(executed).toHaveBeenCalledExactlyOnceWith("second");
  });

  it("applies per-call profile and logging globals without leaking across calls", async () => {
    const { call } = makeTool();
    const scoped = await call({
      name: "first",
      context: { yes: true, profile: "per-call", quiet: true, printRequests: true },
    });
    expect(JSON.parse(scoped.content[0].text)).toMatchObject({
      profile: "per-call",
      quiet: true,
      printRequests: true,
    });
    const next = await call({ name: "second", context: { yes: true } });
    expect(JSON.parse(next.content[0].text)).toMatchObject({
      profile: null,
      quiet: false,
      printRequests: false,
    });
  });

  it("inherits launch profile/approval and lets a call select another profile", async () => {
    const { call } = makeTool();
    const launch = parseMcpLaunchGlobals(["--mcp", "--yes", "--profile", "launch-profile"], {});
    const inherited = await call({ name: "first" }, launch);
    expect(inherited.isError).not.toBe(true);
    expect(JSON.parse(inherited.content[0].text)).toMatchObject({ profile: "launch-profile" });
    const overridden = await call(
      { name: "second", context: { profile: "other-profile" } },
      launch,
    );
    expect(JSON.parse(overridden.content[0].text)).toMatchObject({ profile: "other-profile" });
  });

  it.each([
    parseMcpLaunchGlobals(["--mcp", "--read-only"], {}),
    parseMcpLaunchGlobals(["--mcp"], { PRISM_READ_ONLY: "true" }),
  ])("cannot disable launch read-only policy per call", async (launch) => {
    const { call, executed } = makeTool();
    const result = await call({ name: "blocked", context: { yes: true, readOnly: false } }, launch);
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Read-only");
    expect(executed).not.toHaveBeenCalled();
  });

  it("accepts per-call read-only policy even for an otherwise approved session", async () => {
    const { call, executed } = makeTool();
    const result = await call({ name: "blocked", context: { readOnly: true } }, { yes: true });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Read-only");
    expect(executed).not.toHaveBeenCalled();
  });
});

describe("MCP launch policy capture", () => {
  it("keeps flag-shaped option values opaque", () => {
    expect(parseMcpLaunchGlobals(["--mcp", "--profile", "--yes"], {})).toMatchObject({
      profile: "--yes",
      yes: false,
    });
    expect(parseMcpLaunchGlobals(["--mcp", "--filter-output", "--yes"], {})).toMatchObject({
      yes: false,
    });
    expect(parseMcpLaunchGlobals(["--mcp", "--", "--yes"], {})).toMatchObject({ yes: false });
  });

  it("captures immutable launch defaults rather than a mutable caller object", async () => {
    const globals = { profile: "initial", readOnly: true };
    await runWithMcpTransport(async () => {
      globals.profile = "changed";
      globals.readOnly = false;
      await Promise.resolve();
      expect(getMcpGlobals()).toEqual({ profile: "initial", readOnly: true });
      expect(Object.isFrozen(getMcpGlobals())).toBe(true);
    }, globals);
    expect(getMcpGlobals()).toEqual({});
  });
});

describe("native HTTP global inputs", () => {
  it("uses ordinary HTTP globals without the MCP context envelope", async () => {
    const { cli, executed } = makeTool();
    const call = async (input: Record<string, unknown>) => {
      const response = await cli.fetch(
        new Request("http://prism/probe", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(input),
        }),
      );
      return response.json();
    };
    const rejected = await call({ name: "blocked" });
    expect(rejected.error.code).toBe("CONFIRMATION_REQUIRED");
    expect(executed).not.toHaveBeenCalled();
    const accepted = await call({ name: "http", yes: true, profile: "http-profile" });
    expect(accepted).toMatchObject({ ok: true, data: { name: "http", profile: "http-profile" } });
    const readOnly = await call({ name: "blocked", yes: true, readOnly: true });
    expect(readOnly.error.code).toBe("READ_ONLY");
    expect(executed).toHaveBeenCalledExactlyOnceWith("http");
  });

  it("discovers and uses per-call context through native HTTP MCP", async () => {
    const { cli, executed } = makeTool();
    let id = 0;
    const rpc = async (method: string, params: Record<string, unknown>) => {
      const response = await cli.fetch(
        new Request("http://prism/mcp", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            accept: "application/json, text/event-stream",
          },
          body: JSON.stringify({ jsonrpc: "2.0", id: ++id, method, params }),
          signal: AbortSignal.timeout(5000),
        }),
      );
      const text = await response.text();
      const data = text
        .split("\n")
        .filter((line) => line.startsWith("data: "))
        .at(-1)
        ?.slice(6);
      return JSON.parse(data ?? text);
    };
    await rpc("initialize", {
      protocolVersion: "2025-11-25",
      capabilities: {},
      clientInfo: { name: "prism-test", version: "1" },
    });
    const listed = await rpc("tools/list", {});
    expect(
      listed.result.tools.find((tool: { name: string }) => tool.name === "probe").inputSchema
        .properties,
    ).toHaveProperty("context");
    const rejected = await rpc("tools/call", { name: "probe", arguments: { name: "blocked" } });
    expect(rejected.result.isError).toBe(true);
    expect(executed).not.toHaveBeenCalled();
    const accepted = await rpc("tools/call", {
      name: "probe",
      arguments: { name: "http-mcp", context: { yes: true, profile: "mcp-profile" } },
    });
    expect(accepted.result.isError).not.toBe(true);
    expect(JSON.parse(accepted.result.content[0].text)).toMatchObject({
      name: "http-mcp",
      profile: "mcp-profile",
    });
    expect(executed).toHaveBeenCalledExactlyOnceWith("http-mcp");
  });
});
