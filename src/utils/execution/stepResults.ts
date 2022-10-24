import { decode } from "@msgpack/msgpack";
import axios from "axios";
import { fs } from "../../fs";
import { gql, gqlRequest } from "../../graphql";
import { extension } from "mime-types";

export interface DeserializeResult {
  data: unknown;
  contentType: string;
}

export const deserialize = (data: Buffer): DeserializeResult | unknown =>
  decode(data);

export const parseData = (data: any, contentType = ""): string | Buffer => {
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

  return typeof data === "string" ||
    (typeof data === "object" && Buffer.isBuffer(data))
    ? data
    : JSON.stringify(data);
};

const getFinalStepResult = async (executionId: string) => {
  const result = await gqlRequest({
    document: gql`
      query executionResults($executionId: ID!) {
        executionResult(id: $executionId) {
          stepResults(last: 1) {
            nodes {
              id
              stepName
              resultsUrl
            }
          }
        }
      }
    `,
    variables: { executionId },
  });
  const { resultsUrl } = result.executionResult.stepResults.nodes[0];
  const response = await axios.get(resultsUrl, {
    responseType: "arraybuffer",
  });
  const resultsBuffer = Buffer.from(await response.data);
  const { data: deserializedResult, contentType } = decode(
    resultsBuffer
  ) as DeserializeResult;

  return {
    data: parseData(deserializedResult as string, contentType),
    contentType,
  };
};

export const writeFinalStepResults = async (
  executionId: string,
  fileName: string
): Promise<void> => {
  const result = await getFinalStepResult(executionId);
  await fs.writeFile(fileName, result.data);
};
