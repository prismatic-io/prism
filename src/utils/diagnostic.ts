import { getRuntimeEnvironment } from "../runtime.js";

const LIMIT = 8192;

/** Diagnostics can contain third-party request dumps; successful command data is untouched. */
export const diagnosticText = (
  value: string,
  environment: NodeJS.ProcessEnv = getRuntimeEnvironment(),
): string => {
  let text = value;
  for (const [name, secret] of Object.entries(environment)) {
    if (secret && /(?:TOKEN|PASSWORD|SECRET|API_KEY|AUTHORIZATION)$/i.test(name))
      text = text.replaceAll(secret, "[REDACTED]");
  }
  text = text
    .replace(
      /(["']?(?:authorization|proxy-authorization|x-api-key|cookie|set-cookie|password|client_secret|access_token|refresh_token)["']?\s*[:=]\s*)(["'])([^\n]*?)\2/gi,
      "$1$2[REDACTED]$2",
    )
    .replace(/\b(Bearer|Basic)\s+[^\s'"`,;\\]+/gi, "$1 [REDACTED]")
    .replace(/\beyJ[\w-]+\.[\w-]+\.[\w-]+\b/g, "[REDACTED]");
  return text.length > LIMIT ? `${text.slice(0, LIMIT)}\n[diagnostic truncated]` : text;
};
