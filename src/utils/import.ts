import { ux } from "./ux.js";
import { resolve } from "path";
import { exists } from "../fs.js";

/**
 * Finds the package root directory by searching upward for package.json.
 * Returns the absolute path to the directory containing package.json.
 * Does not change the current working directory.
 * Throws an error if package.json cannot be found.
 */
export const findPackageRoot = async (
  packageType: string,
  cwd = process.cwd(),
): Promise<string> => {
  let currentPath = resolve(cwd);

  while (!(await exists(resolve(currentPath, "package.json")))) {
    const parentPath = resolve(currentPath, "..");
    if (parentPath === currentPath) {
      ux.error(`Failed to find 'package.json' file. Is the current path a ${packageType}?`, {
        exit: 1,
      });
    }
    currentPath = parentPath;
  }

  return currentPath;
};

export const seekPackageDistDirectory = async (
  packageType: string,
  cwd = process.cwd(),
): Promise<string> => {
  const packageRoot = await findPackageRoot(packageType, cwd);

  if (!(await exists(resolve(packageRoot, "dist")))) {
    ux.error(`Failed to find 'dist' folder. Is the current path a ${packageType}?`, {
      exit: 1,
    });
  }

  return resolve(packageRoot, "dist");
};

export const getPackageEntrypointDirectory = async (
  packageType: string,
  cwd = process.cwd(),
): Promise<string> =>
  (await exists(resolve(cwd, "index.js")))
    ? resolve(cwd)
    : seekPackageDistDirectory(packageType, cwd);
