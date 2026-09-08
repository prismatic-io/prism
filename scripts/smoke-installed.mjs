import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

const run = (...args) =>
  spawnSync(process.execPath, [path.join(root, "lib/run.js"), ...args], {
    cwd: root,
    encoding: "utf8",
    env: { ...process.env, FORCE_HUMAN_MODE: "true" },
  });

const version = run("--version");
assert.equal(version.status, 0, version.stderr);
assert.match(version.stdout, /\b\d+\.\d+\.\d+\b/);

const help = run("--help");
assert.equal(help.status, 0, help.stderr);
assert.match(help.stdout, /Usage: prism <command>/);
assert.doesNotMatch(help.stdout, /__self|legacyNo|legacy-no/);

const schema = run("customers:list", "--schema");
assert.equal(schema.status, 0, schema.stderr);
assert.match(schema.stdout, /items/);
assert.match(schema.stdout, /pageInfo/);

const invalid = run("--agent", "profiles:list", "unexpected");
assert.equal(invalid.status, 2, invalid.stderr || invalid.stdout);
assert.match(invalid.stdout, /code: VALIDATION_ERROR/);

const guarded = run("--agent", "profiles:delete", "default");
assert.equal(guarded.status, 2, guarded.stderr || guarded.stdout);
assert.match(guarded.stdout, /code: CONFIRMATION_REQUIRED/);

process.stdout.write(`Installed CLI smoke passed on ${process.version}\n`);
