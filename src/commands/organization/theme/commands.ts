import { Cli, z } from "incur";
import { prepareCommand } from "../../../command.js";
import { changeHint, changeOptions, changeOutput, changeTheme } from "./change.js";
import { colorType, colorValue, maxBorderRadius, normalizeColorType } from "./values.js";

type Change = { collection: "colors" | "properties"; type: string; value?: string };

/** Keep native argument schemas and help while sharing all mutation behavior. */
function action<Args extends z.ZodObject>(
  description: string,
  args: Args,
  change: (args: z.output<Args>) => Change,
) {
  return prepareCommand(
    Cli.command({
      description,
      args,
      options: changeOptions,
      output: changeOutput,
      hint: changeHint,
      async run(context) {
        const { collection, type, value } = change(context.args as z.output<Args>);
        return changeTheme(context.options.variant, collection, type, value);
      },
    }),
    { mutates: true },
  );
}

function property(type: string, description: string, value: z.ZodType<string | number>) {
  return {
    set: action(`Set ${description}`, z.object({ value }), (args) => ({
      collection: "properties",
      type,
      value: String(args.value),
    })),
    reset: action(`Remove the variant's custom ${description}`, z.object({}), () => ({
      collection: "properties",
      type,
    })),
  };
}

function elevationAction(description: string, value?: string) {
  return action(description, z.object({}), () => ({
    collection: "properties",
    type: "disable_elevation",
    value,
  }));
}

const groups = {
  color: {
    set: action(
      "Set a custom theme color",
      z.object({
        type: colorType.describe("color type"),
        value: colorValue.describe("hex or RGB color"),
      }),
      ({ type, value }) => ({ collection: "colors", type: normalizeColorType(type), value }),
    ),
    reset: action(
      "Remove a custom color to use Prismatic's default",
      z.object({
        type: colorType.describe("color type"),
      }),
      ({ type }) => ({ collection: "colors", type: normalizeColorType(type) }),
    ),
  },
  "border-radius": property(
    "border_radius",
    "corner radius",
    z.coerce
      .number()
      .int()
      .min(0)
      .max(maxBorderRadius)
      .describe("corner radius in pixels, 0 to 100"),
  ),
  elevation: {
    enable: elevationAction("Enable theme drop shadows", "false"),
    disable: elevationAction("Disable theme drop shadows", "true"),
    reset: elevationAction("Remove the variant's custom elevation setting"),
  },
};

export const themeCommands = Object.fromEntries(
  Object.entries(groups).flatMap(([group, actions]) =>
    Object.entries(actions).map(([verb, command]) => [
      `organization:theme:${group}:${verb}`,
      command,
    ]),
  ),
);
