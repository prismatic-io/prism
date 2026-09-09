import { readFile } from "node:fs/promises";
import { Kind, parse } from "graphql";
import {
  assertMutationAllowed,
  assertCommandStdinAvailable,
  writeCommandOutput,
} from "../../command.js";
import { gqlRequest } from "../../graphql.js";
import { dumpYaml } from "../../utils/serialize.js";
import { z, Cli, Errors } from "incur";
import { printTable } from "../../utils/table.js";

const variablesSchema = z.record(z.string(), z.unknown());

export const hasMutationOperation = (document: string): boolean =>
  parse(document).definitions.some(
    (definition) =>
      definition.kind === Kind.OPERATION_DEFINITION && definition.operation === "mutation",
  );

const readObjectProperty = (value: unknown, key: string): unknown => {
  if ((typeof value !== "object" && typeof value !== "function") || value === null) {
    return undefined;
  }

  return Reflect.get(value, key);
};
async function readStdin(): Promise<string> {
  assertCommandStdinAvailable();
  return new Promise((resolve, reject) => {
    let data = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => {
      data += chunk;
    });
    process.stdin.on("end", () => {
      resolve(data.trim());
    });
    process.stdin.on("error", reject);
  });
}

async function readVariables(variablesInput: string): Promise<Record<string, unknown>> {
  let parsed: unknown;
  if (variablesInput.startsWith("@")) {
    const filePath = variablesInput.slice(1);
    const fileContent = await readFile(filePath, { encoding: "utf-8" });
    parsed = JSON.parse(fileContent);
  } else {
    parsed = JSON.parse(variablesInput);
  }

  return variablesSchema.parse(parsed);
}

function getNestedValue(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>(readObjectProperty, obj);
}

function formatTableOutput(data: unknown, columns: string[]) {
  const items: unknown[] = Array.isArray(data) ? data : [data];

  const columnDefs: Record<string, { header: string; get: (row: unknown) => string }> = {};
  for (const col of columns) {
    columnDefs[col] = {
      header: col.toUpperCase(),
      get: (row: unknown) => {
        const value = getNestedValue(row, col);
        return value !== undefined && value !== null ? String(value) : "";
      },
    };
  }

  return printTable(items, columnDefs);
}

export default Cli.command({
  outputPolicy: "agent-only",
  destructive: true,
  output: z.object({
    success: z.literal(true),
    data: z.json(),
    warnings: z.array(z.string()).optional(),
  }),
  description: "Execute an arbitrary GraphQL query against the Prismatic API",
  examples: [
    {
      description: "Direct query string",
      args: { query: "query { customers { nodes { id name } } }" },
    },
    { description: "From file", args: { query: "query.graphql" }, options: { file: true } },
    { description: "From stdin", args: { query: "cat" } },
    {
      description: "With variables",
      args: { query: "query.graphql" },
      options: { file: true, variables: '{"id":"Q3VzdG9tZXI6..."}' },
    },
    {
      description: "Variables from file",
      args: { query: "query($id: ID!) { customer(id: $id) { name } }" },
      options: { variables: "@vars.json" },
    },
    {
      description: "YAML output",
      args: { query: "query { customers { nodes { id name } } }" },
      options: { output: "yaml" },
    },
    {
      description: "Table output with nested data",
      args: { query: "query { customers { nodes { id name } } }" },
      options: { output: "table", "data-path": "customers.nodes", columns: "id,name" },
    },
  ],
  args: z.object({
    query: z.string().optional().describe("GraphQL query string (omit to read from stdin)"),
  }),
  options: z.object({
    file: z.boolean().default(false).describe("Treat query argument as file path"),
    variables: z
      .string()
      .optional()
      .describe("JSON string or @file.json containing query variables"),
    output: z.enum(["json", "yaml", "table"]).default("json").describe("Output format"),
    columns: z
      .string()
      .optional()
      .describe("Comma-separated field paths for table columns (required for table output)"),
    "data-path": z
      .string()
      .optional()
      .describe("Dot-notation path to array data in result (e.g., 'customers.nodes')"),
    raw: z.boolean().default(false).describe("Output raw JSON without pretty-printing"),
  }),
  async run(context) {
    const { args, options: flags } = context;

    let queryString: string;

    if (flags.file && args.query) {
      queryString = await readFile(args.query, { encoding: "utf-8" });
    } else if (args.query) {
      queryString = args.query;
    } else {
      if (process.stdin.isTTY) {
        throw new Errors.IncurError({
          code: "VALIDATION_ERROR",
          message:
            "No query provided. Please provide a query as an argument, use --file, or pipe via stdin.",
          exitCode: 2,
        });
      }
      queryString = await readStdin();
    }

    if (!queryString.trim()) {
      throw new Errors.IncurError({
        code: "VALIDATION_ERROR",
        message: "Query string is empty",
        exitCode: 2,
      });
    }

    let mutates = false;
    try {
      mutates = hasMutationOperation(queryString);
    } catch (error) {
      throw new Errors.IncurError({
        code: "VALIDATION_ERROR",
        message: `Invalid GraphQL document: ${error instanceof Error ? error.message : String(error)}`,
        exitCode: 2,
      });
    }
    if (mutates) assertMutationAllowed(context);

    let variables: Record<string, unknown> | undefined;
    if (flags.variables) {
      try {
        variables = await readVariables(flags.variables);
      } catch (error) {
        throw new Errors.IncurError({
          code: "VALIDATION_ERROR",
          message: `Failed to parse variables: ${error instanceof Error ? error.message : String(error)}`,
          exitCode: 2,
        });
      }
    }

    let result: unknown;
    try {
      result = await gqlRequest({
        document: queryString,
        variables,
      });
    } catch (error) {
      throw new Errors.IncurError({
        code: "VALIDATION_ERROR",
        message: `GraphQL query failed: ${error instanceof Error ? error.message : String(error)}`,
        exitCode: 2,
      });
    }

    if (context.agent && flags.output !== "table")
      return { success: true as const, data: z.json().parse(result) };

    switch (flags.output) {
      case "yaml":
        writeCommandOutput(dumpYaml(result));
        break;

      case "table": {
        if (!flags.columns) {
          throw new Errors.IncurError({
            code: "VALIDATION_ERROR",
            message: "Table output requires --columns flag. Specify comma-separated field paths.",
            exitCode: 2,
          });
        }
        const columns = flags.columns.split(",").map((c: string) => c.trim());
        const data = flags["data-path"] ? getNestedValue(result, flags["data-path"]) : result;
        const table = formatTableOutput(data, columns);
        if (context.agent) return { success: true as const, data: z.json().parse(table) };
        break;
      }
      default:
        if (flags.raw) {
          writeCommandOutput(JSON.stringify(result));
        } else {
          writeCommandOutput(JSON.stringify(result, null, 2));
        }
        break;
    }
    return { success: true as const, data: z.json().parse(result) };
  },
  alias: { raw: "r", "data-path": "d", columns: "c", output: "o", variables: "v", file: "f" },
});
