import crypto from "node:crypto";
import { fs } from "../../fs.js";
import { Component3Document } from "../../graphql/operations/component3.generated.js";
import { gqlRequest } from "../../graphql.js";
import type { ComponentDefinition } from "./index.js";

/** Hash exactly the deterministic platform zip that Prism uploads. */
export const calculatePackageSignature = async (packagePath: string): Promise<string> =>
  crypto
    .createHash("sha1")
    .update(await fs.readFile(packagePath))
    .digest("hex");

/** A matching artifact may be an older version; never restrict this lookup to LATEST. */
export const findComponentBySignature = async (
  definition: Pick<ComponentDefinition, "key" | "public">,
  signature: string,
) => {
  const result = await gqlRequest({
    document: Component3Document,
    variables: { key: definition.key, public: definition.public ?? false, signature },
  });
  return result.components.nodes[0];
};

export const getPackageSignatureFromApi = async ({
  componentDefinition,
  packageSignature,
}: {
  componentDefinition: ComponentDefinition;
  packageSignature: string;
}): Promise<string | null> =>
  (await findComponentBySignature(componentDefinition, packageSignature))?.signature ?? null;
