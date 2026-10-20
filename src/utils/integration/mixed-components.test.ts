import { describe, expect, it } from "vitest";
import { dumpYaml } from "../serialize.js";
import { COMPONENT_SELF_SIGNATURE, mixedComponentWarnings } from "./signatures.js";

const component = { key: "acme", isPublic: false, signature: "installed-hash" };
const packages = [{ ...component, name: "@example/acme" }];
const definition = (selector: unknown) =>
  dumpYaml({ flows: [{ supplementalComponents: [selector] }] });

describe("mixed component consumption warnings", () => {
  it.each([
    component,
    { ...component, signature: "other-hash" },
    { key: "acme", isPublic: false, version: 2 },
    { key: "acme", isPublic: false, version: "LATEST" },
  ])("warns about competing paths regardless of manifest version: %j", (selector) => {
    const warnings = mixedComponentWarnings(definition(selector), packages);
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toContain('Component "acme"');
    expect(warnings[0]).toContain('npm package "@example/acme"');
    expect(warnings[0]).toContain("Prefer the npm package");
    expect(warnings[0]).toContain("Existing manifest version selections are unchanged");
  });

  it.each([
    { ...component, signature: COMPONENT_SELF_SIGNATURE },
    { ...component, isPublic: true },
    { ...component, key: "unrelated" },
    { key: "acme", isPublic: false },
  ])("does not warn for npm self references or unrelated components: %j", (selector) => {
    expect(mixedComponentWarnings(definition(selector), packages)).toEqual([]);
  });

  it("does not warn for manifest-only integrations", () => {
    expect(mixedComponentWarnings(definition(component), [])).toEqual([]);
  });

  it("deduplicates references across nested steps, config vars and supplemental components", () => {
    const yaml = dumpYaml({
      flows: [
        {
          supplementalComponents: [component],
          steps: [
            {
              action: { component },
              branches: [{ steps: [{ action: { component } }] }],
            },
          ],
        },
      ],
      requiredConfigVars: [{ connection: { component } }, { dataSource: { component } }],
    });
    expect(mixedComponentWarnings(yaml, packages)).toHaveLength(1);
  });

  it.each([
    "connection",
    "dataSource",
  ])("detects a %s reference without a supplemental component", (kind) => {
    const yaml = dumpYaml({ requiredConfigVars: [{ [kind]: { component } }] });
    expect(mixedComponentWarnings(yaml, packages)).toHaveLength(1);
  });

  it("ignores component-shaped user inputs and schemas", () => {
    const yaml = dumpYaml({
      flows: [
        {
          schemas: { component },
          steps: [{ inputs: { component } }],
        },
      ],
    });
    expect(mixedComponentWarnings(yaml, packages)).toEqual([]);
  });
});
