import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { Mcp, z } from "incur";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import {
  applyCommandPolicy,
  commandMiddleware,
  commandVars,
  environmentOptions,
} from "./command.js";
import { getCommandContext } from "./command-context.js";
import { runWithMcpTransport } from "./compatibility.js";
import { useProfile, writeProfile } from "./config.js";
import { getAuthContext } from "./context.js";
import { runCommand } from "./test-command.js";

vi.unmock("./context.js");
let directory: string;
beforeEach(async () => {
  directory = await mkdtemp(path.join(tmpdir(), "prism-native-session-"));
  vi.stubEnv("PRISM_CONFIG_FILE", path.join(directory, "config.yml"));
  for (const key of ["PRISM_ACCESS_TOKEN", "PRISM_REFRESH_TOKEN", "PRISM_PROFILE", "PRISMATIC_URL"])
    vi.stubEnv(key, "");
  for (const name of ["staging", "production"]) {
    await writeProfile(name, {
      accessToken: `${name}-token`,
      refreshToken: "refresh",
      expiresIn: 3600,
      scope: "openid",
      tokenType: "Bearer",
      prismaticUrl: `https://${name}.example.com`,
    });
  }
});
afterEach(async () => {
  await rm(directory, { recursive: true, force: true });
});

it("binds concurrent MCP calls after applying profile overrides and auth policy", async () => {
  vi.stubEnv("PRISM_ACCESS_TOKEN", "environment-token");
  const ready = Promise.withResolvers<void>();
  let entered = 0;
  const command = applyCommandPolicy({
    authContext: "profile",
    output: z.object({ profile: z.string(), url: z.string() }),
    async run() {
      entered += 1;
      if (entered === 2) ready.resolve();
      await ready.promise;
      const auth = await getAuthContext();
      expect(auth.source).toBe("profile");
      await Promise.resolve();
      expect(await getAuthContext()).toBe(auth);
      return {
        profile: auth.source === "profile" ? auth.profileName : "environment",
        url: auth.url,
      };
    },
  });
  const [tool] = Mcp.collectTools(new Map([["probe", command]]), []);
  const call = (profile?: string) =>
    runWithMcpTransport(
      () =>
        Mcp.callTool(tool, profile ? { context: { profile } } : {}, {
          middlewares: [commandMiddleware],
          vars: commandVars,
          env: environmentOptions,
        }),
      { profile: "staging" },
    );
  const [staging, production] = await Promise.all([call(), call("production")]);
  expect(staging.isError).not.toBe(true);
  expect(production.isError).not.toBe(true);
  expect(JSON.parse(staging.content[0].text)).toMatchObject({
    profile: "staging",
    url: "https://staging.example.com",
  });
  expect(JSON.parse(production.content[0].text)).toMatchObject({
    profile: "production",
    url: "https://production.example.com",
  });
  expect(getCommandContext()).toBeUndefined();
});

it("keeps one auth session through native generator resumes and cleanup", async () => {
  let cleanupProfile: string | undefined;
  const command = applyCommandPolicy({
    output: z.object({ profile: z.string() }),
    async *run() {
      const auth = await getAuthContext();
      if (auth.source !== "profile") throw new Error("Expected profile session");
      try {
        yield { profile: auth.profileName };
        await useProfile("production");
        expect(await getAuthContext()).toBe(auth);
        yield {
          profile: (await getAuthContext()).source === "profile" ? auth.profileName : "environment",
        };
      } finally {
        expect(await getAuthContext()).toBe(auth);
        cleanupProfile = auth.profileName;
      }
    },
  });
  expect(await runCommand(command, ["--agent"])).toEqual([
    { profile: "staging" },
    { profile: "staging" },
  ]);
  expect(cleanupProfile).toBe("staging");
  expect(getCommandContext()).toBeUndefined();
});
