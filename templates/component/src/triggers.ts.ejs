/**
 * A trigger determines what to do with a flow is invoked. Triggers
 * are often invoked on a schedule, or by a webhook request. In this
 * example trigger, we expect a webhook request that is signed with
 * an HMAC signing key, and we reject requests that are not signed correctly.
 *
 * For information on custom triggers, see
 * https://prismatic.io/docs/custom-connectors/triggers/
 */

import crypto from "node:crypto";
import { util, trigger, input } from "@prismatic-io/spectral";

export const exampleTrigger = trigger({
  display: {
    label: "Example Trigger",
    description: "This example trigger verifies HMAC signatures",
  },
  inputs: {
    acmeConnection: input({
      label: "Acme Connection",
      required: true,
      type: "connection",
    }),
  },
  perform: async (context, payload, params) => {
    const hmacSecretKey = util.types.toString(
      params.acmeConnection.fields.apiKey
    );
    const { "x-hmac-256": hmacSignature } = payload.headers;

    // Compute the HMAC hash of the request using the connection's API key
    const hash = crypto
      .createHmac("sha256", hmacSecretKey)
      .update(util.types.toString(payload.rawBody.data))
      .digest("hex");

    if (hmacSignature !== hash) {
      throw new Error("Incorrect HMAC signature");
    }

    return Promise.resolve({ payload });
  },
  synchronousResponseSupport: "valid",
  scheduleSupport: "valid",
});

export default { exampleTrigger };
