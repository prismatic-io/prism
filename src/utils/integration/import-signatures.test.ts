import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { temporaryDirectoryTask } from "tempy";
import { expect, it, vi } from "vitest";
import { withWorkingDirectory } from "../../command-context.js";
import { calculatePackageSignature } from "../component/signature.js";
import { dumpYaml, loadYaml } from "../serialize.js";
import { importCodeNativeIntegration } from "./import.js";
import { COMPONENT_SELF_SIGNATURE } from "./signatures.js";

const mocks = vi.hoisted(() => ({
  dependencies: vi.fn(),
  publish: vi.fn(async () => ({
    componentId: "cni-id",
    packageUploadUrl: "upload-url",
    connectionIconUploadUrls: {},
  })),
  upload: vi.fn(),
  wait: vi.fn(async () => true),
  gql: vi.fn(),
}));
vi.mock("../component/dependencies.js", async (original) => ({
  ...(await original<typeof import("../component/dependencies.js")>()),
  publishComponentDependencies: mocks.dependencies,
}));
vi.mock("../component/publish.js", async (original) => ({
  ...(await original<typeof import("../component/publish.js")>()),
  publishDefinition: mocks.publish,
  uploadFile: mocks.upload,
  uploadConnectionIcons: vi.fn(),
}));
vi.mock("../availability.js", async (original) => ({
  ...(await original<typeof import("../availability.js")>()),
  waitForComponentVersion: mocks.wait,
}));
vi.mock("../../graphql.js", () => ({ gqlRequest: mocks.gql }));

it("resolves dependency self references at publication and pins the CNI without changing its bundled artifact", async () => {
  await temporaryDirectoryTask(async (root) => {
    await mkdir(join(root, "dist"));
    await mkdir(join(root, ".spectral"));
    await writeFile(join(root, "package.json"), '{"name":"integration"}');
    const dependency = { key: "dependency", isPublic: false, signature: COMPONENT_SELF_SIGNATURE };
    const cni = { key: "cni", isPublic: false, version: "LATEST" };
    const yaml = dumpYaml({
      isCodeNative: true,
      requiredConfigVars: [
        {
          key: "Connection",
          dataType: "connection",
          connection: { key: "apiKey", component: dependency },
        },
        {
          key: "Manifest Connection",
          dataType: "connection",
          connection: {
            key: "apiKey",
            component: { key: "dependency", isPublic: false, version: 2 },
          },
        },
      ],
      flows: [
        {
          name: "Flow",
          steps: [
            { isTrigger: true, action: { key: "trigger", component: cni } },
            { action: { key: "execute", component: cni } },
          ],
          supplementalComponents: [dependency],
        },
      ],
    });
    const bundle = `module.exports = { default: {
      key: "cni", display: { label: "CNI", description: "Test" },
      actions: { execute: { perform() {} } }, triggers: { trigger: { perform() {} } },
      codeNativeIntegrationYAML: ${JSON.stringify(yaml)}
    } };`;
    await writeFile(join(root, "dist", "index.js"), bundle);
    mocks.dependencies.mockResolvedValue([
      {
        name: "dependency-package",
        key: "dependency",
        isPublic: false,
        signature: "dependency-hash",
        status: "unchanged",
      },
    ]);
    mocks.gql.mockResolvedValue({
      importIntegration: {
        integration: {
          id: "integration-id",
          testConfigVariables: { nodes: [] },
          systemInstance: { id: "instance-id", flowConfigs: { nodes: [] } },
        },
      },
    });

    await expect(withWorkingDirectory(root, () => importCodeNativeIntegration())).resolves.toEqual({
      integrationId: "integration-id",
      componentId: "cni-id",
    });
    const uploadedPackage = mocks.upload.mock.calls[0][0] as string;
    const cniSignature = await calculatePackageSignature(uploadedPackage);
    const [{ variables }] = mocks.gql.mock.calls[0];
    const imported = loadYaml<any>(variables.definition);
    expect(imported.requiredConfigVars[0].connection.component).toEqual({
      key: "dependency",
      isPublic: false,
      signature: "dependency-hash",
    });
    expect(imported.requiredConfigVars[1].connection.component).toEqual({
      key: "dependency",
      isPublic: false,
      version: 2,
    });
    expect(imported.flows[0].supplementalComponents[0]).toEqual({
      key: "dependency",
      isPublic: false,
      signature: "dependency-hash",
    });
    for (const step of imported.flows[0].steps) {
      expect(step.action.component).toEqual({
        key: "cni",
        isPublic: false,
        signature: cniSignature,
      });
    }
    expect(mocks.wait).toHaveBeenCalledWith("cni-id", { timeoutSeconds: 300 });
    // The imported definition is rewritten in memory, not inside the zip being hashed.
    const { readFile } = await import("node:fs/promises");
    expect(await readFile(join(root, "dist", "index.js"), "utf8")).toBe(bundle);
  });
});
