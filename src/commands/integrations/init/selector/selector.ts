import { Command, Flags } from "@oclif/core";
import autocomplete from "inquirer-autocomplete-standalone";
import { pascalCase } from "../../../../generate/util.js";
import { ConnectionSelectorStrategy } from "./strategies/connection.js";
import { DataSourceSelectorStrategy } from "./strategies/dataSource.js";
import { TriggerSelectorStrategy } from "./strategies/trigger.js";
import { SelectorTypes, SelectorStrategy, selectorTypes } from "./types.js";

const strategies: Record<SelectorTypes, SelectorStrategy> = {
  trigger: new TriggerSelectorStrategy(),
  dataSource: new DataSourceSelectorStrategy(),
  connection: new ConnectionSelectorStrategy(),
};

export default class GenerateComponentSelectorCommand extends Command {
  static description = "Generate a new Component Selector for use in Code-Native Integrations";
  static flags = {
    type: Flags.string({
      char: "t",
      description: "Type of component selector",
      options: selectorTypes,
    }),
  };

  async run() {
    const { flags } = await this.parse(GenerateComponentSelectorCommand);

    const type =
      (flags.type as SelectorTypes) ??
      (await autocomplete<SelectorTypes>({
        message: "Type of the component selector",
        source: (input?: string) =>
          Promise.resolve(
            selectorTypes
              .filter((t) => t.includes(input ?? ""))
              .map((t) => ({ name: t, value: t })),
          ),
      }));

    const strategy = strategies[type];

    const componentKey = await autocomplete({
      message: "Desired component",
      source: (input?: string) => strategy.searchComponents(input ?? ""),
    });

    const key = await autocomplete({
      message: "Selector",
      source: (input?: string) => strategy.searchSelectors(componentKey, input ?? ""),
    });

    const componentSelector = componentKey.isPublic
      ? `"${componentKey.key}"`
      : `{ key: "${componentKey.key}", isPublic: false }`;

    const selector = `
interface ${pascalCase(`${componentKey.key} ${key.key} ${type}`)} {
  type: "${type}";
  component: ${componentSelector};
  key: "${key.key}";
  values: {
${key.inputs
  .map(
    ({ key, comments, valueType, required }) =>
      `${comments ? `    // ${comments}\n` : ""}    ${key}${required ? "" : "?"}: ${valueType};`,
  )
  .join("\n")}
  };
}
    `;
    this.log(selector);
  }
}
