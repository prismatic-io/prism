import { CommandFailedError } from "../../errors.js";
import { dumpYaml, loadYaml } from "../serialize.js";

export interface ComponentSignature {
  key: string;
  isPublic: boolean;
  signature: string;
}

const identity = ({ key, isPublic }: Pick<ComponentSignature, "key" | "isPublic">) =>
  JSON.stringify([key, isPublic]);

const object = (value: unknown): Record<string, unknown> | undefined =>
  value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
const list = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);

/** Rewrite only schema-defined component selectors, never arbitrary inputs or JSON schemas. */
export const pinComponentSignatures = (
  yaml: string,
  components: readonly ComponentSignature[],
): string => {
  if (!components.length) return yaml;
  const signatures = new Map<string, string>();
  for (const component of components) {
    const id = identity(component);
    const previous = signatures.get(id);
    if (previous && previous !== component.signature) {
      throw new CommandFailedError({
        message: `Component ${component.key} has conflicting package signatures; dependencies must agree on one artifact.`,
      });
    }
    signatures.set(id, component.signature);
  }
  const definition = object(loadYaml(yaml));
  if (!definition)
    throw new CommandFailedError({ message: "Invalid integration YAML definition." });

  const pin = (value: unknown) => {
    const selector = object(value);
    if (!selector || typeof selector.key !== "string" || typeof selector.isPublic !== "boolean")
      return;
    const signature = signatures.get(identity({ key: selector.key, isPublic: selector.isPublic }));
    if (!signature) return;
    if (typeof selector.signature === "string" && selector.signature !== signature) {
      throw new CommandFailedError({
        message: `Component ${selector.key} references a different signature than its installed artifact; rebuild the integration with matching dependencies.`,
      });
    }
    delete selector.version;
    selector.signature = signature;
  };
  const steps = (values: unknown) => {
    for (const value of list(values)) {
      const step = object(value);
      if (!step) continue;
      pin(object(step.action)?.component);
      steps(step.steps);
      for (const branch of list(step.branches)) steps(object(branch)?.steps);
    }
  };
  for (const value of list(definition.flows)) {
    const flow = object(value);
    if (!flow) continue;
    steps(flow.steps);
    for (const component of list(flow.supplementalComponents)) pin(component);
  }
  for (const value of list(definition.requiredConfigVars)) {
    const variable = object(value);
    pin(object(variable?.connection)?.component);
    pin(object(variable?.dataSource)?.component);
  }
  return dumpYaml(definition);
};
