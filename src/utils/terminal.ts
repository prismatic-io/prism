import terminalLink from "terminal-link";

// OSC 8 clickable link where supported; bare URL (no label) when piped/CI/dumb terminal.
export const hyperlink = (text: string, uri: string): string =>
  terminalLink(text, uri, { fallback: (_text, url) => url });
