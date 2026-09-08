import { load } from "js-yaml";

// Published Prism 10 prints the token scalar; native incur prints a named token result.
let input = "";
for await (const chunk of process.stdin) input += chunk;
const result = load(input);
const token = typeof result === "string" ? result : result?.token;
if (typeof token !== "string" || !token.trim()) {
  throw new Error("Prism did not return an authentication token for code generation.");
}
process.stdout.write(token.trim());
