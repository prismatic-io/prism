import { fs } from "../../../fs.js";
import { Command, Flags } from "@oclif/core";
import { gql, gqlRequest } from "../../../graphql.js";
import axios from "axios";
import { deserialize, DeserializeResult, parseData } from "../../../utils/execution/stepResults.js";

export default class GetCommand extends Command {
  static description = "Gets the Result of a specified Step in an Instance Execution";
  static flags = {
    executionId: Flags.string({
      char: "e",
      required: true,
      description: "ID of an Execution",
    }),
    stepName: Flags.string({
      char: "s",
      required: true,
      description: "Name of an Integration Step",
    }),
    outputPath: Flags.string({
      char: "p",
      required: false,
      description: "Output result to a file. Output will be printed to stdout if this is omitted",
    }),
  };

  async run() {
    const { flags } = await this.parse(GetCommand);
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
      const response = await axios.get(stepResult.resultsUrl, {
        responseType: "arraybuffer",
      });
      const resultsBuffer = Buffer.from(await response.data);
      const { data: deserializedResult, contentType } = deserialize(
        resultsBuffer,
      ) as DeserializeResult;

      const output = parseData(deserializedResult as string, contentType);

      if (outputPath) {
        await fs.writeFile(outputPath, output);
      } else {
        console.log(output);
      }
    } else {
      console.error("No step results found. Did you enter the correct step name?");
    }
  }
}
