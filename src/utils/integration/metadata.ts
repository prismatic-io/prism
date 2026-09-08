import { resolve } from "node:path";
import { exists, fs } from "../../fs.js";
import { writeCommandOutput } from "../../command.js";
import { isQuiet } from "../../runtime.js";

interface PrismMetadataOptions {
  fromDist?: boolean;
  cwd?: string;
}

const CNI_METADATA_RELATIVE_PATH = ".spectral/prism.json";

function getPrefix(fromDist = false) {
  return fromDist ? "../" : "./";
}

export async function getPrismMetadata(
  options: PrismMetadataOptions = {},
): Promise<Record<string, string>> {
  const metadataPath = resolve(
    options.cwd ?? process.cwd(),
    `${getPrefix(options.fromDist)}${CNI_METADATA_RELATIVE_PATH}`,
  );
  const metadataExists = await exists(metadataPath);

  if (!metadataExists) {
    return {};
  }

  try {
    const parsed = JSON.parse(await fs.readFile(metadataPath, { encoding: "utf-8" }));
    return parsed;
  } catch (e) {
    writeCommandOutput(`Failed to parse metadata at ${metadataPath} ${e}`, "stderr");
    return {};
  }
}

export async function writePrismMetadata(
  metadata: Record<string, string>,
  options: PrismMetadataOptions = {},
) {
  const metadataPath = resolve(
    options.cwd ?? process.cwd(),
    `${getPrefix(options.fromDist)}${CNI_METADATA_RELATIVE_PATH}`,
  );
  const alreadyExists = await exists(metadataPath);
  const file = await fs.writeFile(metadataPath, JSON.stringify(metadata));

  if (!alreadyExists && !isQuiet()) {
    writeCommandOutput(
      `
[NOTE] A metadata file has been added at .spectral/prism.json to improve local developer experience.
If you are managing your integration via git, feel free to add this to your .gitignore.
`,
      "stderr",
    );
  }

  return file;
}
