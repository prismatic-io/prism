import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash, randomUUID } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

assert.equal(
  process.env.PRISM_AUDIT_MUTATIONS,
  "true",
  "Set PRISM_AUDIT_MUTATIONS=true to create and remove temporary audit customers",
);
const endpoint = new URL(process.env.PRISMATIC_URL);
assert.ok(
  endpoint.hostname.endsWith(".prismatic-dev.io"),
  "This audit only runs on a development stack",
);
const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const legacy = process.env.PRISM_LEGACY_BIN ?? "prism";
const candidate = process.env.PRISM_CANDIDATE_BIN ?? process.execPath;
const prefix = process.env.PRISM_CANDIDATE_BIN ? [] : [path.join(root, "lib/run.js")];
const env = { ...process.env, FORCE_HUMAN_MODE: "true" };
const digest = (value) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
const run = (ported, args) => {
  const result = spawnSync(ported ? candidate : legacy, [...(ported ? prefix : []), ...args], {
    cwd: root,
    env,
    encoding: "utf8",
    timeout: 60_000,
  });
  assert.equal(
    result.status,
    0,
    `${args[0]} failed: status=${result.status}, outputHash=${digest([result.stdout, result.stderr])}`,
  );
  return result.stdout.trim();
};
const suffix = randomUUID();
const cleanup = [];
const checks = [];
try {
  for (const ported of [false, true]) {
    const label = ported ? "port" : "release";
    const externalId = `prism-incur-audit-${suffix}-${label}`;
    const name = `Prism incur audit ${suffix} ${label}`;
    const machine = ported ? ["--agent", "--yes", "--json"] : [];
    const created = run(ported, [
      "customers:create",
      ...machine,
      "--name",
      name,
      "--externalId",
      externalId,
      "--label",
      "Compatibility A",
      "Compatibility B",
    ]);
    const id = ported ? JSON.parse(created).customerId : created;
    assert.ok(
      typeof id === "string" && id.length > 0 && !id.includes("\n"),
      "No created customer ID",
    );
    cleanup.push({ ported, id, deleted: false });
    const query =
      "query AuditCustomer($id: ID!) { customer(id: $id) { name externalId labels description } }";
    const read = () =>
      JSON.parse(run(ported, ["graphql:query", query, "-v", JSON.stringify({ id })])).customer;
    const original = read();
    assert.equal(original.name, name);
    assert.equal(original.externalId, externalId);
    assert.deepEqual([...original.labels].sort(), ["compatibility a", "compatibility b"]);
    const updatedName = `${name} updated`;
    run(ported, [
      "customers:update",
      id,
      ...machine,
      `-n=${updatedName}`,
      "--description",
      "Compatibility audit; safe to remove",
    ]);
    const updated = read();
    assert.equal(updated.name, updatedName);
    assert.equal(updated.description, "Compatibility audit; safe to remove");
    run(ported, ["customers:delete", id, ...machine]);
    cleanup.at(-1).deleted = true;
    const remaining = JSON.parse(
      run(ported, [
        "customers:list",
        "--columns",
        "id",
        "--filter",
        `externalId=^${externalId}$`,
        "--output",
        "json",
      ]),
    );
    assert.deepEqual(remaining, []);
    checks.push({
      cli: label,
      create: true,
      arrays: true,
      variablesAlias: true,
      attachedAlias: true,
      update: true,
      delete: true,
    });
  }
} finally {
  for (const item of cleanup.filter((entry) => !entry.deleted)) {
    try {
      run(item.ported, [
        "customers:delete",
        item.id,
        ...(item.ported ? ["--agent", "--yes", "--json"] : []),
      ]);
      item.deleted = true;
    } catch {
      process.stderr.write(
        `Cleanup required for audit customer ${item.id} on ${endpoint.origin}\n`,
      );
      process.exitCode = 1;
    }
  }
}
process.stdout.write(
  `${JSON.stringify({ checkedAt: new Date().toISOString(), stack: endpoint.origin, checks, allTemporaryCustomersRemoved: cleanup.every((entry) => entry.deleted) }, null, 2)}\n`,
);
