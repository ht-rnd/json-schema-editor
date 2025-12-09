import Ajv2020, { type ErrorObject } from "ajv/dist/2020";
import addFormats from "ajv-formats";
import type { JSONSchema } from "./types";

const META_SCHEMA_URI = "https://json-schema.org/draft/2020-12/schema";

const ajv = new Ajv2020();
addFormats(ajv);

/**
 * Validates a JSON Schema against the JSON Schema meta-schema (draft 2020-12).
 *
 * @param schema - The JSON Schema to validate
 * @returns Array of validation errors, or null if valid
 */
export function validateSchema(schema: JSONSchema): ErrorObject[] | null {
  const isValid = ajv.validate(META_SCHEMA_URI, schema);

  if (isValid) {
    return null;
  }

  return ajv.errors || [];
}
