import { readFile } from "node:fs/promises";
import { beforeAll, describe, expect, it, type TestContext } from "vitest";
import {
  canonical,
  digest,
  mustSucceed,
  runCli,
  sorted,
  successfulCli,
  verifyIdentity,
  type Row,
} from "./cli.js";

const manifest = JSON.parse(
  await readFile(new URL("../fixtures/legacy-cli-contract.json", import.meta.url), "utf8"),
);
const records = new Map<string, Row[]>();
const cell = (value: unknown) =>
  value == null ? "" : typeof value === "object" ? JSON.stringify(value) : String(value);

beforeAll(verifyIdentity);

it("runs both published and candidate CLI versions", async () => {
  for (const ported of [false, true])
    expect(await successfulCli(ported, ["--version"])).toMatch(/\b\d+\.\d+\.\d+\b/);
});

it.for([
  { command: "customers:list", columns: "name,description" },
  { command: "integrations:list", columns: "name,description,versionNumber" },
])("preserves selected columns for $command", async ({ command, columns }) => {
  const args = [command, "--columns", columns, "--output", "json"];
  const [oldRows, newRows] = await Promise.all([
    successfulCli(false, args),
    successfulCli(true, args),
  ]);
  expect(digest(sorted(JSON.parse(newRows)))).toBe(digest(sorted(JSON.parse(oldRows))));
});

async function compare(command: string, args: string[], context: TestContext) {
  const flags = manifest.commands[command].flags;
  const display = [...(flags.extended ? ["--extended"] : []), "--output", "json"];
  const [before, after] = await Promise.all([
    runCli(false, [command, ...args, ...display]),
    runCli(true, [command, ...args, ...display]),
  ]);
  if (before.status !== 0)
    context.skip(`Published command unavailable; output hash ${digest(before)}`);
  mustSucceed(after, command);
  const oldRows: Row[] = sorted(JSON.parse(before.stdout));
  const newRows: Row[] = sorted(JSON.parse(after.stdout));
  expect.soft(digest(newRows), `${command} human rows differ`).toBe(digest(oldRows));
  records.set(command, oldRows);
  const schema = JSON.parse(await successfulCli(true, [command, "--schema", "--json"]));
  const paginated = Boolean(schema.options?.properties?.all);
  const agentArgs = [command, ...args, "--agent", "--read-only", "--json"];
  const result = JSON.parse(
    await successfulCli(true, [...agentArgs, ...(paginated ? ["--all"] : [])]),
  );
  expect(Array.isArray(result.items), `${command} has no structured items`).toBe(true);
  const rendered = sorted(
    result.items.map((row: Row) =>
      Object.fromEntries(Object.entries(row).map(([key, value]) => [key, cell(value)])),
    ),
  );
  expect.soft(digest(rendered), `${command} agent rows differ`).toBe(digest(oldRows));
  if (paginated && oldRows.length > 1) {
    const first = JSON.parse(await successfulCli(true, [...agentArgs, "--first", "1"]));
    expect(first.items).toHaveLength(1);
    expect(first.pageInfo.hasNextPage).toBe(true);
    expect(first.pageInfo.endCursor).toBeTruthy();
    const second = JSON.parse(
      await successfulCli(true, [
        ...agentArgs,
        "--first",
        "1",
        "--after",
        first.pageInfo.endCursor,
      ]),
    );
    expect(second.items).toHaveLength(1);
    expect(canonical(first.items) === canonical(second.items), `${command} did not advance`).toBe(
      false,
    );
  }
}

describe("published list compatibility", () => {
  it.for([
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
  ])("%s preserves human rows, structured rows, and pagination", async (command, context) => {
    await compare(command, [], context);
  });

  const dependent = [
    { source: "customers:list", key: "id", commands: ["customers:users:list"] },
    {
      source: "instances:list",
      key: "id",
      commands: ["instances:config-vars:list", "instances:flow-configs:list"],
    },
    {
      source: "integrations:list",
      key: "id",
      commands: ["integrations:flows:list", "integrations:versions"],
    },
    {
      source: "components:list",
      key: "key",
      commands: [
        "components:actions:list",
        "components:data-sources:list",
        "components:triggers:list",
      ],
    },
    { source: "alerts:monitors:list", key: "id", commands: ["alerts:events:list"] },
  ];
  it.for(
    dependent.flatMap(({ source, key, commands }) =>
      commands.map((command) => ({ source, key, command })),
    ),
  )("$command preserves child-resource output", async ({ source, key, command }, context) => {
    if (!records.has(source)) {
      const display = manifest.commands[source].flags.extended ? ["--extended"] : [];
      const parent = await runCli(false, [source, ...display, "--output", "json"]);
      if (parent.status !== 0)
        context.skip(`Published parent unavailable; output hash ${digest(parent)}`);
      records.set(source, JSON.parse(parent.stdout));
    }
    const value = records.get(source)?.find((row) => row[key])?.[key];
    if (!value) context.skip(`No fixture available from ${source}`);
    await compare(command, [String(value)], context);
  });
});
