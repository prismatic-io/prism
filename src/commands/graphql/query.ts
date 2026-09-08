import { readFile } from "node:fs/promises";
import { Kind, parse } from "graphql";
import {
  assertMutationAllowed,
  assertCommandStdinAvailable,
  commandOutput,
  writeCommandOutput,
  defineCommand,
  argsSchema,
  optionsSchema,
} from "../../command.js";
import { gqlRequest } from "../../graphql.js";
import { dumpYaml } from "../../utils/serialize.js";
import { ux } from "../../utils/ux.js";
import { z } from "incur";

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

  return ux.table(items, columnDefs);
}

export default defineCommand({
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
  args: argsSchema(
    z.object({
      query: z.string().optional().describe("GraphQL query string (omit to read from stdin)"),
    }),
  ),
  options: optionsSchema(
    z.object({
      file: z
        .boolean()
        .default(false)
        .describe("Treat query argument as file path")
        .meta({ cli: { char: "f" } }),
      variables: z
        .string()
        .optional()
        .describe("JSON string or @file.json containing query variables")
        .meta({ cli: { char: "v" } }),
      output: z
        .enum(["json", "yaml", "table"])
        .default("json")
        .describe("Output format")
        .meta({ cli: { char: "o" } }),
      columns: z
        .string()
        .optional()
        .describe("Comma-separated field paths for table columns (required for table output)")
        .meta({ cli: { char: "c" } }),
      "data-path": z
        .string()
        .optional()
        .describe("Dot-notation path to array data in result (e.g., 'customers.nodes')")
        .meta({ cli: { char: "d" } }),
      raw: z
        .boolean()
        .default(false)
        .describe("Output raw JSON without pretty-printing")
        .meta({ cli: { char: "r" } }),
    }),
  ),
  async run(context) {
    const { args, options: flags } = context;

    let queryString: string;

    if (flags.file && args.query) {
      queryString = await readFile(args.query, { encoding: "utf-8" });
    } else if (args.query) {
      queryString = args.query;
    } else {
      if (process.stdin.isTTY) {
        commandOutput.error(
          "No query provided. Please provide a query as an argument, use --file, or pipe via stdin.",
        );
      }
      queryString = await readStdin();
    }

    if (!queryString.trim()) {
      commandOutput.error("Query string is empty");
    }

    let mutates = false;
    try {
      mutates = hasMutationOperation(queryString);
    } catch (error) {
      commandOutput.error(
        `Invalid GraphQL document: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
    if (mutates) assertMutationAllowed(context);

    let variables: Record<string, unknown> | undefined;
    if (flags.variables) {
      try {
        variables = await readVariables(flags.variables);
      } catch (error) {
        commandOutput.error(
          `Failed to parse variables: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }

    let result: unknown;
    try {
      result = await gqlRequest({
        document: queryString,
        variables,
      });
    } catch (error) {
      commandOutput.error(
        `GraphQL query failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    if (context.agent && flags.output !== "table")
      return { success: true as const, data: z.json().parse(result) };

    switch (flags.output) {
      case "yaml":
        writeCommandOutput(dumpYaml(result));
        break;

      case "table": {
        if (!flags.columns) {
          commandOutput.error(
            "Table output requires --columns flag. Specify comma-separated field paths.",
          );
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
});
