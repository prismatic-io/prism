#!/usr/bin/env node

import { serve } from "./cli.js";
import { processError } from "./errors.js";

try {
  await serve();
} catch (error) {
  const handled = processError(error);
  if (!("silent" in handled && handled.silent === true)) {
    let message: string;
    if ("humanMessage" in handled && typeof handled.humanMessage === "string") {
      message = handled.humanMessage;
    } else if ("code" in handled && typeof handled.code === "string") {
      message = `    ${handled.name}: ${handled.message}\n    Code: ${handled.code}\n`;
    } else {
      message = ` ›   Error: ${handled.message}\n`;
    }
    process.stderr.write(message);
  }
  process.exitCode =
    "exitCode" in handled && typeof handled.exitCode === "number" ? handled.exitCode : 1;
}
