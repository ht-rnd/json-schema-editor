// Headless JSON Schema Editor
// This package exports only the core logic - no UI components or styles

export {
  createDefaultArraySchema,
  createDefaultField,
  createDefaultObjectSchema,
  DEFAULT_SCHEMA_URI,
  type FieldItem,
  type FormSchema,
  // Zod schemas
  formSchema,
  // Transforms
  formToSchema,
  INTEGER_FORMATS,
  type JSONSchema,
  type JsonSchemaEditorOptions,
  jsonSchemaZod,
  NUMBER_FORMATS,
  // Constants
  SCHEMA_TYPES,
  type SchemaType,
  type SchemaTypeValue,
  type SettingsState,
  STRING_FORMATS,
  schemaToForm,
  // Types
  type UseJsonSchemaEditorReturn,
  // Core hook
  useJsonSchemaEditor,
  // Validation
  validateSchema,
} from "./core";
