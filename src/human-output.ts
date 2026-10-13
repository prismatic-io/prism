import { writeCommandStatus } from "./command.js";
import type { ExecutionEvent } from "./utils/execution-output.js";
import { printTable } from "./utils/table.js";

/** Legacy stdout is consumed by shell scripts; native events remain available with --json. */
export function integrationEventText(event: ExecutionEvent, jsonl?: boolean): string | undefined {
  switch (event.type) {
    case "execution": {
      const response = event.response;
      const hasId = response !== null && typeof response === "object" && "executionId" in response;
      return `${hasId ? "" : `Execution ID: ${event.executionId}\n\n`}${JSON.stringify(response, null, 2)}\n`;
    }
    case "log":
      if (jsonl) return JSON.stringify(event.data);
      printTable(
        [event.data],
        {
          timestamp: {},
          severity: { minWidth: 15, get: (row) => `LOG_${row.severity}` },
          message: {
            get: (row) => (row.sectionName ? `[${row.sectionName}] ${row.message}` : row.message),
          },
        },
        { header: false },
      );
      return;
    case "step-result":
      if (jsonl) return JSON.stringify(event.data);
      printTable(
        [event.data],
        {
          endedAt: {},
          stepName: { minWidth: 15, get: (row) => `STEP_${row.stepName}` },
          result: {},
        },
        { header: false },
      );
      return;
    case "progress":
    case "warning":
      writeCommandStatus(event.message);
      return;
    case "configuration-required":
      writeCommandStatus(`Configure this integration before testing: ${event.url}`);
      return;
    default:
      return;
  }
}

export function instanceEventText(event: ExecutionEvent, columns?: string): undefined {
  if (event.type === "warning" || event.type === "progress") {
    writeCommandStatus(event.message);
    return;
  }
  if (event.type === "log")
    printTable(
      [event.data],
      {
        timestamp: {},
        severity: { minWidth: 12 },
        message: {
          get: (row) => (row.sectionName ? `[${row.sectionName}] ${row.message}` : row.message),
        },
      },
      { header: false, columns },
    );
}
