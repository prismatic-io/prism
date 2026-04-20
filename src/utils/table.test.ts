import { captureOutput } from "@oclif/test";
import { describe, expect, it } from "vitest";
import { loadYaml } from "./serialize.js";
import { type ColumnsConfig, printTable, tableFlags } from "./table.js";

type Row = {
  id: string;
  name: string;
  role: string;
  extra?: string;
};

const rows: Row[] = [
  { id: "a1", name: "zeta", role: "admin", extra: "ex-z" },
  { id: "b2", name: "alpha", role: "user", extra: "ex-a" },
  { id: "c3", name: "mike", role: "user", extra: "ex-m" },
];

const columns: ColumnsConfig<Row> = {
  id: { extended: true, minWidth: 4 },
  name: {},
  role: { header: "Role" },
  extra: { extended: true, get: (r) => r.extra?.toUpperCase() ?? "" },
};

const render = async (flags: Parameters<typeof printTable>[2] = {}) => {
  const { stdout } = await captureOutput(async () => {
    printTable(rows, columns, flags);
  });
  return stdout;
};

describe("tableFlags", () => {
  it("returns the full flag set by default", () => {
    const flags = tableFlags();
    expect(Object.keys(flags).sort()).toEqual(
      ["columns", "csv", "extended", "filter", "no-header", "no-truncate", "output", "sort"].sort(),
    );
  });

  it("honors `only`", () => {
    const flags = tableFlags({ only: ["extended", "columns"] });
    expect(Object.keys(flags).sort()).toEqual(["columns", "extended"]);
  });

  it("honors `except`", () => {
    const flags = tableFlags({ except: ["sort", "filter"] });
    expect(Object.keys(flags).sort()).toEqual(
      ["columns", "csv", "extended", "no-header", "no-truncate", "output"].sort(),
    );
  });
});

describe("printTable", () => {
  it("hides extended columns by default", async () => {
    const stdout = await render();
    expect(stdout).toContain("Name");
    expect(stdout).toContain("Role");
    expect(stdout).not.toMatch(/\bId\b/);
    expect(stdout).not.toMatch(/\bExtra\b/);
  });

  it("reveals extended columns with --extended", async () => {
    const stdout = await render({ extended: true });
    expect(stdout).toMatch(/\bId\b/);
    expect(stdout).toMatch(/\bExtra\b/);
  });

  it("uses startCase on unspecified headers and preserves explicit `header` overrides", async () => {
    const stdout = await render();
    expect(stdout).toContain("Role");
    expect(stdout).toContain("Name");
  });

  it("invokes `get` to resolve column values", async () => {
    const stdout = await render({ extended: true });
    expect(stdout).toContain("EX-Z");
    expect(stdout).toContain("EX-A");
  });

  it("renders a ─ separator row beneath the header", async () => {
    const stdout = await render();
    const headerRowIndex = stdout.indexOf("Name");
    const separatorIndex = stdout.indexOf("─");
    expect(separatorIndex).toBeGreaterThan(headerRowIndex);
  });

  it("honors --columns to pick a subset in order", async () => {
    const stdout = await render({ columns: "role,name" });
    const headerLine = stdout.split("\n")[0];
    expect(headerLine.indexOf("Role")).toBeLessThan(headerLine.indexOf("Name"));
    expect(headerLine).not.toMatch(/\bId\b/);
    expect(headerLine).not.toMatch(/\bExtra\b/);
  });

  it("suppresses the header and separator with --no-header", async () => {
    const stdout = await render({ "no-header": true });
    expect(stdout).not.toContain("Name");
    expect(stdout).not.toContain("─");
    expect(stdout).toMatch(/zeta|alpha|mike/);
  });

  it("filters rows with --filter key=pattern (regex, matches anywhere by default)", async () => {
    const stdout = await render({ filter: "name=mi" });
    expect(stdout).toContain("mike");
    expect(stdout).not.toContain("alpha");
    expect(stdout).not.toContain("zeta");
  });

  it("filter matches anywhere in the value, not just a prefix", async () => {
    const stdout = await render({ filter: "name=lpha" });
    expect(stdout).toContain("alpha");
    expect(stdout).not.toContain("mike");
    expect(stdout).not.toContain("zeta");
  });

  it("filter is case-sensitive — wrong case is treated as no-match, not ignored", async () => {
    const stdout = await render({ filter: "name=MIKE" });
    expect(stdout).not.toContain("mike");
    expect(stdout).not.toContain("alpha");
    expect(stdout).not.toContain("zeta");
  });

  it("filter supports regex anchors, metacharacters, and alternation", async () => {
    const anchored = await render({ filter: "name=^m" });
    expect(anchored).toContain("mike");
    expect(anchored).not.toContain("alpha");
    expect(anchored).not.toContain("zeta");

    const metachar = await render({ filter: "name=.ke" });
    expect(metachar).toContain("mike");
    expect(metachar).not.toContain("alpha");

    const alternation = await render({ filter: "name=^(zeta|alpha)$" });
    expect(alternation).toContain("zeta");
    expect(alternation).toContain("alpha");
    expect(alternation).not.toContain("mike");
  });

  it("filter negates the match when the key is prefixed with -", async () => {
    const stdout = await render({ filter: "-name=^m" });
    expect(stdout).toContain("alpha");
    expect(stdout).toContain("zeta");
    expect(stdout).not.toContain("mike");
  });

  it("filter rejects invalid regex patterns", async () => {
    const { error } = await captureOutput(async () => {
      printTable(rows, columns, { filter: "name=[unclosed" });
    });
    expect(error?.message).toBe("Filter flag has an invalid value");
  });

  it("filter preserves `=` characters inside the value (splits on first `=` only)", async () => {
    const rowsWithEquals: Row[] = [
      { id: "a", name: "k=v", role: "ops" },
      { id: "b", name: "plain", role: "ops" },
    ];
    const { stdout } = await captureOutput(async () => {
      printTable(rowsWithEquals, columns, { filter: "name=k=v" });
    });
    expect(stdout).toContain("k=v");
    expect(stdout).not.toContain("plain");
  });

  it("filter applies to `get`-derived values, not the raw source", async () => {
    const stdout = await render({ extended: true, filter: "extra=EX-Z" });
    expect(stdout).toContain("EX-Z");
    expect(stdout).not.toContain("EX-A");
    expect(stdout).not.toContain("EX-M");
  });

  it.each([
    ["whitespace around the key", "  name  =  mi  "],
    ["an empty value", "name="],
    ["an empty key", "=value"],
    ["an unknown column key", "nonexistent=anything"],
    ["a value with no `=` separator", "garbage"],
  ])("filter rejects %s", async (_desc, filter) => {
    const { error } = await captureOutput(async () => {
      printTable(rows, columns, { filter });
    });
    expect(error?.message).toBe("Filter flag has an invalid value");
  });

  it("filter resolves keys case-insensitively against the raw key", async () => {
    const stdout = await render({ filter: "NAME=mike" });
    expect(stdout).toContain("mike");
    expect(stdout).not.toContain("alpha");
  });

  it("filter resolves keys against display headers (startCase-derived)", async () => {
    const stdout = await render({ filter: "Name=mike" });
    expect(stdout).toContain("mike");
    expect(stdout).not.toContain("alpha");
  });

  it("filter resolves keys against explicit header overrides", async () => {
    const stdout = await render({ filter: "Role=admin" });
    expect(stdout).toContain("zeta");
    expect(stdout).not.toContain("mike");
    expect(stdout).not.toContain("alpha");
  });

  it("--columns accepts raw keys, display headers, and mixed case", async () => {
    const stdout = await render({ columns: "Role,NAME" });
    const headerLine = stdout.split("\n")[0];
    expect(headerLine.indexOf("Role")).toBeLessThan(headerLine.indexOf("Name"));
    expect(headerLine).not.toMatch(/\bId\b/);
  });

  it("--columns matches extended columns by header (e.g. `Id`)", async () => {
    const stdout = await render({ columns: "Id" });
    expect(stdout).toMatch(/\bId\b/);
    expect(stdout).toContain("a1");
  });

  it("filter runs on the full dataset when --columns hides the filter column", async () => {
    const stdout = await render({ filter: "name=alpha", columns: "role" });
    expect(stdout).toContain("user");
    expect(stdout).not.toContain("admin");
    const lines = stdout.trim().split("\n");
    expect(lines).toHaveLength(3);
  });

  it("sort runs on the full dataset when --columns hides the sort column", async () => {
    const stdout = await render({ sort: "name", columns: "role" });
    const headerLine = stdout.split("\n")[0];
    expect(headerLine).not.toMatch(/\bName\b/);
    const dataLines = stdout.trim().split("\n").slice(2);
    expect(dataLines[0]).toContain("user");
    expect(dataLines[2]).toContain("admin");
  });

  it("filter can match an extended column even without --extended", async () => {
    const stdout = await render({ filter: "extra=EX-Z" });
    expect(stdout).toContain("zeta");
    expect(stdout).not.toContain("alpha");
    expect(stdout).not.toMatch(/\bExtra\b/);
  });

  it("sort accepts case-insensitive header match", async () => {
    const stdout = await render({ sort: "Name" });
    const positions = ["alpha", "mike", "zeta"].map((name) => stdout.indexOf(name));
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
  });

  it("--columns narrows JSON output to requested columns in requested order", async () => {
    const stdout = await render({ output: "json", columns: "role,name" });
    const parsed = JSON.parse(stdout) as Array<Record<string, string>>;
    expect(Object.keys(parsed[0])).toEqual(["role", "name"]);
  });

  it.each([
    ["ascending", "name", ["alpha", "mike", "zeta"]],
    ["descending", "-name", ["zeta", "mike", "alpha"]],
  ] as const)("sorts %s with --sort %s", async (_desc, sort, expectedOrder) => {
    const stdout = await render({ sort });
    const positions = expectedOrder.map((name) => stdout.indexOf(name));
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
  });

  it("sorts by multiple keys with --sort key1,key2", async () => {
    const multi = [
      { id: "1", name: "b", role: "user" },
      { id: "2", name: "a", role: "user" },
      { id: "3", name: "a", role: "admin" },
    ];
    const { stdout } = await captureOutput(async () => {
      printTable(multi, columns, { sort: "name,role" });
    });
    const dataLines = stdout.trim().split("\n").slice(2);
    expect(dataLines[0]).toContain("admin");
    expect(dataLines[1]).toMatch(/a .* user/);
    expect(dataLines[2]).toMatch(/b .* user/);
  });

  it("supports per-key direction in multi-key sort", async () => {
    const multi = [
      { id: "1", name: "b", role: "user" },
      { id: "2", name: "a", role: "user" },
      { id: "3", name: "a", role: "admin" },
    ];
    const { stdout } = await captureOutput(async () => {
      printTable(multi, columns, { sort: "name,-role" });
    });
    const dataLines = stdout.trim().split("\n").slice(2);
    expect(dataLines[0]).toMatch(/a .* user/);
    expect(dataLines[1]).toMatch(/a .* admin/);
    expect(dataLines[2]).toMatch(/b .* user/);
  });

  it("sorts naturally — item2 comes before item10", async () => {
    const natural = [{ name: "item10" }, { name: "item2" }, { name: "item1" }];
    const { stdout } = await captureOutput(async () => {
      printTable(natural, { name: {} }, { sort: "name" });
    });
    const positions = ["item1", "item2", "item10"].map((n) => stdout.indexOf(n));
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
  });

  it("--columns dedupes repeated entries", async () => {
    const stdout = await render({ columns: "name,name,Name" });
    const headerLine = stdout.split("\n")[0];
    expect(headerLine.match(/Name/g)).toHaveLength(1);
  });

  it("emits JSON with --output=json", async () => {
    const stdout = await render({ output: "json" });
    const parsed = JSON.parse(stdout);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed).toHaveLength(rows.length);
    expect(parsed[0]).toHaveProperty("name");
    expect(parsed[0]).not.toHaveProperty("id");
  });

  it.each([
    ["--csv", { csv: true }],
    ["--output=csv", { output: "csv" }],
  ] as const)("emits RFC 4180 CSV with %s", async (_desc, flags) => {
    const stdout = await render(flags);
    const lines = stdout.trim().split("\n");
    expect(lines[0]).toBe("Name,Role");
    expect(lines).toHaveLength(rows.length + 1);
    expect(lines[1]).toBe("zeta,admin");
  });

  it("quotes CSV fields that contain commas, quotes, or newlines", async () => {
    const rowsWithSpecials: Row[] = [
      { id: "x", name: "has, comma", role: 'has "quote"' },
      { id: "y", name: "has\nnewline", role: "plain" },
    ];
    const { stdout } = await captureOutput(async () => {
      printTable(rowsWithSpecials, columns, { csv: true });
    });
    const lines = stdout.trim().split("\n");
    expect(lines[1]).toBe('"has, comma","has ""quote"""');
    expect(lines[2]).toContain('"has');
  });

  it("emits YAML with --output=yaml that round-trips", async () => {
    const stdout = await render({ output: "yaml" });
    const parsed = loadYaml<Array<Record<string, string>>>(stdout);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed).toHaveLength(rows.length);
    expect(parsed[0].name).toBe("zeta");
  });
});
