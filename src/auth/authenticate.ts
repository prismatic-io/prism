import open from "open";
import { commandSignal, writeCommandOutput } from "../command.js";
import { createCallbackServer } from "./callback-server.js";
import { withAuthOperation } from "./operation.js";
import { createPkce } from "./pkce.js";
import { authorizationUrl, exchangeCode, logoutUrl, refreshToken } from "./transport.js";
import type { Auth, AuthenticationOptions } from "./types.js";

/** An external-browser PKCE flow. Each call owns its listener and transaction. */
export class Authenticate {
  constructor(private readonly options: AuthenticationOptions) {}

  async login(props?: {
    url?: boolean;
    signal?: AbortSignal;
    onChallenge?: (url: string) => void;
  }): Promise<Auth> {
    return withAuthOperation(props?.signal ?? commandSignal(), async (signal) => {
      const { verifier, challenge, state } = createPkce();
      const callback = await createCallbackServer({
        state,
        signal,
        successRedirectUri: this.options.successRedirectUri,
      });
      try {
        signal.throwIfAborted();
        const url = authorizationUrl(this.options, {
          challenge,
          state,
          redirectUri: callback.redirectUri,
        });
        const presentation = props?.url
          ? Promise.resolve().then(() => {
              signal.throwIfAborted();
              if (props.onChallenge) props.onChallenge(url);
              else writeCommandOutput(url);
            })
          : open(url);
        const [, code] = await Promise.all([presentation, callback.code]);
        signal.throwIfAborted();
        const auth = await exchangeCode(this.options, {
          verifier,
          code,
          redirectUri: callback.redirectUri,
          signal,
        });
        signal.throwIfAborted();
        await callback.complete(true);
        signal.throwIfAborted();
        return auth;
      } catch (error) {
        await callback.complete(false);
        throw error;
      } finally {
        await callback.close();
      }
    });
  }

  async refresh(token: string, tenantId?: string, signal = commandSignal()): Promise<Auth> {
    return withAuthOperation(signal, (operationSignal) =>
      refreshToken(this.options, token, tenantId, operationSignal),
    );
  }

  async logout(): Promise<void> {
    await open(logoutUrl(this.options));
  }
}
