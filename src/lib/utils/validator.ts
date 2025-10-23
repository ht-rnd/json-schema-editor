import Ajv2020, { ErrorObject } from "ajv/dist/2020";
import addFormats from "ajv-formats";
import { JSONSchema } from "../hooks/useSchemaForm";

const META_SCHEMA_URI = "https://json-schema.org/draft/2020-12/schema";

const ajv = new Ajv2020();
addFormats(ajv);

export function validateSchema(schema: JSONSchema): ErrorObject[] | null {
  const isValid = ajv.validate(META_SCHEMA_URI, schema);

  if (isValid) {
    return null;
  }

  return ajv.errors || [];
}
