/**
 * Your flows and data sources likely connect to third-party APIs.
 * In this file, you can set up reusable, authenticated HTTP clients
 * that flows and data sources can use.
 *
 * For more information about reusable HTTP clients, see
 * https://prismatic.io/docs/custom-connectors/get-started/wrap-an-api/#creating-a-shared-http-client
 */

import { type Connection, util } from "@prismatic-io/spectral";
import { createClient } from "@prismatic-io/spectral/dist/clients/http";

export function createApiClient(connection: Connection) {
  const { apiKey, baseUrl } = connection.fields;

  return createClient({
    baseUrl: util.types.toString(baseUrl),
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
  });
}