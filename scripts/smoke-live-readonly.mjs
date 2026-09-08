import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const legacy = process.env.PRISM_LEGACY_BIN ?? "prism";
const candidate = process.env.PRISM_CANDIDATE_BIN ?? process.execPath;
const candidatePrefix = process.env.PRISM_CANDIDATE_BIN ? [] : [path.join(root, "lib/run.js")];

const run = (binary, prefix, args) => {
  const result = spawnSync(binary, [...prefix, ...args], {
    cwd: root,
    encoding: "utf8",
    env: { ...process.env, FORCE_HUMAN_MODE: "true" },
  });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  return result.stdout.trim();
};

const canonical = (value) => JSON.stringify(value, Object.keys(value[0] ?? {}).sort(), 0);
const digest = (value) => createHash("sha256").update(canonical(value)).digest("hex");
const sorted = (value) =>
  [...value].sort((left, right) => canonical([left]).localeCompare(canonical([right])));

const checks = [
  { command: "customers:list", columns: "name,description" },
  { command: "integrations:list", columns: "name,description,versionNumber" },
].map(({ command, columns }) => {
  const oldValue = JSON.parse(run(legacy, [], [command, "--columns", columns, "--output", "json"]));
  const newValue = JSON.parse(
    run(candidate, candidatePrefix, [command, "--columns", columns, "--output", "json"]),
  );
  assert.deepEqual(sorted(newValue), sorted(oldValue), `${command} returned different records`);
  return { command, count: newValue.length, sha256: digest(sorted(newValue)) };
});

const legacyMe = run(legacy, [], ["me"]);
const candidateMe = run(candidate, candidatePrefix, ["me"]);
assert.equal(candidateMe, legacyMe, "me returned different profile information");
checks.unshift({
  command: "me",
  count: legacyMe.split("\n").length,
  sha256: createHash("sha256").update(legacyMe).digest("hex"),
});

process.stdout.write(
  `${JSON.stringify(
    {
      candidate: run(candidate, candidatePrefix, ["--version"]),
      checks,
      legacy: run(legacy, [], ["--version"]),
    },
    null,
    2,
  )}\n`,
);
