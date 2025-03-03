import { OpenAPI, OpenAPIV3, OpenAPIV3_1 } from "openapi-types";
import { startCase, merge } from "lodash-es";
import { Input, cleanIdentifier, stripUndefined } from "../../utils.js";
import { InputFieldChoice, InputFieldCollection, InputFieldType } from "@prismatic-io/spectral";

type ParameterObject = OpenAPIV3.ParameterObject | OpenAPIV3_1.ParameterObject;

type InputType = {
  type: InputFieldType;
  cleanFn: string;
  cleanReturnType?: string;
  allowOptional?: boolean;
  collection?: InputFieldCollection;
};

const toInputType: {
  [x: string]: InputType;
} = {
  string: {
    type: "string",
    cleanFn: "toString",
    cleanReturnType: "string",
    allowOptional: true,
  },
  integer: {
    type: "string",
    cleanFn: "toNumber",
    cleanReturnType: "number",
    allowOptional: true,
  },
  number: {
    type: "string",
    cleanFn: "toNumber",
    cleanReturnType: "number",
    allowOptional: true,
  },
  boolean: {
    type: "boolean",
    cleanFn: "toBool",
    cleanReturnType: "boolean",
    allowOptional: false,
  },
};

const getInputModel = (
  schema: OpenAPIV3.SchemaObject | OpenAPIV3_1.SchemaObject,
): InputFieldChoice[] | undefined => {
  if (schema?.type === "boolean") {
    // No point generating model values for boolean
    return undefined;
  }

  const schemaItems =
    "items" in schema && schema.items && "enum" in schema.items ? schema.items.enum : undefined;
  if (schema?.enum || schemaItems) {
    return (schema?.enum || schemaItems || []).map<InputFieldChoice>((v) => ({
      label: startCase(v),
      value: v,
    }));
  }

  // Some schemas unnecessarily nest inside of an allOf so try to handle those.
  if (schema?.allOf?.[0] && !("$ref" in schema?.allOf?.[0])) {
    return (schema?.allOf?.[0]?.enum ?? []).map<InputFieldChoice>((v) => ({
      label: startCase(v),
      value: v,
    }));
  }

  return undefined;
};

const buildInput = (parameter: OpenAPI.Parameter, seenKeys: Set<string>): Input => {
  if ("$ref" in parameter) {
    throw new Error("$ref nodes are not supported.");
  }

  const schemaType = parameter.schema?.type;
  const { type, cleanFn, cleanReturnType, allowOptional } =
    toInputType[schemaType] ?? toInputType.string;

  const required = parameter.required || !allowOptional;
  const clean = required
    ? `(value): ${cleanReturnType} => util.types.${cleanFn}(value)`
    : `(value): ${cleanReturnType} | undefined => value !== undefined && value !== null ? util.types.${cleanFn}(value) : undefined`;

  const { name: paramKey } = parameter;
  const key = seenKeys.has(cleanIdentifier(paramKey))
    ? cleanIdentifier(`other ${paramKey}`)
    : cleanIdentifier(paramKey);
  seenKeys.add(key);

  const input = stripUndefined<Input>({
    upstreamKey: paramKey,
    key,
    label: startCase(paramKey),
    type,
    required,
    comments: parameter.description,
    default: parameter.schema?.default,
    example: parameter.schema?.example,
    model: getInputModel(parameter.schema),
    clean,
  });
  return input;
};

const getProperties = (
  schema: OpenAPIV3.SchemaObject | OpenAPIV3_1.SchemaObject,
): Record<string, OpenAPIV3.SchemaObject | OpenAPIV3_1.SchemaObject> => {
  return merge(
    schema.properties ?? {},
    ...(schema.allOf ?? []).map((v) => (v as any).properties), // FIXME: any usage
  ) as Record<string, OpenAPIV3.SchemaObject | OpenAPIV3_1.SchemaObject>;
};

const buildBodyInputs = (
  schema: OpenAPIV3.SchemaObject | OpenAPIV3_1.SchemaObject,
  seenKeys: Set<string>,
): Input[] => {
  const requiredKeys = new Set(schema.required ?? []);
  const properties = getProperties(schema);

  return Object.entries(properties)
    .filter(([, prop]) => !prop.readOnly) // Don't create inputs for readonly properties
    .map<Input>(([propKey, prop]) => {
      const schemaType = prop?.type;
      let inputType: InputType;

      if (schemaType === "array") {
        inputType = formatArrayInput(
          prop as OpenAPIV3.ArraySchemaObject | OpenAPIV3_1.ArraySchemaObject,
        );
      } else {
        inputType = toInputType[schemaType as string] ?? toInputType.string;
      }

      const { type, cleanFn, cleanReturnType, allowOptional, collection } = inputType;

      const required = requiredKeys.has(propKey) || !allowOptional;
      let clean: string | undefined;

      if (schemaType === "array") {
        clean = `(values) => ((values as string[]) || []).map((value) => util.types.${cleanFn}(value))`;
      } else {
        clean = required
          ? `(value): ${cleanReturnType} => util.types.${cleanFn}(value)`
          : `(value): ${cleanReturnType} | undefined => value !== undefined && value !== null ? util.types.${cleanFn}(value) : undefined`;
      }

      const key = seenKeys.has(cleanIdentifier(propKey))
        ? cleanIdentifier(`other ${propKey}`)
        : cleanIdentifier(propKey);
      seenKeys.add(key);

      return stripUndefined<Input>({
        upstreamKey: propKey,
        key,
        label: startCase(propKey),
        type,
        collection,
        required,
        comments: prop.description,
        default: prop.default,
        example: prop.example,
        model: getInputModel(prop),
        clean,
      });
    });
};

export const getInputs = (
  operation: OpenAPIV3.OperationObject | OpenAPIV3_1.OperationObject,
  sharedParameters: ParameterObject[] = [],
): {
  headerInputs: Input[];
  pathInputs: Input[];
  queryInputs: Input[];
  bodyInputs: Input[];
  payloadContentType: string;
} => {
  if (typeof operation.requestBody !== "undefined" && "$ref" in operation.requestBody) {
    throw new Error("All refs should be resolved before computing Inputs.");
  }

  const seenKeys = new Set<string>(["connection"]);

  // Merge in Path Item level parameters with the specific parameters to this Operation.
  // Some specs have the same input defined at path and at operation level. Dedupe them.
  const parameters = Object.values<ParameterObject>(
    [...sharedParameters, ...(operation.parameters ?? [])].reduce((result, p) => {
      // Refs are unsupported.
      if ("$ref" in p) {
        return result;
      }

      return { ...result, [p.name]: p };
    }, {}),
  );

  const headerInputs = (parameters ?? [])
    .filter((p) => p.in === "header")
    .map((p) => buildInput(p, seenKeys));

  const pathInputs = (parameters ?? [])
    .filter((p) => p.in === "path")
    .map((p) => buildInput(p, seenKeys));

  const queryInputs = (parameters ?? [])
    .filter((p) => p.in === "query")
    .map((p) => buildInput(p, seenKeys));

  const requestBodySchema = operation.requestBody?.content?.["application/json"]?.schema;
  if (typeof requestBodySchema !== "undefined" && "$ref" in requestBodySchema) {
    throw new Error("All refs should be resolved before computing Inputs.");
  }
  const bodyInputs =
    requestBodySchema === undefined ? [] : buildBodyInputs(requestBodySchema, seenKeys);

  return {
    headerInputs,
    pathInputs,
    queryInputs,
    bodyInputs,
    payloadContentType: "application/json",
  };
};

const formatArrayInput = (schema: OpenAPIV3.ArraySchemaObject | OpenAPIV3_1.ArraySchemaObject) => {
  const { items } = schema;
  if ("type" in items) {
    if (items.type === "object") {
      // TODO: Inputs that are arrays of objects with validations on the object are not in scope
      // at this time. This approach provides bare bones support.
      return {
        type: "code" as InputFieldType,
        language: "json",
        cleanFn: "toObject",
      };
    } else {
      const type = items.type as unknown as InputFieldType;
      return {
        type,
        collection: "valuelist" as InputFieldCollection,
        required: "minimum" in items && items.minimum,
        cleanFn: type in toInputType ? toInputType[type].cleanFn : toInputType.string.cleanFn,
      };
    }
  } else {
    return toInputType.string;
  }
};
