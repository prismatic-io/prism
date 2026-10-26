import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { bindCallbackServer } from "./ports.js";

export interface CallbackServer {
  redirectUri: string;
  code: Promise<string>;
  complete(success: boolean): Promise<void>;
  close(): Promise<void>;
}

type AuthorizationResponse = { code: string } | { error: true };

const parseCallback = (
  request: IncomingMessage,
  redirect: URL,
  state: string,
): AuthorizationResponse | undefined => {
  if (request.method !== "GET" || request.headers.host !== redirect.host) return;
  // Only origin-form requests to the registered root path are callbacks.
  if (!request.url?.startsWith("/?")) return;
  const url = new URL(request.url, redirect);
  if (url.origin !== redirect.origin || url.pathname !== "/" || url.hash) return;
  const params = url.searchParams;
  if (params.getAll("state").length !== 1 || params.get("state") !== state) return;
  if (
    ["code", "error", "error_description", "error_uri"].some((key) => params.getAll(key).length > 1)
  )
    return;
  if (params.has("code") && params.has("error")) return;
  if (params.get("code")) return { code: params.get("code") as string };
  if (params.get("error")) return { error: true };
};

const respond = (response: ServerResponse, status: number, message: string, location?: string) => {
  response.writeHead(status, {
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "no-store",
    "Referrer-Policy": "no-referrer",
    Connection: "close",
    ...(location ? { Location: location } : {}),
  });
  response.end(message);
};

/** Owns callback validation, one-time acceptance, browser responses, and socket cleanup. */
export async function createCallbackServer(options: {
  state: string;
  signal: AbortSignal;
  successRedirectUri?: string;
}): Promise<CallbackServer> {
  const { state, signal, successRedirectUri = "https://prismatic.io" } = options;
  signal.throwIfAborted();
  let resolveCode!: (code: string) => void;
  let rejectCode!: (error: unknown) => void;
  const code = new Promise<string>((resolve, reject) => {
    resolveCode = resolve;
    rejectCode = reject;
  });
  // Cancellation can happen while the caller is opening the browser.
  void code.catch(() => {});
  let claimed = false;
  let closed = false;
  let callbackResponse: ServerResponse | undefined;
  let redirect: URL | undefined;
  let closing: Promise<void> | undefined;
  const server = createServer(
    { maxHeaderSize: 8192, headersTimeout: 5000, requestTimeout: 10000 },
    (request, response) => {
      if (closed || claimed || signal.aborted || !redirect) {
        respond(response, 400, "Authentication callback is no longer available.");
        return;
      }
      const result = parseCallback(request, redirect, state);
      if (!result) {
        respond(response, 400, "Invalid authentication callback.");
        return;
      }
      claimed = true;
      callbackResponse = response;
      stopAccepting();
      if ("error" in result) {
        rejectCode(new Error("Authorization was denied or could not be completed."));
        void complete(false);
      } else {
        resolveCode(result.code);
      }
    },
  );
  const stopAccepting = () => {
    closing ??= new Promise<void>((resolve) => server.close(() => resolve()));
    return closing;
  };
  const close = async () => {
    closed = true;
    rejectCode(new Error("Authentication callback was closed."));
    signal.removeEventListener("abort", aborted);
    const stopped = stopAccepting();
    server.closeAllConnections();
    await stopped;
  };
  const complete = async (success: boolean) => {
    if (closed) return;
    closed = true;
    rejectCode(new Error("Authentication callback was closed."));
    if (callbackResponse && !callbackResponse.destroyed && !callbackResponse.writableEnded) {
      respond(
        callbackResponse,
        success ? 302 : 400,
        success
          ? "Authentication completed. Return to Prism."
          : "Authentication failed. Return to Prism.",
        success ? successRedirectUri : undefined,
      );
    }
    // Give the browser response time to flush, without retaining slow/partial requests.
    const forceClose = setTimeout(() => server.closeAllConnections(), 250);
    try {
      await stopAccepting();
    } finally {
      clearTimeout(forceClose);
      signal.removeEventListener("abort", aborted);
    }
  };
  const aborted = () => {
    rejectCode(signal.reason);
    void close();
  };
  // Startup errors belong to the allocator; runtime errors belong to this transaction.
  server.on("error", (error) => {
    if (redirect) {
      rejectCode(error);
      void close();
    }
  });
  try {
    redirect = await bindCallbackServer(server, signal);
    signal.addEventListener("abort", aborted, { once: true });
    signal.throwIfAborted();
  } catch (error) {
    rejectCode(error);
    await close();
    throw error;
  }
  return { redirectUri: redirect.href, code, complete, close };
}
