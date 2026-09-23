import { camelCase, isEmpty, startCase } from "lodash-es";
import type { OpenAPIV3, OpenAPIV3_1 } from "openapi-types";
import type { WriterFunction } from "ts-morph";
import { cleanIdentifier } from "../../../../utils/identifier.js";
import { type Action, type Input, stripUndefined } from "../../utils.js";
import { getInputs } from "./inputs.js";
import { toGroupTag } from "./util.js";

const buildPerformFunction = (
  pathTemplate: string,
  verb: string,
  headerInputs: Input[],
  pathInputs: Input[],
  queryInputs: Input[],
  bodyInputs: Input[],
  hasConnection: boolean,
  binaryContentType?: string,
): WriterFunction => {
  const destructureNames = [...headerInputs, ...pathInputs, ...queryInputs, ...bodyInputs]
    .map(({ key }) => key)
    .join(", ");

  const headerMapping = headerInputs
    .map(({ key, upstreamKey }) => (key === upstreamKey ? key : `"${upstreamKey}": ${key}`))
    .join(", ");

  // Path inputs are handled by matching casing and using string interpolation.
  const path = pathInputs
    .reduce<string>(
      (result, { key, upstreamKey }) => result.replace(`{${upstreamKey}}`, `{${key}}`),
      pathTemplate,
    )
    // Update placeholder to interpolation syntax
    .replace(/{([^}]+)}/g, (_, match) => `\${encodeURIComponent(String(${match}))}`);

  // Query param inputs need to be converted to the upstream key expectations.
  const queryMapping = queryInputs
    .map(({ key, upstreamKey }) => (key === upstreamKey ? key : `"${upstreamKey}": ${key}`))
    .join(", ");

  // Body inputs need to be converted to the upstream key expectations.
  const bodyMapping = bodyInputs.map(({ key, upstreamKey }) =>
    key === upstreamKey ? key : `"${upstreamKey}": ${key}`,
  );

  const config = [
    !isEmpty(queryMapping) && `params: { ${queryMapping} }`,
    (!isEmpty(headerMapping) || binaryContentType) &&
      `headers: { ${[headerMapping, binaryContentType && `Accept: ${JSON.stringify(binaryContentType)}`].filter(Boolean).join(", ")} }`,
    binaryContentType && 'responseType: "arraybuffer"',
  ]
    .filter(Boolean)
    .join(", ");

  return (writer) =>
    writer
      .writeLine(
        `async (context, { ${[hasConnection && "connection", destructureNames].filter(Boolean).join(", ")} }) => {`,
      )
      .blankLineIfLastNot()
      .writeLine(`const client = await createClient(${hasConnection ? "connection" : ""});`)
      .write("const {data} = await client.")
      .write(verb)
      .write("(`")
      .write(path)
      .write("`")
      .conditionalWrite(["post", "put", "patch"].includes(verb), () => `, { ${bodyMapping} }`)
      .conditionalWrite(Boolean(config), () => `, { ${config} }`)
      .write(");")
      .writeLine(
        binaryContentType
          ? `return { data, contentType: ${JSON.stringify(binaryContentType)} };`
          : "return {data};",
      )
      .writeLine("}");
};

const buildAction = (
  path: string,
  verb: string,
  operation: OpenAPIV3.OperationObject | OpenAPIV3_1.OperationObject,
  sharedParameters: (OpenAPIV3.ParameterObject | OpenAPIV3_1.ParameterObject)[] = [],
  security: OpenAPIV3.SecurityRequirementObject[] = [],
): Action => {
  const effectiveSecurity = operation.security ?? security;
  const hasConnection = effectiveSecurity.some((option) => Object.keys(option).length > 0);
  const authRequired =
    effectiveSecurity.length > 0 &&
    !effectiveSecurity.some((option) => Object.keys(option).length === 0);
  const binaryContentType = Object.entries(operation.responses ?? {})
    .filter(([status]) => /^2[0-9X]{2}$/i.test(status))
    .flatMap(([, response]) =>
      "content" in response
        ? (Object.entries(response.content ?? {}) as [
            string,
            OpenAPIV3.MediaTypeObject | OpenAPIV3_1.MediaTypeObject,
          ][])
        : [],
    )
    .find(
      ([, media]) => media.schema && "format" in media.schema && media.schema.format === "binary",
    )?.[0];
  const operationName = cleanIdentifier(operation.operationId || `${verb} ${path}`);

  const { headerInputs, pathInputs, queryInputs, bodyInputs } = getInputs(
    operation,
    sharedParameters,
  );
  const groupTag = toGroupTag(operation.tags?.[0] ?? path);

  // Repackage inputs; need to ensure we camelCase to handle hyphenated identifiers.
  const inputs = [...headerInputs, ...pathInputs, ...queryInputs, ...bodyInputs].reduce(
    (result, i) => ({ ...result, [camelCase(i.key)]: i }),
    {},
  );

  const action = stripUndefined<Action>({
    key: operationName,
    groupTag,
    display: {
      label: startCase(operationName),
      description: operation.summary ?? operation.description ?? "TODO: Description",
    },
    inputs: {
      ...(hasConnection
        ? {
            connection: {
              label: "Connection",
              type: "connection" as const,
              required: authRequired,
            },
          }
        : {}),
      ...inputs,
    },
    perform: buildPerformFunction(
      path,
      verb,
      headerInputs,
      pathInputs,
      queryInputs,
      bodyInputs,
      hasConnection,
      binaryContentType,
    ),
  });
  return action;
};

// TODO: Derive from openapi-types HttpMethods instead.
const httpVerbs = new Set<string>([
  "get",
  "put",
  "post",
  "delete",
  "options",
  "head",
  "patch",
  "trace",
]);

export const operationsToActions = (
  path: string,
  operations: OpenAPIV3.PathItemObject | OpenAPIV3_1.PathItemObject,
  security: OpenAPIV3.SecurityRequirementObject[] = [],
): Action[] => {
  // TODO: Figure out how to refine types down to V3+ and also how to
  // filter out Reference types throughout.
  const sharedParameters = operations.parameters as (
    | OpenAPIV3.ParameterObject
    | OpenAPIV3_1.ParameterObject
  )[];
  return Object.entries(operations)
    .filter(([verb]) => httpVerbs.has(verb))
    .map<Action>(([verb, op]) => buildAction(path, verb, op as any, sharedParameters, security));
};
