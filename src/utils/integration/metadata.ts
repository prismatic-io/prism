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
  const alreadyExists = await exists(metadataPath);
  const file = await fs.writeFile(metadataPath, JSON.stringify(metadata));

  if (!alreadyExists) {
    console.log(`
[NOTE] A metadata file has been added at .spectral/prism.json to improve local developer experience.
If you are managing your integration via git, feel free to add this to your .gitignore.
`);
  }

  return file;
}
