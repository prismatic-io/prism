import { randomInt } from "node:crypto";
import type { Server } from "node:http";

// These ports and the localhost root URL are registered in the Auth0 client.
const FIRST_CALLBACK_PORT = 59400;
const CALLBACK_PORT_COUNT = 51;

export function callbackPorts(start = randomInt(CALLBACK_PORT_COUNT)): number[] {
  return Array.from(
    { length: CALLBACK_PORT_COUNT },
    (_, index) => FIRST_CALLBACK_PORT + ((start + index) % CALLBACK_PORT_COUNT),
  );
}

const listen = (server: Server, port: number, signal: AbortSignal): Promise<void> =>
  new Promise((resolve, reject) => {
    const cleanup = () => {
      server.removeListener("error", failed);
      server.removeListener("listening", listening);
      signal.removeEventListener("abort", aborted);
    };
    const failed = (error: Error) => {
      cleanup();
      reject(error);
    };
    const listening = () => {
      cleanup();
      resolve();
    };
    const aborted = () => {
      // close() also cancels a pending hostname lookup before it can bind.
      server.close();
      failed(signal.reason);
    };
    signal.throwIfAborted();
    server.once("error", failed);
    server.once("listening", listening);
    signal.addEventListener("abort", aborted, { once: true });
    try {
      // Own the abort listener per attempt: listen({signal}) retains one until
      // server.close(), accumulating listeners across failed bind attempts.
      server.listen({ port, host: "localhost" });
    } catch (error) {
      failed(error as Error);
    }
  });

/** Bind and retain the actual listener; never probe a port and then release it. */
export async function bindCallbackServer(server: Server, signal: AbortSignal): Promise<URL> {
  for (const port of callbackPorts()) {
    signal.throwIfAborted();
    try {
      await listen(server, port, signal);
      signal.throwIfAborted();
    } catch (error) {
      if (signal.aborted) {
        server.close();
        throw signal.reason;
      }
      if ((error as NodeJS.ErrnoException).code === "EADDRINUSE") continue;
      throw error;
    }
    const address = server.address();
    if (
      !address ||
      typeof address === "string" ||
      (address.address !== "::1" && !/^127\./.test(address.address))
    ) {
      server.close();
      throw new Error("Authentication callback must listen on a loopback address.");
    }
    return new URL(`http://localhost:${address.port}/`);
  }
  throw new Error("No authentication callback port is available in 59400–59450.");
}
