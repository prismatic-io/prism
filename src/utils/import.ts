import { ux } from "@oclif/core";
import { exists } from "../fs";

export const seekPackageDistDirectory = async (
  packageType: string
): Promise<void> => {
  while (!(await exists("package.json"))) {
    const tempDir = process.cwd();
    process.chdir("../");
    if (process.cwd() == tempDir) {
      ux.error(
        `Failed to find 'package.json' file. Is the current path a ${packageType}?`,
        { exit: 1 }
      );
    }
  }

  if (!(await exists("./dist"))) {
    ux.error(
      `Failed to find 'dist' folder. Is the current path a ${packageType}?`,
      {
        exit: 1,
      }
    );
  }

  process.chdir("./dist");
};
