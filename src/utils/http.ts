import { fetch as undiciFetch, ProxyAgent, RequestInit } from "undici";

/**
 * Determines if a URL should use proxy based on NO_PROXY environment variable
 */
function shouldUseProxy(url: string): boolean {
  const noProxy = process.env.NO_PROXY || process.env.no_proxy;
  if (!noProxy) return true;

  const hostname = new URL(url).hostname;
  const noProxyList = noProxy.split(",").map((p) => p.trim());

  return !noProxyList.some((pattern) => {
    if (pattern.startsWith("*.")) {
      // Wildcard domain match
      return hostname.endsWith(pattern.slice(1));
    }
    return hostname === pattern;
  });
}

/**
 * Creates a fetch function with HTTP proxy support
 * Respects HTTP_PROXY, HTTPS_PROXY, and NO_PROXY environment variables
 */
export function createFetch() {
  const proxyUrl =
    process.env.HTTPS_PROXY ||
    process.env.https_proxy ||
    process.env.HTTP_PROXY ||
    process.env.http_proxy;

  if (proxyUrl) {
    const proxyAgent = new ProxyAgent(proxyUrl);

    return (url: string, options?: RequestInit) => {
      if (shouldUseProxy(url)) {
        return undiciFetch(url, { ...options, dispatcher: proxyAgent });
      }
      return undiciFetch(url, options);
    };
  }

  return undiciFetch;
}

/**
 * Default fetch instance with proxy support
 */
export const fetch = createFetch();
