import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const legacy = process.env.PRISM_LEGACY_BIN ?? "prism";
const candidate = process.env.PRISM_CANDIDATE_BIN ?? process.execPath;
const candidatePrefix = process.env.PRISM_CANDIDATE_BIN ? [] : [path.join(root, "lib/run.js")];
assert.ok(
  process.env.PRISMATIC_URL,
  "Set PRISMATIC_URL explicitly to the development stack to audit",
);
const endpoint = new URL(process.env.PRISMATIC_URL);
const manifest = JSON.parse(
  await readFile(path.join(root, "test/fixtures/legacy-cli-contract.json"), "utf8"),
);
const env = { ...process.env, FORCE_HUMAN_MODE: "true" };
const checks = [];
const records = new Map();
const canonical = (value) => {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value !== null && typeof value === "object")
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`)
      .join(",")}}`;
  return JSON.stringify(value);
};
const sorted = (rows) => [...rows].sort((a, b) => canonical(a).localeCompare(canonical(b)));
const digest = (value) => createHash("sha256").update(canonical(value)).digest("hex");
const cell = (value) =>
  value == null ? "" : typeof value === "object" ? JSON.stringify(value) : String(value);
const run = (binary, prefix, args) =>
  new Promise((resolve, reject) => {
    const child = spawn(binary, [...prefix, ...args], {
      cwd: root,
      env,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "",
      stderr = "";
    const timer = setTimeout(() => child.kill("SIGTERM"), 60_000);
    child.stdout.on("data", (data) => {
      stdout += data;
    });
    child.stderr.on("data", (data) => {
      stderr += data;
    });
    child.on("error", (error) => {
      clearTimeout(timer);
      reject(error);
    });
    child.on("close", (status, signal) => {
      clearTimeout(timer);
      resolve({ status, signal, stdout: stdout.trim(), stderr: stderr.trim() });
    });
  });
const oldRun = (args) => run(legacy, [], args);
const newRun = (args) => run(candidate, candidatePrefix, args);
const mustSucceed = (result, label) =>
  assert.equal(
    result.status,
    0,
    `${label} failed (status ${result.status}; output hash ${digest(result)})`,
  );
const versions = await Promise.all([oldRun(["--version"]), newRun(["--version"])]);
versions.forEach((result) => {
  mustSucceed(result, "version");
});
const identities = await Promise.all([oldRun(["me"]), newRun(["me", "--format", "json"])]);
identities.forEach((result) => {
  mustSucceed(result, "me");
});
const legacyIdentity = Object.fromEntries(
  identities[0].stdout
    .trim()
    .split("\n")
    .map((line) => {
      const match = /^([^:]+):\s*(.*)$/.exec(line);
      assert.ok(match, "Unrecognized published identity output");
      return [match[1], match[2]];
    }),
);
const identity = JSON.parse(identities[1].stdout);
const nativeIdentity = {
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
for (const identity of [legacyIdentity, nativeIdentity]) {
  assert.equal(
    new URL(identity["Endpoint URL"]).origin,
    endpoint.origin,
    "CLI is targeting a different stack",
  );
}
assert.equal(canonical(legacyIdentity), canonical(nativeIdentity), "Identity data differs");
checks.push({ command: "me", status: "matched", sha256: digest(nativeIdentity) });

async function compare(command, args = []) {
  const flags = manifest.commands[command].flags;
  const display = [...(flags.extended ? ["--extended"] : []), "--output", "json"];
  const [before, after] = await Promise.all([
    oldRun([command, ...args, ...display]),
    newRun([command, ...args, ...display]),
  ]);
  if (before.status !== 0) {
    checks.push({
      command,
      status: "baseline-unavailable",
      legacyExit: before.status,
      candidateExit: after.status,
      legacyErrorHash: digest(before.stderr),
      candidateErrorHash: digest(after.stderr),
    });
    return;
  }
  mustSucceed(after, command);
  const oldRows = sorted(JSON.parse(before.stdout));
  const newRows = sorted(JSON.parse(after.stdout));
  const same = canonical(oldRows) === canonical(newRows);
  checks.push({
    command,
    mode: "human",
    status: same ? "matched" : "mismatch",
    count: oldRows.length,
    legacyHash: digest(oldRows),
    candidateHash: digest(newRows),
  });
  records.set(command, oldRows);
  const schema = await newRun([command, "--schema", "--json"]);
  mustSucceed(schema, `${command} schema`);
  const paginated = Boolean(JSON.parse(schema.stdout).options?.properties?.all);
  const agent = await newRun([
    command,
    ...args,
    "--agent",
    "--read-only",
    "--json",
    ...(paginated ? ["--all"] : []),
  ]);
  mustSucceed(agent, `${command} agent`);
  const result = JSON.parse(agent.stdout);
  assert.ok(Array.isArray(result.items), `${command} has no structured items`);
  const rendered = sorted(
    result.items.map((row) =>
      Object.fromEntries(Object.entries(row).map(([key, value]) => [key, cell(value)])),
    ),
  );
  const agentSame = canonical(oldRows) === canonical(rendered);
  checks.push({
    command,
    mode: "agent",
    status: agentSame ? "matched" : "mismatch",
    count: result.items.length,
    legacyHash: digest(oldRows),
    candidateHash: digest(rendered),
  });
  if (paginated && oldRows.length > 1) {
    const pageOne = await newRun([
      command,
      ...args,
      "--agent",
      "--read-only",
      "--json",
      "--first",
      "1",
    ]);
    mustSucceed(pageOne, `${command} first page`);
    const first = JSON.parse(pageOne.stdout);
    assert.equal(first.items.length, 1, `${command} --first was not bounded`);
    assert.equal(first.pageInfo.hasNextPage, true, `${command} lost next page`);
    assert.ok(first.pageInfo.endCursor, `${command} lost cursor`);
    const pageTwo = await newRun([
      command,
      ...args,
      "--agent",
      "--read-only",
      "--json",
      "--first",
      "1",
      "--after",
      first.pageInfo.endCursor,
    ]);
    mustSucceed(pageTwo, `${command} second page`);
    const second = JSON.parse(pageTwo.stdout);
    assert.equal(second.items.length, 1);
    assert.notEqual(canonical(first.items), canonical(second.items), `${command} did not advance`);
    checks.push({ command, mode: "pagination", status: "matched" });
  }
  process.stderr.write(`Checked ${command}\n`);
}

for (const command of [
  "customers:list",
  "integrations:list",
  "instances:list",
  "components:list",
  "on-prem-resources:list",
  "alerts:groups:list",
  "alerts:monitors:list",
  "alerts:triggers:list",
  "alerts:webhooks:list",
  "customers:users:roles",
  "logs:severities:list",
  "organization:connections:list",
  "organization:signing-keys:list",
  "organization:users:list",
  "organization:users:roles",
])
  await compare(command);

const dependent = [
  ["customers:list", "id", ["customers:users:list"]],
  ["instances:list", "id", ["instances:config-vars:list", "instances:flow-configs:list"]],
  ["integrations:list", "id", ["integrations:flows:list", "integrations:versions"]],
  [
    "components:list",
    "key",
    ["components:actions:list", "components:data-sources:list", "components:triggers:list"],
  ],
  ["alerts:monitors:list", "id", ["alerts:events:list"]],
];
for (const [source, key, commands] of dependent) {
  const value = records.get(source)?.find((row) => row[key])?.[key];
  for (const command of commands) {
    if (value) await compare(command, [value]);
    else checks.push({ command, status: "no-fixture", source });
  }
}
const report = {
  checkedAt: new Date().toISOString(),
  stack: endpoint.origin,
  legacy: versions[0].stdout,
  candidate: versions[1].stdout,
  checks,
};
process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
if (checks.some((check) => check.status === "mismatch")) process.exitCode = 1;
