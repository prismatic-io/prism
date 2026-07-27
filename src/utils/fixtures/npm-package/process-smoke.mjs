import { writeFileSync } from "node:fs";

if (process.argv[2] === "--fail") {
  process.exit(19);
}

writeFileSync(
  process.env.PRISM_PROCESS_TEST_OUTPUT,
  JSON.stringify({
    argument: process.argv[2],
    environment: process.env.PRISM_PROCESS_TEST_ENV,
  }),
);
