#!/usr/bin/env node

import { run, flush, handle, settings } from "@oclif/core";
import { processError } from "./errors.js";

try {
  settings.enableAutoTranspile = false;
  await run(process.argv.slice(2), import.meta.url);
  await flush();
} catch (error) {
  await handle(processError(error));
}
