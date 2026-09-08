import { Args, Command, Flags } from "@oclif/core";
import type { Field, Fields } from "./compatibility.js";

// Temporary stack seam: keep the installed oclif command catalog working while
// command families move to incur. The final cutover removes this module.
export const asOclifCommand = (
  id: string,
  definition: { description?: string; contract: { args: Fields; options: Fields } },
) => {
  const flag = (field: Field) => {
    const options = {
      description: field.description,
      char: field.char as NonNullable<Parameters<typeof Flags.boolean>[0]>["char"],
      required: field.required,
    };
    if (field.kind === "boolean") return Flags.boolean(options);
    if (field.kind === "integer") return Flags.integer(options);
    const choices = field.options?.map(String);
    return field.multiple
      ? Flags.string({ ...options, multiple: true, options: choices })
      : Flags.string({ ...options, options: choices });
  };
  return class NativeCommand extends Command {
    static description = definition.description;
    static args = Object.fromEntries(
      Object.entries(definition.contract.args).map(([name, field]) => [
        name,
        Args.string({ description: field.description, required: field.required }),
      ]),
    );
    static flags = Object.fromEntries(
      Object.entries(definition.contract.options).map(([name, field]) => [name, flag(field)]),
    );
    async run() {
      const { serve } = await import("./cli.js");
      await serve([id, ...this.argv]);
      this.parsed = true; // Parsing is delegated to incur.
    }
  };
};
