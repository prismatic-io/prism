import { Errors, Flags } from "@oclif/core";
import { startCase } from "lodash-es";
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

// Order matches cli-ux's ux.table.flags() so oclif.manifest.json stays byte-stable. Don't reorder.
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
    description: "filter property by partial string matching, ex: name=foo",
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
    description: "property to sort by (prepend '-' for descending)",
  }),
});

export const tableFlags = (opts: { only?: TableFlagKey[]; except?: TableFlagKey[] } = {}) => {
  const flags = allFlags();
  const keys = (opts.only ?? (Object.keys(flags) as TableFlagKey[])).filter(
    (k) => !opts.except?.includes(k),
  );
  return Object.fromEntries(keys.map((k) => [k, flags[k]])) as Partial<ReturnType<typeof allFlags>>;
};

// Display-only view of a column — what format functions need.
type Column = { key: string; header: string; minWidth: number };

// Adds the value accessor used by `project` to resolve each cell from its source row.
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

// RFC 4180 per-cell quoting. (cli-ux quoted whole rows; we don't — any parser handles this.)
const csvEscape = (cell: string): string =>
  /[",\n\r]/.test(cell) ? `"${cell.replaceAll('"', '""')}"` : cell;

const resolveColumns = <T>(columns: ColumnsConfig<T>, flags: TableFlags): ResolvedColumn<T>[] => {
  const entries = Object.entries(columns) as Array<[string, ColumnDef<T>]>;
  const picked = flags.columns
    ? flags.columns
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean)
        .flatMap((key) => {
          const def = columns[key];
          return def ? [[key, def] as [string, ColumnDef<T>]] : [];
        })
    : entries.filter(([, def]) => flags.extended || !def.extended);
  return picked.map(([key, def]) => ({
    key,
    header: def.header ?? startCase(key),
    minWidth: def.minWidth ?? 0,
    get: def.get ?? ((row: T) => (row as Record<string, unknown>)[key]),
  }));
};

const project = <T>(data: T[], columns: ResolvedColumn<T>[]): Array<Record<string, string>> =>
  data.map((row) => Object.fromEntries(columns.map((c) => [c.key, toCell(c.get(row))])));

// cli-ux contract: `key=needle`, case-sensitive substring match. `key` must be a declared
// column (whitespace-free, non-empty) and `needle` must be non-empty — otherwise hard-error
// so scripts relying on exit code 2 keep working.
const applyFilter = (rows: Array<Record<string, string>>, filter: string, validKeys: string[]) => {
  const eq = filter.indexOf("=");
  const key = eq < 0 ? "" : filter.slice(0, eq);
  const needle = eq < 0 ? "" : filter.slice(eq + 1);
  if (!key || !needle || /\s/.test(key) || !validKeys.includes(key)) {
    throw new Errors.CLIError("Filter flag has an invalid value", { exit: 1 });
  }
  return rows.filter((r) => (r[key] ?? "").includes(needle));
};

const applySort = (rows: Array<Record<string, string>>, sort: string) => {
  const desc = sort.startsWith("-");
  const key = desc ? sort.slice(1) : sort;
  const direction = desc ? -1 : 1;
  return [...rows].sort((a, b) => direction * (a[key] ?? "").localeCompare(b[key] ?? ""));
};

const formatText = (
  columns: Column[],
  rows: Array<Record<string, string>>,
  flags: TableFlags,
): string => {
  // Cells with embedded \n expand into continuation rows (other columns blank).
  const rowLines = rows.map((row) => {
    const cellLines = columns.map((c) => (row[c.key] ?? "").split("\n"));
    const height = Math.max(...cellLines.map((l) => l.length));
    return Array.from({ length: height }, (_, i) => cellLines.map((l) => l[i] ?? ""));
  });

  const widths = columns.map((c, i) => {
    // cli-ux's minWidth includes the trailing separator, so text is padded to minWidth - 1.
    const fromCells = rowLines.flat().reduce((m, line) => Math.max(m, (line[i] ?? "").length), 0);
    return Math.max(Math.max(0, c.minWidth - 1), c.header.length, fromCells);
  });

  const pad = (cell: string, width: number) =>
    flags["no-truncate"] || cell.length <= width
      ? cell.padEnd(width)
      : `${cell.slice(0, Math.max(0, width - 1))}…`;

  // Leading + trailing space margin matches cli-ux; scripts parsing by column position depend on it.
  const line = (cells: string[]) =>
    ` ${cells.map((c, i) => pad(c, widths[i] ?? c.length)).join(" ")} `;

  const out: string[] = [];
  if (!flags["no-header"]) {
    out.push(line(columns.map((c) => c.header)));
    out.push(line(widths.map((w) => "─".repeat(w))));
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
  const resolved = resolveColumns(columns, flags);
  let rows = project(data, resolved);
  if (flags.filter) rows = applyFilter(rows, flags.filter, Object.keys(columns));
  if (flags.sort) rows = applySort(rows, flags.sort);

  switch (resolveOutput(flags)) {
    case "json":
      process.stdout.write(`${JSON.stringify(rows, null, 2)}\n`);
      return;
    case "yaml":
      process.stdout.write(dumpYaml(rows));
      return;
    case "csv":
      process.stdout.write(`${formatCsv(resolved, rows)}\n`);
      return;
    case "text": {
      const text = formatText(resolved, rows, flags);
      if (text) process.stdout.write(`${text}\n`);
      return;
    }
  }
};
