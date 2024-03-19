import { ChoiceOrSeparatorArray, Separator } from "inquirer-autocomplete-standalone";

export const selectorTypes = ["trigger", "connection", "dataSource"] as const;
export type SelectorTypes = (typeof selectorTypes)[number];

export type ComponentKey = { key: string; id: string };
export type SelectorKey = ComponentKey & {
  inputs: { key: string; comments: string; valueType: string; required: boolean }[];
};

type Choice<TValue extends ComponentKey> = Exclude<
  ChoiceOrSeparatorArray<TValue>[number],
  Separator
>;

export interface SelectorStrategy {
  searchComponents: (input: string) => Promise<Choice<ComponentKey>[]>;
  searchSelectors: (componentKey: ComponentKey, input: string) => Promise<Choice<SelectorKey>[]>;
}
