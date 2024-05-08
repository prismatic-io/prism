import { promises as fs } from "fs";
import path from "path";

export const exists = async (path: string): Promise<boolean> => {
  return fs.access(path).then(
    () => true,
    () => false,
  );
};

export const readStdin = async (): Promise<string> => {
  return new Promise((resolve, reject) => {
    process.stdin
      .on("readable", () => {
        const result = process.stdin.read();
        if (result !== null) {
          process.stdin.removeAllListeners();
          resolve(result.toString());
        }
      })
      .on("error", reject);
  });
};

export const walkDir = async (dir: string, ignore: string[] = []): Promise<string[]> => {
  const dirents = await fs.readdir(dir, { withFileTypes: true });
  const promises = dirents.map((d) =>
    d.isDirectory() ? walkDir(path.join(dir, d.name)) : path.join(dir, d.name),
  );
  const results = (await Promise.all(promises)).flat();
  return results.filter((r) => !ignore.some((i) => r.endsWith(i)));
};

export { fs };
