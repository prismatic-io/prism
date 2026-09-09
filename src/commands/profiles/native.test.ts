import { afterEach, describe, expect, it, vi } from "vitest";
import { cli } from "../../cli.js";
import { ConfigStore } from "../../config-store.js";

afterEach(() => vi.unstubAllEnvs());

async function invoke(argv: string[]) {
  const writes: string[] = [];
  let exitCode = 0;
  await cli.serve([...argv, "--agent", "--yes", "--json", "--full-output"], {
    stdout: (value) => writes.push(value),
    exit: (code) => {
      exitCode = code;
    },
  });
  return { result: JSON.parse(writes.join("")), exitCode };
}

describe("native profile guidance", () => {
  it("follows the newly selected profile, even when the invocation selects another", async () => {
    const useProfile = vi.spyOn(ConfigStore.prototype, "setDefaultProfile").mockResolvedValue();
    const { result, exitCode } = await invoke([
      "profiles",
      "use",
      "QA Team",
      "--profile",
      "production",
    ]);
    expect(exitCode).toBe(0);
    expect(useProfile).toHaveBeenCalledWith("QA Team");
    expect(result.data).toEqual({ profile: "QA Team" });
    expect(result.meta.cta.commands[0].command).toContain("me --profile 'QA Team'");
    expect(result.meta.cta.commands[0].command).not.toContain("production");
  });

  it("guides the last-profile deletion to a fresh default, not the deleted selection", async () => {
    vi.spyOn(ConfigStore.prototype, "deleteProfile").mockResolvedValue({
      deleted: true,
      isLast: true,
    });
    const { result } = await invoke(["profiles", "delete", "staging", "--profile", "staging"]);
    expect(result.data).toEqual({ profile: "staging", deleted: true, defaultProfile: null });
    expect(result.meta.cta.commands[0].command).toContain("login --profile default");
  });

  it("returns an actionable native error for a missing profile", async () => {
    vi.spyOn(ConfigStore.prototype, "deleteProfile").mockResolvedValue({ deleted: false });
    const { result, exitCode } = await invoke(["profiles", "delete", "missing"]);
    expect(exitCode).toBe(1);
    expect(result).toMatchObject({ ok: false, error: { code: "NOT_FOUND", retryable: false } });
    expect(result.meta.cta.commands[0].command).toContain("profiles list");
  });
});
