import { describe, expect, it } from "vitest";
import { dumpYaml, loadYaml } from "../serialize.js";
import { pinComponentSignatures } from "./signatures.js";

const selector = { key: "dependency", isPublic: false, version: "LATEST" };
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
    const other = { ...selector, key: "other" };
    const publicSelector = { ...selector, isPublic: true };
    const result = loadYaml<any>(
      pinComponentSignatures(
        dumpYaml({ flows: [{ supplementalComponents: [selector, other, publicSelector] }] }),
        components,
      ),
    );
    expect(result.flows[0].supplementalComponents).toEqual([pinned, other, publicSelector]);
  });

  it("selects the installed artifact instead of a numeric version, and preserves an already matching signature", () => {
    const result = loadYaml<any>(
      pinComponentSignatures(
        dumpYaml({ flows: [{ supplementalComponents: [{ ...selector, version: 2 }, pinned] }] }),
        components,
      ),
    );
    expect(result.flows[0].supplementalComponents).toEqual([pinned, pinned]);
  });

  it("rejects conflicting installed artifacts for the same component identity", () => {
    expect(() =>
      pinComponentSignatures("flows: []", [...components, { ...pinned, signature: "other" }]),
    ).toThrow(/conflicting package signatures/);
  });

  it("rejects a preexisting signature that disagrees with the installed artifact", () => {
    expect(() =>
      pinComponentSignatures(
        dumpYaml({ flows: [{ supplementalComponents: [{ ...pinned, signature: "other" }] }] }),
        components,
      ),
    ).toThrow(/rebuild the integration/);
  });
});
