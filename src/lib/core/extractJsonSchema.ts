import type { JSONSchema } from "./types";

const looksLikeJsonSchema = (value: unknown): value is JSONSchema => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const schema = value as Record<string, unknown>;
  return (
    typeof schema.type === "string" ||
    typeof schema.$schema === "string" ||
    typeof schema.$ref === "string" ||
    schema.properties != null ||
    schema.$defs != null ||
    schema.definitions != null ||
    schema.items != null ||
    schema.anyOf != null ||
    schema.allOf != null ||
    schema.oneOf != null
  );
};

const rewriteRefs = (value: unknown, prefix: string): unknown => {
  if (Array.isArray(value)) {
    return value.map((item) => rewriteRefs(item, prefix));
  }

  if (!value || typeof value !== "object") {
    return value;
  }

  const result: Record<string, unknown> = {};
  for (const [key, child] of Object.entries(value)) {
    if (key === "$ref" && typeof child === "string" && child.startsWith(prefix)) {
      result[key] = `#/$defs/${child.slice(prefix.length)}`;
    } else {
      result[key] = rewriteRefs(child, prefix);
    }
  }
  return result;
};

/**
 * Accepts a raw JSON Schema or a wrapper document that contains one
 * (e.g. a ServiceSpecification with `targetEntitySchema`).
 */
export function extractJsonSchema(input: unknown): JSONSchema {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("JSON must be an object.");
  }

  const doc = input as Record<string, unknown>;
  let schema: unknown = doc;
  let refPrefix = "#/$defs/";

  if (looksLikeJsonSchema(doc.targetEntitySchema)) {
    schema = doc.targetEntitySchema;
    refPrefix = "#/targetEntitySchema/$defs/";
  } else if (!looksLikeJsonSchema(doc)) {
    throw new Error(
      "Could not find a JSON Schema. Paste a schema directly, or a document with targetEntitySchema.",
    );
  }

  return rewriteRefs(schema, refPrefix) as JSONSchema;
}
