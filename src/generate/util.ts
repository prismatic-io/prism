import ejs from "ejs";
import { copyFile, mkdirp, outputFile, readJson } from "fs-extra";
import { camelCase, merge, startCase } from "lodash-es";
import path from "path";
import prettier from "prettier";
import striptags from "striptags";
import { fileURLToPath } from "url";
import { exists, walkDir } from "../fs.js";
import { fetch } from "../utils/http.js";

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

const templatesRoot = (): string => {
  const moduleDir = path.dirname(fileURLToPath(import.meta.url));
  const basePath = process.env.NODE_ENV === "test" ? path.join(moduleDir, "..", "..") : moduleDir;
  return path.join(basePath, "templates");
};

export const template = async (
  source: string,
  destination: string = source.replace(/\.ejs$/, ""),
  data: Record<string, unknown> = {},
): Promise<void> => {
  const templatePath = path.join(templatesRoot(), source);

  const isTemplate = [".js", ".ts", ".mts", ".json", ".md", ""].includes(path.extname(destination));

  if (isTemplate) {
    const rendered = await ejs.renderFile(templatePath, data);
    await outputFile(destination, rendered, { encoding: "utf-8" });
  } else {
    await mkdirp(path.dirname(destination));
    await copyFile(templatePath, destination);
  }
};

/**
 * Render every template file under a templates subdirectory, preserving its
 * structure in the output.
 */
export const templateDirectory = async (
  sourceDir: string,
  data: Record<string, unknown> = {},
): Promise<void> => {
  const absoluteDir = path.join(templatesRoot(), sourceDir);
  const files = await walkDir(absoluteDir);
  await Promise.all(
    files.map((file) => {
      const relativePath = path.relative(absoluteDir, file);
      return template(path.join(sourceDir, relativePath), relativePath.replace(/\.ejs$/, ""), data);
    }),
  );
};

const updateDependencies = async (dependencies: Record<string, string>) => {
  const promises = Object.entries(dependencies).map(async ([name, version]) => {
    try {
      if (version === "*" && !name.includes("@component-manifests")) {
        const packageUrl = new URL("https://registry.npmjs.org");
        packageUrl.pathname = `/${name}/latest`;
        const response = await fetch(packageUrl.toString());
        const data = (await response.json()) as any;
        return [name, data.version];
      }
    } catch {
      // If we do not find a latest version, continue with "*".
      // This also bails us out in test scenarios.
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
