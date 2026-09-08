import { z } from "incur";
import inquirer from "inquirer";
import { camelCase } from "lodash-es";
import path from "path";
import { defineCommand, requireInteractiveInput, optionsSchema } from "../../../command.js";
import { template } from "../../../generate/util.js";
import { resultOutput, warningsOutput } from "../../../output.js";
import {
  DEFAULT_TOOLCHAIN,
  getToolchain,
  TOOLCHAIN_NAMES,
} from "../../../utils/toolchain/index.js";

export default defineCommand({
  mutates: true,
  output: z.object({
    name: z.string(),
    path: z.string(),
    toolchain: z.string(),
    ...warningsOutput,
  }),
  hidden: true,
  description: "Initialize a new Component",
  options: optionsSchema(
    z.object({
      name: z
        .string()
        .optional()
        .describe("Name of the component")
        .meta({ cli: { char: "n" } }),
      description: z
        .string()
        .optional()
        .describe("Description for the component")
        .meta({ cli: { char: "d" } }),
      toolchain: z
        .enum(TOOLCHAIN_NAMES)
        .default(DEFAULT_TOOLCHAIN)
        .meta({ cli: { hidden: true } }),
    }),
  ),
  async run(context) {
    return resultOutput(context, await generateComponent(context.options));
  },
});

export async function generateComponent(
  flags: { name?: string; description?: string; toolchain?: "modern" | "legacy" },
  directory = process.cwd(),
) {
  const toolchain = getToolchain(flags.toolchain ?? DEFAULT_TOOLCHAIN);
  if (!flags.name || !flags.description) {
    requireInteractiveInput(
      "Agent mode requires both --name and --description for components:init:component",
    );
  }
  const { name, description } = await inquirer.prompt<{
    name: string;
    description: string;
  }>(
    [
      {
        type: "input",
        name: "name",
        message: "Name of the component",
        when: () => !flags.name,
      },
      {
        type: "input",
        name: "description",
        message: "Description for the component",
        when: () => !flags.description,
      },
    ],
    flags,
  );

  const context = { component: { name, description, key: camelCase(name) } };
  const sharedFiles = [
    path.join("assets", "icon.png"),
    path.join("src", "actions.test.ts"),
    path.join("src", "actions.ts"),
    path.join("src", "client.ts"),
    path.join("src", "connections.ts"),
    path.join("src", "dataSources.test.ts"),
    path.join("src", "dataSources.ts"),
    path.join("src", "index.ts"),
    path.join("src", "triggers.test.ts"),
    path.join("src", "triggers.ts"),
    ".env.testing",
    "package.json",
  ];
  await Promise.all([
    ...sharedFiles.map((file) =>
      template(
        path.join("component", file.endsWith("icon.png") ? file : `${file}.ejs`),
        path.join(directory, file),
        context,
      ),
    ),
    toolchain.renderTemplates(context, directory),
  ]);
  return { name, path: directory, toolchain: toolchain.name };
}
