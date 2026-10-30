/** What the scaffolded README's usage example names on the generated component. */
export interface ReadmeExample {
  /** Key of the connection the example binds. */
  connection: string;
  /** The input each entity takes its connection through. */
  connectionInput: string;
  /** Key of an action. */
  action: string;
  /** Key of a trigger. */
  trigger: string;
  /** Key of a data source. */
  dataSource: string;
}

/**
 * The entities the sample component (templates/component) defines. A component generated
 * from an OpenAPI spec or a WSDL has its own keys, so its README names none.
 */
export const COMPONENT_TEMPLATE_EXAMPLE: ReadmeExample = {
  connection: "apiKey",
  connectionInput: "acmeConnection",
  action: "listPosts",
  trigger: "exampleTrigger",
  dataSource: "selectPost",
};
