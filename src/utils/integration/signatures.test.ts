import { describe, expect, it } from "vitest";
import { dumpYaml, loadYaml } from "../serialize.js";
import { COMPONENT_SELF_SIGNATURE, pinComponentSignatures } from "./signatures.js";

const selector = { key: "dependency", isPublic: false, signature: COMPONENT_SELF_SIGNATURE };
const pinned = { key: "dependency", isPublic: false, signature: "hash" };
const components = [pinned];

describe("pinComponentSignatures", () => {
  it("pins connections, data sources, nested steps, and supplemental components without touching user data", () => {
    const definition = {
      requiredConfigVars: [
        { connection: { key: "connection", component: selector }, inputs: { component: selector } },
        { dataSource: { key: "source", component: selector } },
      ],
      flows: [
        {
          supplementalComponents: [selector],
          schemas: { result: { component: selector } },
          steps: [
            {
              action: { key: "trigger", component: selector },
              inputs: { component: selector },
              steps: [{ action: { key: "loopAction", component: selector } }],
              branches: [{ steps: [{ action: { key: "branchAction", component: selector } }] }],
            },
          ],
        },
      ],
    };
    const result = loadYaml<any>(pinComponentSignatures(dumpYaml(definition), components));
    expect(result.requiredConfigVars[0].connection.component).toEqual(pinned);
    expect(result.requiredConfigVars[1].dataSource.component).toEqual(pinned);
    const flow = result.flows[0];
    expect(flow.supplementalComponents).toEqual([pinned]);
    expect(flow.steps[0].action.component).toEqual(pinned);
    expect(flow.steps[0].steps[0].action.component).toEqual(pinned);
    expect(flow.steps[0].branches[0].steps[0].action.component).toEqual(pinned);
    expect(flow.schemas.result.component).toEqual(selector);
    expect(flow.steps[0].inputs.component).toEqual(selector);
    expect(result.requiredConfigVars[0].inputs.component).toEqual(selector);
  });

  it("distinguishes visibility and leaves unrelated components unchanged", () => {
    const other = { key: "other", isPublic: false, version: "LATEST" };
    const publicSelector = { key: "dependency", isPublic: true, version: "LATEST" };
    const result = loadYaml<any>(
      pinComponentSignatures(
        dumpYaml({ flows: [{ supplementalComponents: [selector, other, publicSelector] }] }),
        components,
      ),
    );
    expect(result.flows[0].supplementalComponents).toEqual([pinned, other, publicSelector]);
  });

  it("preserves explicit manifest versions and signatures even for the same installed component", () => {
    const result = loadYaml<any>(
      pinComponentSignatures(
        dumpYaml({
          flows: [
            {
              supplementalComponents: [
                { key: "dependency", isPublic: false, version: 2 },
                { key: "dependency", isPublic: false, version: "LATEST" },
                { ...pinned, signature: "another-artifact" },
                pinned,
              ],
            },
          ],
        }),
        components,
      ),
    );
    expect(result.flows[0].supplementalComponents).toEqual([
      { key: "dependency", isPublic: false, version: 2 },
      { key: "dependency", isPublic: false, version: "LATEST" },
      { ...pinned, signature: "another-artifact" },
      pinned,
    ]);
  });

  it("rejects conflicting installed artifacts for the same component identity", () => {
    expect(() =>
      pinComponentSignatures("flows: []", [...components, { ...pinned, signature: "other" }]),
    ).toThrow(/conflicting package signatures/);
  });

  it.each([
    { available: [] },
    { available: [{ ...pinned, isPublic: true }] },
  ])("rejects unresolved self references", ({ available }) => {
    expect(() =>
      pinComponentSignatures(
        dumpYaml({ requiredConfigVars: [{ connection: { component: selector } }] }),
        available,
      ),
    ).toThrow(/no matching published package/);
  });

  it("pins the CNI wrapper independently of dependency self references", () => {
    const cni = { key: "cni", isPublic: false, signature: "cni-hash" };
    const result = loadYaml<any>(
      pinComponentSignatures(
        dumpYaml({
          flows: [
            {
              steps: [
                { action: { component: { key: "cni", isPublic: false, version: "LATEST" } } },
                { action: { component: selector } },
              ],
            },
          ],
        }),
        components,
        cni,
      ),
    );
    expect(result.flows[0].steps.map((step: any) => step.action.component)).toEqual([cni, pinned]);
  });
});

it("records declared components without selectors and preserves other import metadata", () => {
  const result = loadYaml<any>(
    pinComponentSignatures(
      dumpYaml({
        flows: [],
        importMetadata: { convertedFromLowCode: true, componentDependencies: [{ key: "stale" }] },
      }),
      [pinned, pinned, { ...pinned, isPublic: true }],
      {
        key: "cni",
        isPublic: false,
        signature: "wrapper",
      },
    ),
  );
  expect(result.importMetadata).toEqual({
    convertedFromLowCode: true,
    componentDependencies: [pinned, { ...pinned, isPublic: true }],
  });
  expect(loadYaml<any>(pinComponentSignatures(dumpYaml(result), [])).importMetadata).toEqual({
    convertedFromLowCode: true,
    componentDependencies: [],
  });
});
