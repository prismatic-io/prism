/**
 * Your actions, trigger and data sources likely connect to third-party
 * APIs. In this file, you will see an example of how to set up a reusable,
 * authenticated HTTP client that actions, triggers and data sources can use.
 *
 * The createAcmeClient receives a connection that was created when a
 * customer completed the configuration wizard. The API key and base URL
 * from that connection are used to create the HTTP client.
 *
 * For more information about reusable HTTP clients, see
 * https://prismatic.io/docs/custom-connectors/get-started/wrap-an-api/#creating-a-shared-http-client
 */

import { type Connection, util } from "@prismatic-io/spectral";
import { createClient } from "@prismatic-io/spectral/dist/clients/http";

export function createAcmeClient(acmeConnection: Connection) {
  const { apiKey, baseUrl } = acmeConnection.fields;

  return createClient({
    baseUrl: util.types.toString(baseUrl),
    headers: {
      Accept: "application/json", // Our API returns JSON
      Authorization: `Bearer ${apiKey}`,
    },
  });
}
