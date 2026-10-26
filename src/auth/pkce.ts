import { createHash, randomBytes } from "node:crypto";

export const codeChallenge = (verifier: string): string =>
  createHash("sha256").update(verifier, "ascii").digest("base64url");

/** Each authorization attempt has independent verifier and CSRF state values. */
export const createPkce = () => {
  const verifier = randomBytes(32).toString("base64url");
  return {
    verifier,
    challenge: codeChallenge(verifier),
    state: randomBytes(32).toString("base64url"),
  };
};
