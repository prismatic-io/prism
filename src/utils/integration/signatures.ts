import { CommandFailedError } from "../../errors.js";
import { dumpYaml, loadYaml } from "../serialize.js";

// Wire protocol emitted by Spectral callable connections; resolved only during publication.
export const COMPONENT_SELF_SIGNATURE = "__PRISMATIC_COMPONENT_SELF__";

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

/** Visit references in the integration schema, excluding arbitrary input values and schemas. */
const visitComponentSelectors = (
  definition: Record<string, unknown>,
  visit: (selector: unknown) => void,
) => {
  const steps = (values: unknown) => {
    for (const value of list(values)) {
      const step = object(value);
      if (!step) continue;
      visit(object(step.action)?.component);
      steps(step.steps);
      for (const branch of list(step.branches)) steps(object(branch)?.steps);
    }
  };
  for (const value of list(definition.flows)) {
    const flow = object(value);
    if (!flow) continue;
    steps(flow.steps);
    for (const component of list(flow.supplementalComponents)) visit(component);
  }
  for (const value of list(definition.requiredConfigVars)) {
    const variable = object(value);
    visit(object(variable?.connection)?.component);
    visit(object(variable?.dataSource)?.component);
  }
};

/** A declared npm component and an explicit published reference use competing consumption paths. */
export const mixedComponentWarnings = (
  yaml: string,
  components: readonly (ComponentSignature & { name: string })[],
): string[] => {
  if (!components.length) return [];
  const definition = object(loadYaml(yaml));
  if (!definition) return [];
  const packages = new Map(components.map((component) => [identity(component), component.name]));
  const warnings = new Map<string, string>();
  visitComponentSelectors(definition, (value) => {
    const selector = object(value);
    if (
      !selector ||
      typeof selector.key !== "string" ||
      typeof selector.isPublic !== "boolean" ||
      selector.signature === COMPONENT_SELF_SIGNATURE ||
      (typeof selector.signature !== "string" &&
        typeof selector.version !== "number" &&
        selector.version !== "LATEST")
    )
      return;
    const id = identity({ key: selector.key, isPublic: selector.isPublic });
    const packageName = packages.get(id);
    if (!packageName) return;
    warnings.set(
      id,
      `Component "${selector.key}" is referenced through a manifest and is also installed as npm package "${packageName}". Prefer the npm package for new code. Replace this component's manifest usages with imports from "${packageName}", then remove its manifest registration. Existing manifest version selections are unchanged.`,
    );
  });
  return [...warnings.values()];
};

/** Rewrite only schema-defined component selectors, never arbitrary inputs or JSON schemas. */
export const pinComponentSignatures = (
  yaml: string,
  components: readonly ComponentSignature[],
  cni?: ComponentSignature,
): string => {
  const signatures = new Map<string, string>();
  for (const component of [...components, ...(cni ? [cni] : [])]) {
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
    if (!selector) return;
    if (
      typeof selector.key !== "string" ||
      !selector.key ||
      typeof selector.isPublic !== "boolean"
    ) {
      if (selector.signature === COMPONENT_SELF_SIGNATURE) {
        throw new CommandFailedError({
          message:
            "A component self reference requires a nonempty key and explicit isPublic visibility.",
        });
      }
      return;
    }
    const id = identity({ key: selector.key, isPublic: selector.isPublic });
    const isSelf = selector.signature === COMPONENT_SELF_SIGNATURE;
    if (!isSelf && (!cni || id !== identity(cni))) return;
    const signature = signatures.get(id);
    if (!signature) {
      throw new CommandFailedError({
        message: `Component ${selector.key} references its own artifact, but no matching published package was found. Declare the component package as a dependency and rebuild the integration.`,
      });
    }
    if (!isSelf && typeof selector.signature === "string" && selector.signature !== signature) {
      throw new CommandFailedError({
        message: `Component ${selector.key} references a different signature than its installed artifact; rebuild the integration with matching dependencies.`,
      });
    }
    delete selector.version;
    selector.signature = signature;
  };
  visitComponentSelectors(definition, pin);
  return dumpYaml(definition);
};
