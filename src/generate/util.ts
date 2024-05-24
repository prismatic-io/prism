import axios from "axios";
import { renderFile } from "ejs";
import { copyFile, mkdirp, outputFile, readJson } from "fs-extra";
import striptags from "striptags";
import prettier from "prettier";
import { startCase, camelCase, merge } from "lodash-es";
import path from "path";
import { fileURLToPath } from "url";
import { exists } from "../fs.js";

export const pascalCase = (str: string) => startCase(camelCase(str)).replace(/ /g, "");

export const createDescription = (text?: string): string => {
  if (!text) {
    return "";
  }

  const strippedText = striptags(text);
  const [nonEmptyLine] = strippedText.split("\n").filter((t) => t.trim() !== "");
  const [fragment] = nonEmptyLine.split(/[.!?]/g);
  return fragment.replace(/`/g, "'");
};

export const toArgv = (args: Record<string, unknown>): string[] =>
  Object.entries(args).flatMap(([key, value]) => [`--${key}`, `${value}`]);

export const template = async (
  source: string,
  destination: string = source.replace(/\.ejs$/, ""),
  data: Record<string, unknown> = {},
): Promise<void> => {
  const basePath =
    process.env.NODE_ENV === "test"
      ? path.join(__dirname, "..", "..")
      : path.dirname(fileURLToPath(import.meta.url));
  const templatePath = path.join(basePath, "templates", source);

  const isTemplate = [".js", ".ts", ".json"].includes(path.extname(destination));
  if (isTemplate) {
    const rendered = await renderFile(templatePath, data);
    await outputFile(destination, rendered, { encoding: "utf-8" });
  } else {
    await mkdirp(path.dirname(destination));
    await copyFile(templatePath, destination);
  }
};

const updateDependencies = async (dependencies: Record<string, string>) => {
  const promises = Object.entries(dependencies).map(async ([name, version]) => {
    if (version === "*") {
      const { data } = await axios.get(`https://registry.npmjs.org/${name}/latest`);
      return [name, data.version];
    }
    return [name, version];
  });
  const resolved = await Promise.all(promises);
  return Object.fromEntries(resolved);
};

interface UpdatePackageJsonParams {
  path: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  [key: string]: unknown;
}

export const updatePackageJson = async ({
  path,
  dependencies = {},
  devDependencies = {},
  ...rest
}: UpdatePackageJsonParams) => {
  const existingPackageJson = await exists(path);
  const contents = existingPackageJson ? await readJson(path, { encoding: "utf-8" }) : {};

  const updatedDependencies = await updateDependencies(dependencies);
  const updatedDevDependencies = await updateDependencies(devDependencies);

  const result = merge({}, contents, rest, {
    dependencies: updatedDependencies,
    devDependencies: updatedDevDependencies,
  });
  const formatted = await prettier.format(JSON.stringify(result, null, 2), {
    parser: "json",
  });
  await outputFile(path, formatted, { encoding: "utf-8" });
};
