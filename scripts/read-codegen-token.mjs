import { load } from "js-yaml";

// Human mode prints the token scalar; agent mode prints a named token result.
let input = "";
for await (const chunk of process.stdin) input += chunk;
const result = load(input);
const token = typeof result === "string" ? result : result?.token;
if (typeof token !== "string" || !token.trim()) {
  throw new Error("Prism did not return an authentication token for code generation.");
}
process.stdout.write(token.trim());
