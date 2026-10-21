import { writeFile } from "node:fs/promises";
import path from "node:path";
import { temporaryDirectoryTask } from "tempy";
import { describe, expect, it } from "vitest";
import { read } from "./index.js";

describe("component description", () => {
  it.each([
    { description: undefined, expected: "Generated component for Acme 1.2.3" },
    { description: "", expected: "Generated component for Acme 1.2.3" },
    { description: " \n\t ", expected: "Generated component for Acme 1.2.3" },
    {
      description: '<p>Acme "posts" API.</p> More details.',
      expected: '<p>Acme "posts" API.</p> More details.',
    },
    {
      description: "First paragraph.\n\nSecond paragraph.",
      expected: "First paragraph.\n\nSecond paragraph.",
    },
  ])("resolves $description to usable metadata", async ({ description, expected }) => {
    await temporaryDirectoryTask(async (directory) => {
      const specPath = path.join(directory, "spec.json");
      await writeFile(
        specPath,
        JSON.stringify({
          openapi: "3.0.3",
          info: { title: "Acme", version: "1.2.3", description },
          servers: [{ url: "https://example.com" }],
          paths: {},
        }),
      );

      const result = await read(specPath);

      expect(result.component.display.description).toBe(expected);
    });
  });
});
