// Stable Prism table rendering, preserving the historic output format and the
// case-insensitive key-or-header lookup used by --filter, --columns, and --sort.

import chalk from "chalk";
import { z } from "incur";
import { startCase } from "lodash-es";
import { orderBy } from "natural-orderby";
import { dumpYaml } from "./serialize.js";
import { isAgentExecution, writeCommandOutput } from "../command.js";

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
  header?: boolean;
  truncate?: boolean;
};

export type PaginationFlags = {
  after?: string;
  all?: boolean;
  first?: number;
};

export const paginationFlags = () => ({
  after: z.string().optional().describe("Resume listing after this API cursor"),
  all: z.boolean().optional().describe("Fetch every page instead of returning one resumable page"),
  first: z.coerce
    .number()
    .int()
    .min(1)
    .optional()
    .describe("Maximum number of records to request per API page"),
});

const nativeFieldSchemas = {
  public: z.boolean(),
  enabled: z.boolean(),
  triggered: z.boolean(),
  imported: z.boolean(),
  available: z.boolean(),
  isDefault: z.boolean(),
  versionNumber: z.number().int(),
  labels: z.array(z.string()),
  headers: z.json(),
  details: z.json(),
  value: z.json(),
  defaultValue: z.json(),
};

type TableField<K extends string> = K extends keyof typeof nativeFieldSchemas
  ? (typeof nativeFieldSchemas)[K]
  : z.ZodString;
type TableShape<T extends readonly string[]> = {
  [K in T[number]]: z.ZodOptional<z.ZodNullable<TableField<K>>>;
};
export function tableOutputSchema<
  const T extends readonly string[],
  const P extends boolean = false,
>(fields: T, paginated: P = false as P) {
  const row = Object.fromEntries(
    fields.map((name) => {
      const field = Object.hasOwn(nativeFieldSchemas, name)
        ? nativeFieldSchemas[name as keyof typeof nativeFieldSchemas]
        : z.string();
      return [name, field.nullable().optional()];
    }),
  ) as TableShape<T>;
  const base = z.object({ items: z.array(z.object(row)) });
  const page = base.extend({
    pageInfo: z.object({
      hasNextPage: z.boolean(),
      endCursor: z.string().nullable().optional(),
    }),
  });
  return (paginated ? page : base) as P extends true ? typeof page : typeof base;
}

// Flag order is part of the public CLI contract; don't reorder.
const allFlags = () => ({
  columns: z
    .string()
    .optional()
    .describe("only show provided columns (comma-separated)")
    .meta({ cli: { exclusive: ["extended"] } }),
  csv: z
    .boolean()
    .optional()
    .describe("output is csv format [alias: --output=csv]")
    .meta({ cli: { exclusive: ["no-truncate"] } }),
  extended: z
    .boolean()
    .optional()
    .describe("show extra columns")
    .meta({ cli: { char: "x", exclusive: ["columns"] } }),
  filter: z
    .string()
    .optional()
    .describe("filter property by regex, ex: name=^foo (prefix key with - to invert)"),
  header: z
    .boolean()
    .optional()
    .describe("show table headers (use --no-header to hide them)")
    .meta({ cli: { legacyName: "no-header", exclusive: ["csv"] } }),
  truncate: z
    .boolean()
    .optional()
    .describe("truncate output to fit the screen (use --no-truncate for full values)")
    .meta({ cli: { legacyName: "no-truncate", exclusive: ["csv"] } }),
  output: z
    .enum(["csv", "json", "yaml"])
    .optional()
    .describe("output in a more machine friendly format")
    .meta({ cli: { exclusive: ["no-truncate", "csv"] } }),
  sort: z
    .string()
    .optional()
    .describe("property to sort by, comma-separated for multi-key (prepend '-' for descending)"),
});

export const tableFlags = (opts: { only?: TableFlagKey[]; except?: TableFlagKey[] } = {}) => {
  const flags = allFlags();
  const keys = (
    opts.only ??
    (Object.keys(flags).map((k) =>
      k === "header" ? "no-header" : k === "truncate" ? "no-truncate" : k,
    ) as TableFlagKey[])
  ).filter((k) => !opts.except?.includes(k));
  return Object.fromEntries(
    keys.map((k) => {
      const key = k === "no-header" ? "header" : k === "no-truncate" ? "truncate" : k;
      return [key, flags[key]];
    }),
  ) as ReturnType<typeof allFlags>;
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

const project = <T>(data: T[], columns: ResolvedColumn<T>[]): Array<Record<string, unknown>> =>
  data.map((row) => Object.fromEntries(columns.map((c) => [c.key, c.get(row) ?? null])));

const applyFilter = <T>(
  rows: Array<Record<string, unknown>>,
  filter: string,
  columns: ColumnsConfig<T>,
): Array<Record<string, unknown>> => {
  const invalid = () => new Error("Filter flag has an invalid value");
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
  return rows.filter((r) => negate !== regex.test(toCell(r[key])));
};

const applySort = <T>(
  rows: Array<Record<string, unknown>>,
  sort: string,
  columns: ColumnsConfig<T>,
): Array<Record<string, unknown>> => {
  const index = buildKeyIndex(columns);
  const sorters = sort.split(",").map((s) => {
    const desc = s.startsWith("-");
    const input = desc ? s.slice(1) : s;
    return { key: index.get(input.toLowerCase()) ?? input, order: desc ? "desc" : "asc" } as const;
  });
  return orderBy(
    rows,
    sorters.map((s) => (r: Record<string, unknown>) => toCell(r[s.key])),
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
    flags.truncate === false || cell.length <= width
      ? cell.padEnd(width)
      : `${cell.slice(0, Math.max(0, width - 2))}… `;

  // Scripts parse output by column position; the leading/trailing space margin is load-bearing.
  const line = (cells: string[]) =>
    ` ${cells.map((c, i) => pad(c, widths[i] ?? c.length)).join(" ")} `;

  const out: string[] = [];
  if (flags.header !== false) {
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
): { items: Array<Record<string, unknown>> } => {
  // Filter and sort run against every column, then we narrow to the display set — so
  // `--filter label=X --columns id` still matches rows by the hidden `label`.
  const all = buildAllColumns(columns);
  let rows = project(data, all);
  if (flags.filter) rows = applyFilter(rows, flags.filter, columns);
  if (flags.sort) rows = applySort(rows, flags.sort, columns);

  const display = pickDisplayColumns(all, columns, {
    ...flags,
    extended: isAgentExecution() || flags.extended,
  });
  const displayRows = rows.map((r) =>
    Object.fromEntries(display.map((c) => [c.key, r[c.key] ?? null])),
  );

  if (isAgentExecution()) return { items: displayRows };
  const renderedRows = displayRows.map((row) =>
    Object.fromEntries(Object.entries(row).map(([key, value]) => [key, toCell(value)])),
  );

  switch (resolveOutput(flags)) {
    case "json":
      writeCommandOutput(JSON.stringify(renderedRows, null, 2));
      return { items: displayRows };
    case "yaml":
      writeCommandOutput(dumpYaml(renderedRows));
      return { items: displayRows };
    case "csv":
      writeCommandOutput(formatCsv(display, renderedRows));
      return { items: displayRows };
    case "text": {
      const text = formatText(display, renderedRows, flags);
      if (text) writeCommandOutput(text);
      return { items: displayRows };
    }
  }
};
