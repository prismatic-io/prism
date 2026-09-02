import { spawn } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const baseline = path.resolve(process.argv[2] ?? "../prism-incur-baseline");
const output = path.resolve(process.argv[3] ?? "src/legacy-help.json");
const manifest = JSON.parse(await readFile("test/fixtures/legacy-cli-contract.json", "utf8")) as {
  commands: Record<string, unknown>;
};
const paths = new Set<string>([""]);
for (const id of Object.keys(manifest.commands)) {
  const segments = id.split(":");
  for (let length = 1; length <= segments.length; length += 1) {
    paths.add(segments.slice(0, length).join(":"));
  }
}

const capture = (commandPath: string) =>
  new Promise<{ status: number | null; stderr: string; stdout: string }>((resolve, reject) => {
    const argv = ["src/run.ts", ...(commandPath ? [commandPath] : []), "--help"];
    const child = spawn("bun", argv, {
      cwd: baseline,
      env: {
        COLUMNS: "80",
        HOME: "/tmp/prism-legacy-help-home",
        NO_COLOR: "1",
        PATH: process.env.PATH,
        TERM: "dumb",
      },
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8").on("data", (chunk) => (stdout += chunk));
    child.stderr.setEncoding("utf8").on("data", (chunk) => (stderr += chunk));
    child.once("error", reject);
    child.once("close", (status) => resolve({ status, stderr, stdout }));
  });

const entries = await Promise.all(
  [...paths].sort().map(async (commandPath) => [commandPath, await capture(commandPath)] as const),
);
await writeFile(output, `${JSON.stringify(Object.fromEntries(entries), null, 2)}\n`);
