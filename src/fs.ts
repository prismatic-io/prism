import { promises as fs } from "fs";

export const exists = async (path: string) => {
  return fs.access(path).then(
    () => true,
    () => false
  );
};

export const readStdin = async () => {
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

export { fs };
