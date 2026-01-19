import { z } from "zod";

const baseSchema = z.object({
  type: z.enum(["string", "number", "integer", "boolean", "object", "array", "ref"]).optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  default: z.any().optional(),
  minimum: z.number().optional(),
  maximum: z.number().optional(),
  exclusiveMin: z.number().optional(),
  exclusiveMax: z.number().optional(),
  multipleOf: z.number().optional(),
  minLength: z.number().optional(),
  maxLength: z.number().optional(),
  minContains: z.number().optional(),
  maxContains: z.number().optional(),
  minProperties: z.number().optional(),
  maxProperties: z.number().optional(),
  isModifiable: z.boolean().optional(),
  "x-modifiable": z.array(z.string()).optional(),
  pattern: z.string().optional(),
  format: z.string().optional(),
  minItems: z.number().optional(),
  maxItems: z.number().optional(),
  uniqueItems: z.boolean().optional(),
  enum: z.array(z.any()).optional(),
  $id: z.string().optional(),
  $schema: z.string().optional(),
  $ref: z.string().optional(),
});

export type JSONSchema = z.infer<typeof baseSchema> & {
  properties?: { [key: string]: JSONSchema };
  items?: JSONSchema | JSONSchema[];
  required?: string[];
  additionalProperties?: boolean | JSONSchema;
  allOf?: JSONSchema[];
  anyOf?: JSONSchema[];
  oneOf?: JSONSchema[];
  not?: JSONSchema;
  $defs?: { [key: string]: JSONSchema };
};

export const jsonSchemaZod: z.ZodType<JSONSchema> = baseSchema.extend({
  properties: z.lazy(() => z.record(z.string(), jsonSchemaZod)).optional(),
  items: z.lazy(() => z.union([jsonSchemaZod, z.array(jsonSchemaZod)])).optional(),
  required: z.array(z.string()).optional(),
  additionalProperties: z.lazy(() => z.union([z.boolean(), jsonSchemaZod])).optional(),
  allOf: z.lazy(() => z.array(jsonSchemaZod)).optional(),
  anyOf: z.lazy(() => z.array(jsonSchemaZod)).optional(),
  oneOf: z.lazy(() => z.array(jsonSchemaZod)).optional(),
  not: z.lazy(() => jsonSchemaZod).optional(),
  $defs: z.lazy(() => z.record(z.string(), jsonSchemaZod)).optional(),
});

export const formSchema = z.object({
  root: jsonSchemaZod,
  properties: z.array(
    z.object({
      id: z.string(),
      key: z.string().min(1),
      isRequired: z.boolean(),
      schema: jsonSchemaZod,
    }),
  ),
  definitions: z.array(
    z.object({
      id: z.string(),
      key: z.string().min(1),
      schema: jsonSchemaZod,
    }),
  ),
});

export type FormSchema = z.infer<typeof formSchema>;

export type SchemaType = "string" | "number" | "integer" | "boolean" | "object" | "array" | "ref";

export interface DefinitionItem {
  id: string;
  key: string;
  schema: JSONSchema;
}

export interface JsonSchemaEditorOptions {
  rootType?: "object" | "array";
  defaultValue?: JSONSchema;
  onChange?: (schema: JSONSchema) => void;
}

export interface SettingsState {
  isOpen: boolean;
  fieldPath: string | null;
}

export interface FieldItem {
  id: string;
  key: string;
  isRequired: boolean;
  schema: JSONSchema;
  fieldId: string;
}
