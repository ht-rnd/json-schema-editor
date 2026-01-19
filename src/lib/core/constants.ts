export const SCHEMA_TYPES = ["string", "integer", "number", "boolean", "object", "array"] as const;

export const SCHEMA_TYPES_WITH_REF = [...SCHEMA_TYPES, "ref"] as const;

export type SchemaTypeValue = (typeof SCHEMA_TYPES)[number];

export type SchemaTypeWithRefValue = (typeof SCHEMA_TYPES_WITH_REF)[number];

export const INTEGER_FORMATS = ["int-32", "int-64"] as const;

export const NUMBER_FORMATS = ["float", "double", "big-decimal"] as const;

export const STRING_FORMATS = [
  "date",
  "date-time",
  "local-date-time",
  "time",
  "duration",
  "email",
  "hostname",
  "ipv4",
  "ipv6",
  "password",
  "html",
  "json",
  "json-path",
  "uri",
  "uri-refrence",
  "uri-template",
  "relative-json-pointer",
  "json-pointer",
  "regex",
  "uuid",
] as const;

export const DEFAULT_SCHEMA_URI = "http://json-schema.org/draft/2020-12/schema";

export const createDefaultObjectSchema = () => ({
  type: "object" as const,
  $schema: DEFAULT_SCHEMA_URI,
  additionalProperties: true,
});

export const createDefaultArraySchema = () => ({
  type: "array" as const,
  $schema: DEFAULT_SCHEMA_URI,
  items: { type: "string" as const },
});

export const createDefaultField = (id: string) => ({
  id,
  key: `field_${id}`,
  isRequired: false,
  schema: { type: "string" as const },
});
