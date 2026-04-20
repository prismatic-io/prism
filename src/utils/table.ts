// Minimal reimplementation of @oclif/core v3's ux.table (removed in v4), preserving the
// flag shape, output format, and the case-insensitive key-or-header lookup that --filter,
// --columns, and --sort used.

import { Errors, Flags } from "@oclif/core";
import chalk from "chalk";
import { startCase } from "lodash-es";
import { orderBy } from "natural-orderby";
import { dumpYaml } from "./serialize.js";

export type ColumnDef<T> = {
  header?: string;
  extended?: boolean;
  minWidth?: number;
  get?: (row: T) => unknown;
};

export type ColumnsConfig<T> = Record<string, ColumnDef<T>>;

export type TableFlagKey =
  | "columns"
  | "sort"
  | "filter"
  | "csv"
  | "output"
  | "extended"
  | "no-header"
  | "no-truncate";

export type TableFlags = {
  columns?: string;
  sort?: string;
  filter?: string;
  csv?: boolean;
  output?: string;
  extended?: boolean;
  "no-header"?: boolean;
  "no-truncate"?: boolean;
};

// Flag order is part of the oclif manifest contract; don't reorder.
const allFlags = () => ({
  columns: Flags.string({
    exclusive: ["extended"],
    description: "only show provided columns (comma-separated)",
  }),
  csv: Flags.boolean({
    exclusive: ["no-truncate"],
    description: "output is csv format [alias: --output=csv]",
  }),
  extended: Flags.boolean({
    char: "x",
    exclusive: ["columns"],
    description: "show extra columns",
  }),
  filter: Flags.string({
    description: "filter property by regex, ex: name=^foo (prefix key with - to invert)",
  }),
  "no-header": Flags.boolean({
    exclusive: ["csv"],
    description: "hide table header from output",
  }),
  "no-truncate": Flags.boolean({
    exclusive: ["csv"],
    description: "do not truncate output to fit screen",
  }),
  output: Flags.string({
    exclusive: ["no-truncate", "csv"],
    description: "output in a more machine friendly format",
    options: ["csv", "json", "yaml"],
  }),
  sort: Flags.string({
    description: "property to sort by, comma-separated for multi-key (prepend '-' for descending)",
  }),
});

export const tableFlags = (opts: { only?: TableFlagKey[]; except?: TableFlagKey[] } = {}) => {
  const flags = allFlags();
  const keys = (opts.only ?? (Object.keys(flags) as TableFlagKey[])).filter(
    (k) => !opts.except?.includes(k),
  );
  return Object.fromEntries(keys.map((k) => [k, flags[k]])) as Partial<ReturnType<typeof allFlags>>;
};

type Column = { key: string; header: string; minWidth: number };
type ResolvedColumn<T> = Column & { get: (row: T) => unknown };

const toCell = (value: unknown): string => {
  if (value == null) return "";
  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  return String(value);
};

const csvEscape = (cell: string): string =>
  /[",\n\r]/.test(cell) ? `"${cell.replaceAll('"', '""')}"` : cell;

// Raw keys take precedence over headers on collision.
const buildKeyIndex = <T>(columns: ColumnsConfig<T>): Map<string, string> => {
  const index = new Map<string, string>();
  for (const [key, def] of Object.entries(columns)) {
    index.set(key.toLowerCase(), key);
    const header = (def.header ?? startCase(key)).toLowerCase();
    if (!index.has(header)) index.set(header, key);
  }
  return index;
};

const buildAllColumns = <T>(columns: ColumnsConfig<T>): ResolvedColumn<T>[] =>
  Object.entries(columns).map(([key, def]) => ({
    key,
    header: def.header ?? startCase(key),
    minWidth: def.minWidth ?? 0,
    get: def.get ?? ((row: T) => (row as Record<string, unknown>)[key]),
  }));

const pickDisplayColumns = <T>(
  all: ResolvedColumn<T>[],
  columns: ColumnsConfig<T>,
  flags: TableFlags,
): ResolvedColumn<T>[] => {
  if (flags.columns) {
    const index = buildKeyIndex(columns);
    const seen = new Set<string>();
    return flags.columns
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean)
      .flatMap((input) => {
        const key = index.get(input.toLowerCase());
        if (!key || seen.has(key)) return [];
        seen.add(key);
        const col = all.find((c) => c.key === key);
        return col ? [col] : [];
      });
  }
  return all.filter((c) => flags.extended || !columns[c.key].extended);
};

const project = <T>(data: T[], columns: ResolvedColumn<T>[]): Array<Record<string, string>> =>
  data.map((row) => Object.fromEntries(columns.map((c) => [c.key, toCell(c.get(row))])));

const applyFilter = <T>(
  rows: Array<Record<string, string>>,
  filter: string,
  columns: ColumnsConfig<T>,
): Array<Record<string, string>> => {
  const invalid = () => new Errors.CLIError("Filter flag has an invalid value", { exit: 1 });
  const eq = filter.indexOf("=");
  const rawInput = eq < 0 ? "" : filter.slice(0, eq);
  const pattern = eq < 0 ? "" : filter.slice(eq + 1);
  const negate = rawInput.startsWith("-");
  const input = negate ? rawInput.slice(1) : rawInput;
  const key = input ? buildKeyIndex(columns).get(input.toLowerCase()) : undefined;
  if (!key || !pattern) throw invalid();
  let regex: RegExp;
  try {
    regex = new RegExp(pattern);
  } catch {
    throw invalid();
  }
  return rows.filter((r) => negate !== regex.test(r[key] ?? ""));
};

const applySort = <T>(
  rows: Array<Record<string, string>>,
  sort: string,
  columns: ColumnsConfig<T>,
): Array<Record<string, string>> => {
  const index = buildKeyIndex(columns);
  const sorters = sort.split(",").map((s) => {
    const desc = s.startsWith("-");
    const input = desc ? s.slice(1) : s;
    return { key: index.get(input.toLowerCase()) ?? input, order: desc ? "desc" : "asc" } as const;
  });
  return orderBy(
    rows,
    sorters.map((s) => (r: Record<string, string>) => r[s.key] ?? ""),
    sorters.map((s) => s.order),
  );
};

const formatText = (
  columns: Column[],
  rows: Array<Record<string, string>>,
  flags: TableFlags,
): string => {
  const rowLines = rows.map((row) => {
    const cellLines = columns.map((c) => (row[c.key] ?? "").split("\n"));
    const height = Math.max(...cellLines.map((l) => l.length));
    return Array.from({ length: height }, (_, i) => cellLines.map((l) => l[i] ?? ""));
  });

  const widths = columns.map((c, i) => {
    // minWidth counts the trailing separator; subtract 1 for pad width.
    const fromCells = rowLines.flat().reduce((m, line) => Math.max(m, (line[i] ?? "").length), 0);
    return Math.max(Math.max(0, c.minWidth - 1), c.header.length, fromCells);
  });

  const pad = (cell: string, width: number) =>
    flags["no-truncate"] || cell.length <= width
      ? cell.padEnd(width)
      : `${cell.slice(0, Math.max(0, width - 2))}… `;

  // Scripts parse output by column position; the leading/trailing space margin is load-bearing.
  const line = (cells: string[]) =>
    ` ${cells.map((c, i) => pad(c, widths[i] ?? c.length)).join(" ")} `;

  const out: string[] = [];
  if (!flags["no-header"]) {
    out.push(chalk.bold(line(columns.map((c) => c.header))));
    out.push(chalk.bold(line(widths.map((w) => "─".repeat(w)))));
  }
  for (const physicalRow of rowLines) {
    for (const logicalLine of physicalRow) {
      out.push(line(logicalLine));
    }
  }
  return out.join("\n");
};

const formatCsv = (columns: Column[], rows: Array<Record<string, string>>): string =>
  [
    columns.map((c) => csvEscape(c.header)).join(","),
    ...rows.map((row) => columns.map((c) => csvEscape(row[c.key] ?? "")).join(",")),
  ].join("\n");

const resolveOutput = (flags: TableFlags): "text" | "csv" | "json" | "yaml" => {
  if (flags.output === "json") return "json";
  if (flags.output === "yaml") return "yaml";
  if (flags.output === "csv" || flags.csv) return "csv";
  return "text";
};

export const printTable = <T>(
  data: T[],
  columns: ColumnsConfig<T>,
  flags: TableFlags = {},
): void => {
  // Filter and sort run against every column, then we narrow to the display set — so
  // `--filter label=X --columns id` still matches rows by the hidden `label`.
  const all = buildAllColumns(columns);
  let rows = project(data, all);
  if (flags.filter) rows = applyFilter(rows, flags.filter, columns);
  if (flags.sort) rows = applySort(rows, flags.sort, columns);

  const display = pickDisplayColumns(all, columns, flags);
  const displayRows = rows.map((r) =>
    Object.fromEntries(display.map((c) => [c.key, r[c.key] ?? ""])),
  );

  switch (resolveOutput(flags)) {
    case "json":
      process.stdout.write(`${JSON.stringify(displayRows, null, 2)}\n`);
      return;
    case "yaml":
      process.stdout.write(dumpYaml(displayRows));
      return;
    case "csv":
      process.stdout.write(`${formatCsv(display, displayRows)}\n`);
      return;
    case "text": {
      const text = formatText(display, displayRows, flags);
      if (text) process.stdout.write(`${text}\n`);
      return;
    }
  }
};
