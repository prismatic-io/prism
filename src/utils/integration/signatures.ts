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

/** Rewrite only schema-defined component selectors, never arbitrary inputs or JSON schemas. */
export const pinComponentSignatures = (
  yaml: string,
  components: readonly ComponentSignature[],
  cni?: ComponentSignature,
  importMetadata?: Record<string, unknown>,
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
  // Record declared dependencies even when no platform selector references them.
  // Aliased packages may resolve to the same component artifact.
  definition.importMetadata = {
    ...object(definition.importMetadata),
    ...importMetadata,
    componentDependencies: [
      ...new Map(
        components.map(({ key, isPublic, signature }) => [
          identity({ key, isPublic }),
          { key, isPublic, signature },
        ]),
      ).values(),
    ],
  };
  return dumpYaml(definition);
};
