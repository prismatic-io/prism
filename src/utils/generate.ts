import prettier from "prettier";
import { glob } from "glob";
import { promises as fs } from "fs";
import * as path from "path";

export const VALID_NAME_REGEX = /^[a-zA-Z0-9][a-zA-Z0-9-_]*[a-zA-Z0-9]$/;

export const getFilesToFormat = async (basename: string) => {
  return await glob("**/*.ts", {
    ignore: ["**/node_modules/**"],
    cwd: path.dirname(basename),
  });
};

export const formatSourceFiles = async (basePath: string, files: string[]) => {
  //format the text of each file
  await Promise.all(
    files.map(async (filePath) => {
      const formattedFile = await prettier.format(
        await fs.readFile(path.resolve(path.dirname(basePath), filePath), "utf-8"),
        { parser: "typescript" },
      );

      //write the formatted text to the proper file location
      await fs.writeFile(path.resolve(path.dirname(basePath), filePath), formattedFile);
    }),
  );
};
