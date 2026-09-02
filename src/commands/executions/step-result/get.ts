import {
  commandInput,
  commandOutput,
  defineCommand,
  option,
  type CommandContext,
} from "../../../command.js";
import { fs } from "../../../fs.js";
import { gql, gqlRequest } from "../../../graphql.js";
import {
  type DeserializeResult,
  deserialize,
  parseData,
} from "../../../utils/execution/stepResults.js";
import { fetch } from "../../../utils/http.js";

export default defineCommand({
  description:
    "Gets the Result of a specified Step in an Instance Execution.\nThis command can be used to pull down step results for both integration tests and instance executions.",
  examples: [
    {
      description: "Run a test of a flow to get an execution ID:",
      // biome-ignore lint/suspicious/noTemplateCurlyInString: TODO
      command: "prism integrations:flows:test ${FLOW_ID}",
    },
    {
      description: "Get step results from a specific execution:",
      command:
        '<%= config.bin %> <%= command.id %> --executionId SW5zdGFuY2VFeGVjdXRpb25SZXN1bHQ6MWFkZTYwMGQtMjg2Ni00ZTljLWI2N2EtYmUxNzgwOWY4ODI4 --stepName "Fetch Invoice Info"',
    },
  ],
  options: {
    executionId: option.string({
      char: "e",
      required: true,
      description: "ID of an Execution",
    }),
    stepName: option.string({
      char: "s",
      required: true,
      description: "Name of an Integration Step",
    }),
    outputPath: option.string({
      char: "p",
      required: false,
      description: "Output result to a file. Output will be printed to stdout if this is omitted",
    }),
  },
  async run(_context: CommandContext) {
    const { flags } = commandInput();
    const { executionId, stepName, outputPath } = flags;

    const result = await gqlRequest({
      document: gql`
        query getStepOutputDetails($executionId: ID!, $stepName: String!) {
          executionResult(id: $executionId) {
            id
            stepResults(displayStepName: $stepName) {
              nodes {
                displayStepName
                resultsUrl
              }
            }
          }
        }
      `,
      variables: {
        executionId: executionId,
        stepName: stepName,
      },
    });

    const stepResult = result?.executionResult?.stepResults.nodes?.[0];

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
      } else {
        commandOutput.log(outputStr);
      }
    } else {
      commandOutput.stderr("No step results found. Did you enter the correct step name?");
    }
  },
});
