import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { expect } from "vitest";

export type Row = Record<string, unknown>;
const root = fileURLToPath(new URL("../../", import.meta.url));
export const canonical = (value: unknown): string => {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value !== null && typeof value === "object")
    return `{${Object.entries(value)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, item]) => `${JSON.stringify(key)}:${canonical(item)}`)
      .join(",")}}`;
  return JSON.stringify(value) ?? "undefined";
};
export const digest = (value: unknown) =>
  createHash("sha256").update(canonical(value)).digest("hex");
export const sorted = (rows: Row[]) =>
  [...rows].sort((a, b) => canonical(a).localeCompare(canonical(b)));

export const endpoint = () => {
  expect(process.env.PRISMATIC_URL, "Set PRISMATIC_URL explicitly for live tests").toBeTruthy();
  return new URL(process.env.PRISMATIC_URL ?? "");
};

type Result = { status: number | null; stdout: string; stderr: string };
export const runCli = (ported: boolean, args: string[]): Promise<Result> => {
  const binary = ported
    ? (process.env.PRISM_CANDIDATE_BIN ?? process.execPath)
    : (process.env.PRISM_LEGACY_BIN ?? "prism");
  const prefix = ported && !process.env.PRISM_CANDIDATE_BIN ? [`${root}lib/run.js`] : [];
  return new Promise((resolve, reject) => {
    const child = spawn(binary, [...prefix, ...args], {
      cwd: root,
      env: { ...process.env, FORCE_HUMAN_MODE: "true" },
      stdio: ["ignore", "pipe", "pipe"],
      timeout: 60_000,
      killSignal: "SIGKILL",
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("error", reject);
    child.on("close", (status) =>
      resolve({ status, stdout: stdout.trim(), stderr: stderr.trim() }),
    );
  });
};
export const mustSucceed = (result: Result, label: string) => {
  // Live responses can contain customer data; report hashes instead of raw output.
  expect(result.status, `${label} failed; output hash ${digest(result)}`).toBe(0);
  return result.stdout;
};
export const successfulCli = async (ported: boolean, args: string[]) =>
  mustSucceed(await runCli(ported, args), args[0]);

export const verifyIdentity = async () => {
  const target = endpoint();
  const [legacy, candidate] = await Promise.all([
    successfulCli(false, ["me"]),
    successfulCli(true, ["me", "--format", "json"]),
  ]);
  const oldIdentity = Object.fromEntries(
    legacy.split("\n").map((line) => {
      const match = /^([^:]+):\s*(.*)$/.exec(line);
      expect(Boolean(match), "Unrecognized published identity output").toBe(true);
      return [match?.[1], match?.[2]];
    }),
  );
  const identity = JSON.parse(candidate);
  const newIdentity = {
    Name: identity.name,
    Email: identity.email,
    ...(identity.organization
      ? { Organization: identity.organization.name, "Organization ID": identity.organization.id }
      : {}),
    ...(identity.customer ? { Customer: identity.customer.name } : {}),
    ...(identity.tenantId ? { "Tenant ID": identity.tenantId } : {}),
    "Endpoint URL": identity.endpointUrl,
    Authentication: identity.authentication === "environment" ? "Environment" : "Profile",
    ...(identity.profile ? { Profile: identity.profile } : {}),
  };
  for (const value of [oldIdentity, newIdentity])
    expect(new URL(value["Endpoint URL"]).origin, "CLI is targeting a different stack").toBe(
      target.origin,
    );
  expect(digest(newIdentity), "Identity data differs").toBe(digest(oldIdentity));
};
