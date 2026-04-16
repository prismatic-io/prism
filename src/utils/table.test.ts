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
    expect(stdout).toContain("Role"); // explicit header
    expect(stdout).toContain("Name"); // startCase("name")
  });

  it("invokes `get` to resolve column values", async () => {
    const stdout = await render({ extended: true });
    expect(stdout).toContain("EX-Z");
    expect(stdout).toContain("EX-A");
  });

  it("renders a ─ separator row beneath the header (cli-ux parity)", async () => {
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

  it("filters rows with --filter key=substr (substring anywhere, case-sensitive)", async () => {
    const stdout = await render({ filter: "name=mi" });
    expect(stdout).toContain("mike");
    expect(stdout).not.toContain("alpha");
    expect(stdout).not.toContain("zeta");
  });

  it("filter matches substring anywhere in the value, not just a prefix", async () => {
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

  it.each([
    ["ascending", "name", ["alpha", "mike", "zeta"]],
    ["descending", "-name", ["zeta", "mike", "alpha"]],
  ] as const)("sorts %s with --sort %s", async (_desc, sort, expectedOrder) => {
    const stdout = await render({ sort });
    const positions = expectedOrder.map((name) => stdout.indexOf(name));
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
  });

  it("emits JSON with --output=json", async () => {
    const stdout = await render({ output: "json" });
    const parsed = JSON.parse(stdout);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed).toHaveLength(rows.length);
    expect(parsed[0]).toHaveProperty("name");
    expect(parsed[0]).not.toHaveProperty("id"); // extended column hidden
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
    // embedded \n splits the row across two CSV lines
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
