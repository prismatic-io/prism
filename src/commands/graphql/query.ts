import { Args, Flags } from "@oclif/core";
import { readFileSync } from "fs";
import { PrismaticBaseCommand } from "../../baseCommand.js";
import { gqlRequest } from "../../graphql.js";
import { dumpYaml } from "../../utils/serialize.js";

export default class QueryCommand extends PrismaticBaseCommand {
  static description = "Execute an arbitrary GraphQL query against the Prismatic API";

  static examples = [
    "# Direct query string",
    "<%= config.bin %> <%= command.id %> 'query { customers { nodes { id name } } }'",
    "",
    "# From file",
    "<%= config.bin %> <%= command.id %> --file query.graphql",
    "",
    "# From stdin",
    "cat query.graphql | <%= config.bin %> <%= command.id %>",
    "",
    "# With variables",
    '<%= config.bin %> <%= command.id %> --file query.graphql --variables \'{"id":"Q3VzdG9tZXI6..."}\'',
    "",
    "# Variables from file",
    "<%= config.bin %> <%= command.id %> 'query($id: ID!) { customer(id: $id) { name } }' --variables @vars.json",
    "",
    "# YAML output",
    "<%= config.bin %> <%= command.id %> 'query { customers { nodes { id name } } }' --output yaml",
    "",
    "# Table output with nested data",
    "<%= config.bin %> <%= command.id %> 'query { customers { nodes { id name email } } }' --output table --data-path customers.nodes --columns id,name,email",
  ];

  static args = {
    query: Args.string({
      description: "GraphQL query string (omit to read from stdin)",
      required: false,
    }),
  };

  static flags = {
    file: Flags.boolean({
      char: "f",
      description: "Treat query argument as file path",
      default: false,
    }),
    variables: Flags.string({
      char: "v",
      description: "JSON string or @file.json containing query variables",
    }),
    output: Flags.string({
      char: "o",
      description: "Output format",
      options: ["json", "yaml", "table"],
      default: "json",
    }),
    columns: Flags.string({
      char: "c",
      description: "Comma-separated field paths for table columns (required for table output)",
    }),
    "data-path": Flags.string({
      char: "d",
      description: "Dot-notation path to array data in result (e.g., 'customers.nodes')",
    }),
    raw: Flags.boolean({
      char: "r",
      description: "Output raw JSON without pretty-printing",
      default: false,
    }),
  };

  private async readStdin(): Promise<string> {
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

  private readVariables(variablesInput: string): Record<string, any> {
    if (variablesInput.startsWith("@")) {
      const filePath = variablesInput.slice(1);
      const fileContent = readFileSync(filePath, { encoding: "utf-8" });
      return JSON.parse(fileContent);
    }

    return JSON.parse(variablesInput);
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split(".").reduce((current, key) => current?.[key], obj);
  }

  private formatTableOutput(data: any, columns: string[]): void {
    const items = Array.isArray(data) ? data : [data];

    const columnDefs: Record<string, any> = {};
    for (const col of columns) {
      columnDefs[col] = {
        header: col.toUpperCase(),
        get: (row: any) => {
          const value = this.getNestedValue(row, col);
          return value !== undefined && value !== null ? String(value) : "";
        },
      };
    }

    const { ux } = require("@oclif/core");
    ux.table(items, columnDefs);
  }

  async run() {
    const { args, flags } = await this.parse(QueryCommand);

    let queryString: string;

    if (flags.file && args.query) {
      queryString = readFileSync(args.query, { encoding: "utf-8" });
    } else if (args.query) {
      queryString = args.query;
    } else {
      if (process.stdin.isTTY) {
        this.error(
          "No query provided. Please provide a query as an argument, use --file, or pipe via stdin.",
        );
      }
      queryString = await this.readStdin();
    }

    if (!queryString.trim()) {
      this.error("Query string is empty");
    }

    let variables: Record<string, any> | undefined;
    if (flags.variables) {
      try {
        variables = this.readVariables(flags.variables);
      } catch (error) {
        this.error(
          `Failed to parse variables: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }

    let result: any;
    try {
      result = await gqlRequest({
        document: queryString,
        variables,
      });
    } catch (error) {
      this.error(`GraphQL query failed: ${error instanceof Error ? error.message : String(error)}`);
    }

    switch (flags.output) {
      case "yaml":
        this.log(dumpYaml(result));
        break;

      case "table": {
        if (!flags.columns) {
          this.error("Table output requires --columns flag. Specify comma-separated field paths.");
        }
        const columns = flags.columns.split(",").map((c) => c.trim());
        const data = flags["data-path"] ? this.getNestedValue(result, flags["data-path"]) : result;
        this.formatTableOutput(data, columns);
        break;
      }
      default:
        if (flags.raw) {
          this.log(JSON.stringify(result));
        } else {
          this.log(JSON.stringify(result, null, 2));
        }
        break;
    }
  }
}
