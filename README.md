# @ht-rnd/json-schema-editor

A powerful **headless** JSON Schema editor for React. Build fully customized editors with complete UI control while leveraging battle-tested logic, validation, and state management.

> **Headless Architecture**: Core logic via npm + optional copy-paste UI components. Use our pre-built Shadcn/ui components or build your own interface.

## Features

- **JSON Schema Draft 2020-12** - Full specification support
- **All Types** - string, number, integer, boolean, object, array, $ref
- **Nested Schemas** - Unlimited depth for objects and arrays
- **$defs Support** - Reusable definitions with `$ref`
- **Validation** - AJV-powered real-time validation
- **Combinators** - allOf, anyOf, oneOf, not
- **TypeScript** - Full type safety
- **Headless** - Zero UI dependencies in core

## Installation

```bash
npm install @ht-rnd/json-schema-editor
```

**Optional UI components**: Copy `components/ui/` from this repo to your project. Requires Radix UI and Tailwind CSS.

## Quick Start

### Option 1: Pre-built Components

```tsx
import { JsonSchemaEditor } from "@/components/ui/json-schema-editor";

function App() {
  return (
    <JsonSchemaEditor
      rootType="object"
      onChange={(schema) => console.log(schema)}
    />
  );
}
```

### Option 2: Headless Hook

```tsx
import { useJsonSchemaEditor } from "@ht-rnd/json-schema-editor";
import { FormProvider } from "react-hook-form";

function App() {
  const editor = useJsonSchemaEditor({
    rootType: "object",
    onChange: (schema) => console.log(schema),
  });

  return (
    <FormProvider {...editor.form}>
      <button onClick={editor.addField}>Add Field</button>
      {editor.fields.map((field, index) => (
        <div key={field.id}>
          <input value={field.key} />
          <button onClick={() => editor.removeField(index)}>Remove</button>
        </div>
      ))}
      <pre>{JSON.stringify(editor.schema, null, 2)}</pre>
    </FormProvider>
  );
}
```

## API Reference

### `useJsonSchemaEditor(options)`

Main hook for editor state management.

**Options:**
```typescript
{
  rootType?: "object" | "array";  // Default: "object"
  defaultValue?: JSONSchema;       // Load existing schema
  onChange?: (schema: JSONSchema) => void;
}
```

**Returns:**
```typescript
{
  // State
  schema: JSONSchema;
  errors: ErrorObject[] | null;
  fields: FieldItem[];
  definitions: DefinitionItem[];
  form: UseFormReturn;
  settingsState: { isOpen: boolean; fieldPath: string | null };
  
  // Actions
  addField: () => void;
  removeField: (index: number) => void;
  addDefinition: () => void;
  removeDefinition: (index: number) => void;
  openSettings: (path: string) => void;
  closeSettings: () => void;
  handleTypeChange: (path: string, type: string) => void;
  addNestedField: (parentPath: string) => void;
  reset: () => void;
}
```

### `JsonSchemaEditor` Component Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `rootType` | `"object" \| "array"` | `"object"` | Root schema type |
| `defaultValue` | `JSONSchema` | - | Initial schema to load |
| `onChange` | `(schema) => void` | - | Callback on schema change |
| `readOnly` | `boolean` | `false` | View-only mode |
| `showOutput` | `boolean` | `true` | Show/hide JSON output |
| `className` | `string` | - | Additional CSS classes |

### Exports

```typescript
// Main hook
export { useJsonSchemaEditor } from "@ht-rnd/json-schema-editor";

// Types
export type { JSONSchema, FieldItem, DefinitionItem, UseJsonSchemaEditorReturn };

// Utilities
export { validateSchema, formToSchema, schemaToForm };

// Constants
export { SCHEMA_TYPES, STRING_FORMATS, NUMBER_FORMATS, INTEGER_FORMATS };
```

## Examples

### Load Existing Schema

```tsx
const editor = useJsonSchemaEditor({
  rootType: "object",
  defaultValue: {
    type: "object",
    properties: {
      username: { type: "string", minLength: 3 },
      email: { type: "string", format: "email" },
      age: { type: "integer", minimum: 18 }
    },
    required: ["username", "email"]
  }
});
```

### Validate Data Against Schema

```tsx
import Ajv from "ajv";

const ajv = new Ajv();
const validate = ajv.compile(editor.schema);
const valid = validate({ username: "john", email: "john@example.com" });

if (!valid) console.log(validate.errors);
```

### Persist Schema Changes

```tsx
const editor = useJsonSchemaEditor({
  onChange: (schema) => {
    localStorage.setItem("schema", JSON.stringify(schema));
    // Or send to API
  }
});
```

## Contributing

Contributions welcome! See [GitHub](https://github.com/ht-rnd/json-schema-editor) for issues and PRs.

```bash
git clone https://github.com/ht-rnd/json-schema-editor.git
npm install
npm test
npm run demo
```

## License

Apache-2.0 © [HT-RND]

See [LICENSE](./LICENSE) for more details.
