import { z, Cli } from "incur";
import { writeCommandStatus, writeCommandOutput } from "../../../command.js";
import { fs } from "../../../fs.js";
import { GetStepOutputDetailsDocument as GET_STEP_OUTPUT_DETAILS } from "../../../graphql/operations/getStepOutputDetails.generated.js";
import { gqlRequest } from "../../../graphql.js";
import { warningsOutput } from "../../../output.js";
import {
  type DeserializeResult,
  deserialize,
  parseData,
} from "../../../utils/execution/stepResults.js";
import { fetch } from "../../../utils/http.js";
export default Cli.command({
  output: z.union([
    z.object({
      executionId: z.string(),
      stepName: z.string(),
      found: z.literal(false),
      ...warningsOutput,
    }),
    z.object({
      executionId: z.string(),
      stepName: z.string(),
      found: z.literal(true),
      contentType: z.string(),
      path: z.string(),
      ...warningsOutput,
    }),
    z.object({
      executionId: z.string(),
      stepName: z.string(),
      found: z.literal(true),
      contentType: z.string(),
      result: z.json(),
      encoding: z.literal("base64").optional(),
      ...warningsOutput,
    }),
  ]),
  description:
    "Gets the Result of a specified Step in an Instance Execution.\nThis command can be used to pull down step results for both integration tests and instance executions.",
  examples: [
    { description: "Run a test of a flow to get an execution ID:" },
    {
      description: "Get step results from a specific execution:",
      options: {
        executionId:
          "SW5zdGFuY2VFeGVjdXRpb25SZXN1bHQ6MWFkZTYwMGQtMjg2Ni00ZTljLWI2N2EtYmUxNzgwOWY4ODI4",
        stepName: "Fetch Invoice Info",
      },
    },
  ],
  options: z.object({
    executionId: z.string().describe("ID of an Execution"),
    stepName: z.string().describe("Name of an Integration Step"),
    outputPath: z
      .string()
      .optional()
      .describe("Output result to a file. Output will be printed to stdout if this is omitted"),
  }),
  async run(context) {
    const { options: flags } = context;
    const { executionId, stepName, outputPath } = flags;

    const result = await gqlRequest({
      document: GET_STEP_OUTPUT_DETAILS,
      variables: {
        executionId: executionId,
        stepName: stepName,
      },
    });

    const stepResult = result.executionResult?.stepResults.nodes?.[0];

    if (stepResult?.resultsUrl) {
      const response = await fetch(stepResult.resultsUrl);
      const arrayBuffer = await response.arrayBuffer();
      const resultsBuffer = Buffer.from(arrayBuffer);
      const { data: deserializedResult, contentType } = deserialize(
        resultsBuffer,
      ) as DeserializeResult;

      const output = parseData(deserializedResult as string, contentType);
      const outputStr =
        typeof output === "string" || Buffer.isBuffer(output) ? output : JSON.stringify(output);

      if (outputPath) {
        await fs.writeFile(outputPath, outputStr);
        return {
          executionId,
          stepName,
          found: true as const,
          contentType,
          path: outputPath,
        };
      } else {
        writeCommandStatus(String(outputStr));
        return {
          executionId,
          stepName,
          found: true as const,
          contentType,
          result: Buffer.isBuffer(output) ? output.toString("base64") : output,
          ...(Buffer.isBuffer(output) ? { encoding: "base64" as const } : {}),
        };
      }
    } else {
      writeCommandOutput("No step results found. Did you enter the correct step name?", "stderr");
      return { executionId, stepName, found: false as const };
    }
  },
  alias: { outputPath: "p", stepName: "s", executionId: "e" },
});
