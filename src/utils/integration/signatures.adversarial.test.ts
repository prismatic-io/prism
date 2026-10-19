import { describe, expect, it } from "vitest";
import { dumpYaml, loadYaml } from "../serialize.js";
import { COMPONENT_SELF_SIGNATURE, pinComponentSignatures } from "./signatures.js";

const installed = { key: "api", isPublic: false, signature: "a".repeat(40) };
const self = { ...installed, signature: COMPONENT_SELF_SIGNATURE };
const yaml = (component: unknown) =>
  dumpYaml({ requiredConfigVars: [{ connection: { key: "token", component } }] });
const selected = (definition: string) =>
  loadYaml<any>(definition).requiredConfigVars[0].connection.component;

describe("publication signature adversarial cases", () => {
  it.each([
    1,
    "LATEST",
    "999",
    null,
    { signature: "attacker" },
  ])("discards a forced version alongside the self marker (%j)", (version) => {
    expect(selected(pinComponentSignatures(yaml({ ...self, version }), [installed]))).toEqual(
      installed,
    );
  });

  it("rejects a dependency whose identity collides with the CNI wrapper", () => {
    expect(() =>
      pinComponentSignatures(yaml(self), [installed], {
        ...installed,
        signature: "b".repeat(40),
      }),
    ).toThrow(/conflicting package signatures/);
  });

  it("selects by visibility as well as key when both public and private artifacts exist", () => {
    const publicArtifact = { ...installed, isPublic: true, signature: "b".repeat(40) };
    expect(selected(pinComponentSignatures(yaml(self), [publicArtifact, installed]))).toEqual(
      installed,
    );
    expect(
      selected(
        pinComponentSignatures(yaml({ ...self, isPublic: true }), [installed, publicArtifact]),
      ),
    ).toEqual(publicArtifact);
  });

  it("rejects mismatched installed component identity instead of falling back to LATEST", () => {
    expect(() =>
      pinComponentSignatures(yaml({ ...self, version: "LATEST" }), [
        { ...installed, key: "different" },
      ]),
    ).toThrow(/no matching published package/);
  });

  it("preserves explicit manifest selectors when matching installed artifacts are present", () => {
    for (const component of [
      { key: "api", isPublic: false, version: 99 },
      { key: "api", isPublic: false, version: "LATEST" },
      { ...installed, signature: "b".repeat(40) },
    ]) {
      expect(selected(pinComponentSignatures(yaml(component), [installed]))).toEqual(component);
    }
  });

  it.each([
    { key: "api", signature: COMPONENT_SELF_SIGNATURE },
    { key: "api", isPublic: "false", signature: COMPONENT_SELF_SIGNATURE },
    { isPublic: false, signature: COMPONENT_SELF_SIGNATURE },
    { key: 1, isPublic: false, signature: COMPONENT_SELF_SIGNATURE },
  ])("rejects malformed self selectors before sending YAML to the platform (%j)", (component) => {
    expect(() => pinComponentSignatures(yaml(component), [installed])).toThrow();
  });
});
