import { writeFile } from "node:fs/promises";

if (process.argv[2] === "--fail") {
  process.exit(19);
}

await writeFile(
  process.env.PRISM_PROCESS_TEST_OUTPUT,
  JSON.stringify({
    argument: process.argv[2],
    environment: process.env.PRISM_PROCESS_TEST_ENV,
  }),
);
