import {
  arg,
  commandInput,
  commandOutput,
  defineCommand,
  option,
  type CommandContext,
} from "../../command.js";
import { readFile } from "node:fs/promises";
import z from "zod";
import { gqlRequest } from "../../graphql.js";
import { dumpYaml } from "../../utils/serialize.js";
import { ux } from "../../utils/ux.js";

const variablesSchema = z.record(z.string(), z.unknown());

const readObjectProperty = (value: unknown, key: string): unknown => {
  if ((typeof value !== "object" && typeof value !== "function") || value === null) {
    return undefined;
  }

  return Reflect.get(value, key);
};

export default defineCommand({
  description: "Execute an arbitrary GraphQL query against the Prismatic API",
  examples: [
    {
      description: "Direct query string",
      command: "<%= config.bin %> <%= command.id %> 'query { customers { nodes { id name } } }'",
    },
    {
      description: "From file",
      command: "<%= config.bin %> <%= command.id %> --file query.graphql",
    },
    {
      description: "From stdin",
      command: "cat query.graphql | <%= config.bin %> <%= command.id %>",
    },
    {
      description: "With variables",
      command:
        '<%= config.bin %> <%= command.id %> --file query.graphql --variables \'{"id":"Q3VzdG9tZXI6..."}\'',
    },
    {
      description: "Variables from file",
      command:
        "<%= config.bin %> <%= command.id %> 'query($id: ID!) { customer(id: $id) { name } }' --variables @vars.json",
    },
    {
      description: "YAML output",
      command:
        "<%= config.bin %> <%= command.id %> 'query { customers { nodes { id name } } }' --output yaml",
    },
    {
      description: "Table output with nested data",
      command:
        "<%= config.bin %> <%= command.id %> 'query { customers { nodes { id name } } }' --output table --data-path customers.nodes --columns id,name",
    },
  ],
  args: {
    query: arg.string({
      description: "GraphQL query string (omit to read from stdin)",
      required: false,
    }),
  },
  options: {
    file: option.boolean({
      char: "f",
      description: "Treat query argument as file path",
      default: false,
    }),
    variables: option.string({
      char: "v",
      description: "JSON string or @file.json containing query variables",
    }),
    output: option.string({
      char: "o",
      description: "Output format",
      options: ["json", "yaml", "table"],
      default: "json",
    }),
    columns: option.string({
      char: "c",
      description: "Comma-separated field paths for table columns (required for table output)",
    }),
    "data-path": option.string({
      char: "d",
      description: "Dot-notation path to array data in result (e.g., 'customers.nodes')",
    }),
    raw: option.boolean({
      char: "r",
      description: "Output raw JSON without pretty-printing",
      default: false,
    }),
  },
  async readStdin(): Promise<string> {
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
  },
  async readVariables(variablesInput: string): Promise<Record<string, unknown>> {
    let parsed: unknown;
    if (variablesInput.startsWith("@")) {
      const filePath = variablesInput.slice(1);
      const fileContent = await readFile(filePath, { encoding: "utf-8" });
      parsed = JSON.parse(fileContent);
    } else {
      parsed = JSON.parse(variablesInput);
    }

    return variablesSchema.parse(parsed);
  },
  getNestedValue(obj: unknown, path: string): unknown {
    return path.split(".").reduce<unknown>(readObjectProperty, obj);
  },
  formatTableOutput(data: unknown, columns: string[]): void {
    const items: unknown[] = Array.isArray(data) ? data : [data];

    const columnDefs: Record<string, { header: string; get: (row: unknown) => string }> = {};
    for (const col of columns) {
      columnDefs[col] = {
        header: col.toUpperCase(),
        get: (row: unknown) => {
          const value = this.getNestedValue(row, col);
          return value !== undefined && value !== null ? String(value) : "";
        },
      };
    }

    ux.table(items, columnDefs);
  },
  async run(_context: CommandContext) {
    const { args, flags } = commandInput();

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
      queryString = await this.readStdin();
    }

    if (!queryString.trim()) {
      commandOutput.error("Query string is empty");
    }

    let variables: Record<string, unknown> | undefined;
    if (flags.variables) {
      try {
        variables = await this.readVariables(flags.variables);
      } catch (error) {
        commandOutput.error(
          `Failed to parse variables: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }

    let result: unknown;
    try {
      result = await gqlRequest<unknown>({
        document: queryString,
        variables,
      });
    } catch (error) {
      commandOutput.error(
        `GraphQL query failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    switch (flags.output) {
      case "yaml":
        commandOutput.log(dumpYaml(result));
        break;

      case "table": {
        if (!flags.columns) {
          commandOutput.error(
            "Table output requires --columns flag. Specify comma-separated field paths.",
          );
        }
        const columns = flags.columns.split(",").map((c: string) => c.trim());
        const data = flags["data-path"] ? this.getNestedValue(result, flags["data-path"]) : result;
        this.formatTableOutput(data, columns);
        break;
      }
      default:
        if (flags.raw) {
          commandOutput.log(JSON.stringify(result));
        } else {
          commandOutput.log(JSON.stringify(result, null, 2));
        }
        break;
    }
  },
});
