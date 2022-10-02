import { fs } from "../../../fs";
import { Command, Flags } from "@oclif/core";
import { gql, gqlRequest } from "../../../graphql";
import axios from "axios";
import { decode } from "@msgpack/msgpack";
import { extension } from "mime-types";

interface DeserializeResult {
  data: unknown;
  contentType: string;
}

const deserialize = (data: Buffer): DeserializeResult | unknown => decode(data);

export const parseData = (data: string, contentType = ""): string => {
  if (data === null || data === undefined) {
    return "";
  }
  // Some content-types require additional processing.
  const dataType = extension(contentType);
  if (
    contentType.startsWith("text/") ||
    (dataType && ["json", "xml", "csv", "xhtml"].includes(dataType))
  ) {
    // If the content-types specifies that the data is text/, or if the extension
    // is a well-known text-like type, convert the data to a string.
    if (dataType === "json") {
      try {
        // If the payload is supposed to be JSON, ensure that it can be parsed.
        return JSON.parse(data.toString());
      } catch {
        throw new Error("Received malformed JSON payload.");
      }
    }
    return data;
  } else if (contentType.startsWith("binary/")) {
    return data;
  }
  return JSON.stringify(data);
};

export default class GetCommand extends Command {
  static description =
    "Gets the Result of a specified Step in an Instance Execution";
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
      description:
        "Output result to a file. Output will be printed to stdout if this is omitted",
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
        resultsBuffer
      ) as DeserializeResult;

      const output = parseData(deserializedResult as string, contentType);

      if (outputPath) {
        await fs.writeFile(outputPath, output);
      } else {
        console.log(output);
      }
    } else {
      console.error(
        "No step results found. Did you enter the correct step name?"
      );
    }
  }
}
