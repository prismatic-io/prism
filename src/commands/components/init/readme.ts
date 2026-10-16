/** What the scaffolded README's usage example names on the generated component. */
export interface ReadmeExample {
  /** Key of a connection, if the component has one. */
  connection?: string;
  /** The input every entity takes its connection through. */
  connectionInput: string;
  /** Key of an action, if the component has one. */
  action?: string;
  /** Key of a trigger, if the component has one. */
  trigger?: string;
  /** Key of a data source, if the component has one. */
  dataSource?: string;
}

/** The entities templates/component/src/*.ts.ejs define. */
export const COMPONENT_TEMPLATE_EXAMPLE: ReadmeExample = {
  connection: "apiKey",
  connectionInput: "acmeConnection",
  action: "listItems",
  trigger: "exampleTrigger",
  dataSource: "selectItem",
};
