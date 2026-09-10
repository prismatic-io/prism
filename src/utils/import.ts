import { getWorkingDirectory } from "../command-context.js";
import { resolve } from "path";
import { exists } from "../fs.js";
/**
 * Finds the package root directory by searching upward for package.json.
 * Returns the absolute path to the directory containing package.json.
 * Does not change the current working directory.
 * Throws an error if package.json cannot be found.
 */
export const findPackageRoot = async (packageType: string): Promise<string> => {
  let currentPath = getWorkingDirectory();

  while (!(await exists(resolve(currentPath, "package.json")))) {
    const parentPath = resolve(currentPath, "..");
    if (parentPath === currentPath) {
      throw Object.assign(
        new Error(`Failed to find 'package.json' file. Is the current path a ${packageType}?`),
        { exitCode: 1 },
      );
    }
    currentPath = parentPath;
  }

  return currentPath;
};

export const seekPackageDistDirectory = async (packageType: string): Promise<string> => {
  const packageRoot = await findPackageRoot(packageType);

  if (!(await exists(resolve(packageRoot, "dist")))) {
    throw Object.assign(
      new Error(`Failed to find 'dist' folder. Is the current path a ${packageType}?`),
      { exitCode: 1 },
    );
  }

  return resolve(packageRoot, "dist");
};

export const getPackageEntrypointDirectory = async (packageType: string): Promise<string> =>
  (await exists(resolve(getWorkingDirectory(), "index.js")))
    ? getWorkingDirectory()
    : seekPackageDistDirectory(packageType);
