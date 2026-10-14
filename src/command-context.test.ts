import path from "node:path";
import { expect, it } from "vitest";
import {
  createCommandContext,
  getCommandContext,
  getWorkingDirectory,
  runWithCommandContext,
  withWorkingDirectory,
} from "./command-context.js";

it("captures the invocation directory and inherits the active directory for nested commands", () => {
  const original = process.cwd();
  expect(getWorkingDirectory()).toBe(original);
  const context = createCommandContext({ cwd: "project" });
  expect(context.cwd).toBe(path.join(original, "project"));
  runWithCommandContext(context, () => {
    expect(getWorkingDirectory()).toBe(context.cwd);
    withWorkingDirectory("dist", () => {
      const nested = createCommandContext();
      runWithCommandContext(nested, () => {
        expect(getWorkingDirectory()).toBe(path.join(context.cwd, "dist"));
      });
    });
    expect(getWorkingDirectory()).toBe(context.cwd);
  });
  expect(getWorkingDirectory()).toBe(original);
  expect(getCommandContext()).toBeUndefined();
});

it("isolates concurrent directory scopes while sharing authentication within an invocation", async () => {
  const original = process.cwd();
  const context = createCommandContext();
  await runWithCommandContext(context, async () => {
    const auth = Promise.resolve({ source: "environment" as const, url: "https://example.com" });
    await Promise.all(
      ["alpha", "beta"].map((directory) =>
        withWorkingDirectory(directory, async () => {
          expect(getCommandContext()).toBe(context);
          if (directory === "alpha") context.auth = auth;
          await new Promise((resolve) => setTimeout(resolve, 5));
          expect(getWorkingDirectory()).toBe(path.join(original, directory));
          expect(getCommandContext()?.auth).toBe(auth);
          await withWorkingDirectory("dist", async () => {
            await Promise.resolve();
            expect(getWorkingDirectory()).toBe(path.join(original, directory, "dist"));
          });
          expect(getWorkingDirectory()).toBe(path.join(original, directory));
        }),
      ),
    );
    expect(getWorkingDirectory()).toBe(original);
  });
  expect(process.cwd()).toBe(original);
});

it("restores the directory after synchronous throws and asynchronous rejection", async () => {
  const original = getWorkingDirectory();
  expect(() =>
    withWorkingDirectory("broken", () => {
      throw new Error("failed");
    }),
  ).toThrow("failed");
  expect(getWorkingDirectory()).toBe(original);
  await expect(
    withWorkingDirectory("broken", async () => {
      await Promise.resolve();
      throw new Error("failed");
    }),
  ).rejects.toThrow("failed");
  expect(getWorkingDirectory()).toBe(original);
  expect(getCommandContext()).toBeUndefined();
});
