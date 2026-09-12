import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PrismaticBaseCommand } from "./baseCommand.js";
import { getCommandContext } from "./command-context.js";
import { writeProfile } from "./config.js";
import { getAuthContext } from "./context.js";

vi.unmock("./context.js");

let directory: string;
afterEach(async () => {
  if (directory) await rm(directory, { recursive: true, force: true });
});

it("isolates overlapping oclif commands after parsing and across nested execution", async () => {
  directory = await mkdtemp(path.join(tmpdir(), "prism-command-session-"));
  vi.stubEnv("PRISM_CONFIG_FILE", path.join(directory, "config.yml"));
  for (const key of ["PRISM_ACCESS_TOKEN", "PRISM_REFRESH_TOKEN", "PRISMATIC_URL", "PRISM_PROFILE"])
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
  const stagingParsed = Promise.withResolvers<void>();
  const productionParsed = Promise.withResolvers<void>();
  class Nested extends PrismaticBaseCommand {
    async run() {
      await this.parse(Nested);
      return getAuthContext();
    }
  }
  class Staging extends PrismaticBaseCommand {
    async run() {
      await this.parse(Staging);
      stagingParsed.resolve();
      await productionParsed.promise;
      const context = await getAuthContext();
      expect(await Nested.run(["--profile", "production"])).toMatchObject({
        profileName: "production",
      });
      expect(await getAuthContext()).toBe(context);
      return context;
    }
  }
  class Production extends PrismaticBaseCommand {
    async run() {
      await stagingParsed.promise;
      await this.parse(Production);
      productionParsed.resolve();
      await Promise.resolve();
      return getAuthContext();
    }
  }
  const [staging, production] = await Promise.all([
    Staging.run(["--profile", "staging"]),
    Production.run(["--profile", "production"]),
  ]);
  expect(staging).toMatchObject({
    profileName: "staging",
    accessToken: "staging-token",
    url: "https://staging.example.com",
  });
  expect(production).toMatchObject({
    profileName: "production",
    accessToken: "production-token",
    url: "https://production.example.com",
  });
  expect(getCommandContext()).toBeUndefined();
});

describe("oclif auth initialization", () => {
  it("does not read auth configuration for commands that never authenticate", async () => {
    vi.stubEnv("PRISM_CONFIG_FILE", "/nonexistent/prism/config.yml");
    class Local extends PrismaticBaseCommand {
      async run() {
        await this.parse(Local);
        expect(getCommandContext()?.auth).toBeUndefined();
        return "local";
      }
    }
    expect(await Local.run([])).toBe("local");
  });

  it("leaves no session behind when execution throws", async () => {
    class Failing extends PrismaticBaseCommand {
      async run() {
        await this.parse(Failing);
        throw new Error("command failed");
      }
    }
    await expect(Failing.run([])).rejects.toThrow("command failed");
    expect(getCommandContext()).toBeUndefined();
    process.exitCode = 0;
  });
});
