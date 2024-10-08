import { OpenAPIV3, OpenAPIV3_1 } from "openapi-types";
import { camelCase, isEmpty, startCase } from "lodash-es";
import { getInputs } from "./inputs.js";
import { Action, Input, cleanIdentifier, stripUndefined } from "../../utils.js";
import { WriterFunction } from "ts-morph";
import { toGroupTag } from "./util.js";

const buildPerformFunction = (
  pathTemplate: string,
  verb: string,
  headerInputs: Input[],
  pathInputs: Input[],
  queryInputs: Input[],
  bodyInputs: Input[],
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
    .replace(/{([^}]+)}/g, (_, match) => `\${${match}}`);

  // Query param inputs need to be converted to the upstream key expectations.
  const queryMapping = queryInputs
    .map(({ key, upstreamKey }) => (key === upstreamKey ? key : `"${upstreamKey}": ${key}`))
    .join(", ");

  // Body inputs need to be converted to the upstream key expectations.
  const bodyMapping = bodyInputs.map(({ key, upstreamKey }) =>
    key === upstreamKey ? key : `"${upstreamKey}": ${key}`,
  );

  const includesConfig = !isEmpty(queryMapping) || !isEmpty(headerMapping);

  return (writer) =>
    writer
      .writeLine(`async (context, { connection, ${destructureNames} }) => {`)
      .blankLineIfLastNot()
      .writeLine("const client = createClient(connection);")
      .write("const {data} = await client.")
      .write(verb)
      .write("(`")
      .write(path)
      .write("`")
      .conditionalWrite(["post", "put", "patch"].includes(verb), () => `, { ${bodyMapping} }`)
      .conditionalWrite(includesConfig, () => ", { ")
      .conditionalWrite(!isEmpty(queryMapping), () => `params: { ${queryMapping} }`)
      .conditionalWrite(!isEmpty(queryMapping) && !isEmpty(headerMapping), () => ", ")
      .conditionalWrite(!isEmpty(headerMapping), () => `headers: { ${headerMapping} }`)
      .conditionalWrite(includesConfig, () => " } ")
      .write(");")
      .writeLine("return {data};")
      .writeLine("}");
};

const buildAction = (
  path: string,
  verb: string,
  operation: OpenAPIV3.OperationObject | OpenAPIV3_1.OperationObject,
  sharedParameters: (OpenAPIV3.ParameterObject | OpenAPIV3_1.ParameterObject)[] = [],
): Action => {
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
      connection: { label: "Connection", type: "connection", required: true },
      ...inputs,
    },
    perform: buildPerformFunction(path, verb, headerInputs, pathInputs, queryInputs, bodyInputs),
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
): Action[] => {
  // TODO: Figure out how to refine types down to V3+ and also how to
  // filter out Reference types throughout.
  const sharedParameters = operations.parameters as (
    | OpenAPIV3.ParameterObject
    | OpenAPIV3_1.ParameterObject
  )[];
  return Object.entries(operations)
    .filter(([verb]) => httpVerbs.has(verb))
    .map<Action>(([verb, op]) => buildAction(path, verb, op as any, sharedParameters));
};
