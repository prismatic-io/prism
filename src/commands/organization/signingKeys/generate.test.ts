import { mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { graphql, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { TEST_PRISMATIC_URL } from "../../../../vitest.setup.js";
import { runCommand } from "../../../test-command.js";
import Command from "./generate.js";

const privateKey = "-----BEGIN PRIVATE KEY-----\ngenerated\n-----END PRIVATE KEY-----\n";
let generated = 0;
let failGeneration = false;
const server = setupServer(
  graphql.link(`${TEST_PRISMATIC_URL}/api`).mutation("generateSigningKey", () => {
    generated++;
    if (failGeneration) return HttpResponse.json({ errors: [{ message: "Not allowed" }] });
    return HttpResponse.json({
      data: { createOrganizationSigningKey: { result: { privateKey } } },
    });
  }),
);

let directory = "";
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
beforeEach(async () => {
  directory = await mkdtemp(join(tmpdir(), "prism-signing-key-"));
});
afterEach(async () => {
  generated = 0;
  failGeneration = false;
  server.resetHandlers();
  await rm(directory, { recursive: true, force: true });
});
afterAll(() => server.close());

describe("organization:signing-keys:generate", () => {
  it("prints the private key outside agent mode", async () => {
    await expect(runCommand(Command, ["--no-agent"])).resolves.toEqual({ privateKey });
  });

  it("refuses to print the private key in agent mode before generating a key", async () => {
    await expect(runCommand(Command, ["--agent", "--yes"])).rejects.toMatchObject({
      code: "PRIVATE_KEY_FILE_REQUIRED",
    });
    expect(generated).toBe(0);
  });

  it("writes the private key to a file and returns only its path", async () => {
    const privateKeyFile = join(directory, "key.pem");
    const result = await runCommand(Command, [
      "--agent",
      "--yes",
      "--private-key-file",
      privateKeyFile,
    ]);
    expect(result).toEqual({ privateKeyFile });
    expect(JSON.stringify(result)).not.toContain("PRIVATE KEY");
    expect(await readFile(privateKeyFile, "utf8")).toBe(privateKey);
  });

  // Windows does not apply POSIX permission bits.
  it.runIf(process.platform !== "win32")("makes the private key file owner-only", async () => {
    const privateKeyFile = join(directory, "key.pem");
    await runCommand(Command, ["--agent", "--yes", "--private-key-file", privateKeyFile]);
    expect((await stat(privateKeyFile)).mode & 0o777).toBe(0o600);
  });

  it("refuses an existing file before generating a key", async () => {
    const privateKeyFile = join(directory, "key.pem");
    await writeFile(privateKeyFile, "existing");
    await expect(
      runCommand(Command, ["--agent", "--yes", "--private-key-file", privateKeyFile]),
    ).rejects.toMatchObject({
      code: "EEXIST",
      hint: "No signing key was generated. Retry --private-key-file with a new unused path; preserve the existing file.",
    });
    expect(generated).toBe(0);
    expect(await readFile(privateKeyFile, "utf8")).toBe("existing");

    const freshPath = join(directory, "new-key.pem");
    await expect(
      runCommand(Command, ["--agent", "--yes", "--private-key-file", freshPath]),
    ).resolves.toEqual({ privateKeyFile: freshPath });
    expect(generated).toBe(1);
    expect(await readFile(privateKeyFile, "utf8")).toBe("existing");
  });

  it("preserves the ordinary existing-file error outside agent mode", async () => {
    const privateKeyFile = join(directory, "key.pem");
    await writeFile(privateKeyFile, "existing");
    const error = await runCommand(Command, [
      "--no-agent",
      "--private-key-file",
      privateKeyFile,
    ]).catch((error: unknown) => error);
    expect(error).toMatchObject({
      code: "EEXIST",
      message: expect.stringContaining("file already exists"),
    });
    expect((error as { hint?: string }).hint).toBeUndefined();
    expect(generated).toBe(0);
    expect(await readFile(privateKeyFile, "utf8")).toBe("existing");
  });

  it("refuses an unwritable path before generating a key", async () => {
    await expect(
      runCommand(Command, [
        "--agent",
        "--yes",
        "--private-key-file",
        join(directory, "missing", "key.pem"),
      ]),
    ).rejects.toMatchObject({ code: "ENOENT" });
    expect(generated).toBe(0);
  });

  it("removes the claimed file when generation fails", async () => {
    failGeneration = true;
    const privateKeyFile = join(directory, "key.pem");
    await expect(
      runCommand(Command, ["--agent", "--yes", "--private-key-file", privateKeyFile]),
    ).rejects.toThrow("Not allowed");
    expect(generated).toBe(1);
    await expect(stat(privateKeyFile)).rejects.toMatchObject({ code: "ENOENT" });
  });
});
