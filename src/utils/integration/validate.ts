import { z } from "zod";
import { CommandFailedError } from "../../errors.js";
import type { ComponentDefinition } from "../component/index.js";
import { loadYaml } from "../serialize.js";

const identity = z.string().refine((value) => value.trim().length > 0);
const definitionSchema = z.object({
  isCodeNative: z.literal(true),
  flows: z
    .array(
      z.object({
        name: identity,
        steps: z
          .array(
            z.object({
              isTrigger: z.boolean().optional(),
              action: z.object({ key: identity, component: z.object({ key: identity }) }),
            }),
          )
          .min(1),
      }),
    )
    .min(1),
});

/** Validate the compiled registration that Prism imports, without invoking a flow. */
export const validateCodeNativeDefinition = (component: ComponentDefinition) => {
  const parsed = definitionSchema.safeParse(loadYaml(component.codeNativeIntegrationYAML ?? ""));
  if (!parsed.success || !identity.safeParse(component.key).success) {
    throw new CommandFailedError({
      message:
        "Invalid Code Native Integration registration: expected a component key and code-native YAML with nonempty flows and action references.",
    });
  }
  for (const flow of parsed.data.flows) {
    if (!flow.steps.some((step) => step.isTrigger === true)) {
      throw new CommandFailedError({ message: `Flow "${flow.name}" has no registered trigger.` });
    }
    if (
      !flow.steps.some((step) => !step.isTrigger && step.action.component.key === component.key)
    ) {
      throw new CommandFailedError({
        message: `Flow "${flow.name}" does not reference its generated execution action.`,
      });
    }
    for (const step of flow.steps) {
      if (step.action.component.key !== component.key) continue;
      const members = step.isTrigger ? component.triggers : component.actions;
      if (
        !Object.hasOwn(members ?? {}, step.action.key) ||
        typeof members?.[step.action.key]?.perform !== "function"
      ) {
        throw new CommandFailedError({
          message: `Flow "${flow.name}" references a missing or noncallable registered ${step.isTrigger ? "trigger" : "action"} "${step.action.key}".`,
        });
      }
    }
  }
  return { componentKey: component.key, flowCount: parsed.data.flows.length };
};
