import { exists, fs } from "../../fs.js";

interface PrismMetadataOptions {
  fromDist?: boolean;
}

const CNI_METADATA_RELATIVE_PATH = ".spectral/prism.json";

function getPrefix(fromDist = false) {
  return fromDist ? "../" : "./";
}

export async function getPrismMetadata(
  options: PrismMetadataOptions = {},
): Promise<Record<string, string>> {
  const metadataPath = `${getPrefix(options.fromDist)}${CNI_METADATA_RELATIVE_PATH}`;
  let metadata = {};

  if (await exists(metadataPath)) {
    const parsed = JSON.parse(await fs.readFile(metadataPath, { encoding: "utf-8" }));
    metadata = parsed;
  }

  return metadata;
}

export async function writePrismMetadata(
  metadata: Record<string, string>,
  options: PrismMetadataOptions = {},
) {
  const metadataPath = `${getPrefix(options.fromDist)}${CNI_METADATA_RELATIVE_PATH}`;
  return await fs.writeFile(metadataPath, JSON.stringify(metadata));
}
