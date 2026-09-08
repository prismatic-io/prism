import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { cli, normalizeCommandArguments } from "./cli.js";
import { NativeCommands } from "./index.js";

const published = JSON.parse(
  await readFile(new URL("../test/fixtures/legacy-cli-contract.json", import.meta.url), "utf8"),
).commands;

describe("incremental native command contract", () => {
  for (const [id, command] of Object.entries(NativeCommands)) {
    it(`${id} retains published inputs and exposes its native output schema`, async () => {
      const legacy = published[id];
      if (legacy) {
        expect(command.description).toBe(legacy.description);
        for (const [name, field] of Object.entries(legacy.args)) {
          expect(command.contract.args[name], `${id} positional ${name}`).toBeDefined();
          expect(command.contract.args[name].required ?? false).toBe(
            (field as { required?: boolean }).required ?? false,
          );
        }
        for (const [name, field] of Object.entries(legacy.flags)) {
          if (["quiet", "profile", "print-requests"].includes(name)) continue;
          expect(command.contract.options[name], `${id} flag ${name}`).toBeDefined();
          // Published -n collides; it belongs to --flow-name, while --no-prompt keeps its long form.
          if (!(id === "integrations:flows:listen" && name === "no-prompt"))
            expect(command.contract.options[name].char).toBe((field as { char?: string }).char);
        }
      }
      expect(normalizeCommandArguments([id, "--schema"])).toEqual([...id.split(":"), "--schema"]);
      expect(command.output).toBeDefined();
      const output: string[] = [];
      let status = 0;
      await cli.serve([...id.split(":"), "--schema", "--format", "json"], {
        stdout: (text) => output.push(text),
        exit: (code) => {
          status = code;
        },
      });
      expect(status).toBe(0);
      expect(JSON.parse(output.join(""))).toHaveProperty("output");
    });
  }
});
