import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { print } from "graphql";
import { temporaryDirectoryTask } from "tempy";
import { expect, it, vi } from "vitest";
import { calculatePackageSignature, findComponentBySignature } from "./signature.js";

const gqlRequest = vi.hoisted(() => vi.fn());
vi.mock("../../graphql.js", () => ({ gqlRequest }));

it("uses the existing SHA-1 package signature", async () => {
  await temporaryDirectoryTask(async (directory) => {
    const file = join(directory, "package.zip");
    await writeFile(file, "abc");
    expect(await calculatePackageSignature(file)).toBe("a9993e364706816aba3e25717850c26c9cd0d89d");
  });
});

it("looks up an exact signature across all versions, including older available artifacts", async () => {
  const component = { id: "old-version", signature: "hash", versionIsAvailable: true };
  gqlRequest.mockResolvedValueOnce({ components: { nodes: [component] } });
  expect(await findComponentBySignature({ key: "example", public: true }, "hash")).toEqual(
    component,
  );
  const [{ document, variables }] = gqlRequest.mock.calls[0];
  expect(variables).toEqual({ key: "example", public: true, signature: "hash" });
  expect(print(document)).toContain("allVersions: true");
  expect(print(document)).toContain("signature: $signature");
});

it("returns no match instead of falling back to the latest version", async () => {
  gqlRequest.mockResolvedValueOnce({ components: { nodes: [] } });
  expect(await findComponentBySignature({ key: "example" }, "hash")).toBeUndefined();
});
