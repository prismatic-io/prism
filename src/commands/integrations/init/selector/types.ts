import { ChoiceOrSeparatorArray, Separator } from "inquirer-autocomplete-standalone";

export const selectorTypes = ["trigger", "connection", "dataSource"] as const;
export type SelectorTypes = (typeof selectorTypes)[number];

type BaseKey = { key: string; id: string };
export type ComponentKey = BaseKey & { isPublic: boolean };
export type SelectorKey = BaseKey & {
  inputs: { key: string; comments: string; valueType: string; required: boolean }[];
};

type Choice<TValue extends BaseKey> = Exclude<ChoiceOrSeparatorArray<TValue>[number], Separator>;

export interface SelectorStrategy {
  searchComponents: (input: string) => Promise<Choice<ComponentKey>[]>;
  searchSelectors: (componentKey: ComponentKey, input: string) => Promise<Choice<SelectorKey>[]>;
}
