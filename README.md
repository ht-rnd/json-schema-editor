# @ht-rnd/json-schema-editor

A headless JSON Schema editor library for React. This package provides the core logic, hooks, and utilities for building JSON Schema editors, while allowing complete control over the UI.

## Architecture

This library follows the **headless UI pattern**:

- **NPM Package**: Contains only the headless core - hooks, types, validation, and utilities
- **Components Folder**: Contains copy-paste shadcn-style React components for the UI

## Installation

```bash
npm install @ht-rnd/json-schema-editor
```

### For UI Components

Copy the `components/json-schema-editor/` folder from this repository into your project. These components are designed to be customized and follow [shadcn/ui](https://ui.shadcn.com/) principles.

**Required peer dependencies for UI components:**

```bash
npm install @radix-ui/react-alert-dialog @radix-ui/react-checkbox @radix-ui/react-dialog \
  @radix-ui/react-label @radix-ui/react-radio-group @radix-ui/react-select \
  @radix-ui/react-separator @radix-ui/react-slot @radix-ui/react-tooltip \
  class-variance-authority clsx lucide-react tailwind-merge tailwindcss-animate
```

## Usage

### Option 1: Using the Headless Hook (Full Control)

Use the `useJsonSchemaEditor` hook directly for complete control over the UI:

```tsx
import { useJsonSchemaEditor, FormProvider } from "@ht-rnd/json-schema-editor";

function MyCustomEditor() {
  const editor = useJsonSchemaEditor({
    rootType: "object",
    onChange: (schema) => console.log("Schema changed:", schema),
  });

  return (
    <FormProvider {...editor.form}>
      <div>
        {/* Your custom UI here */}
        <pre>{JSON.stringify(editor.schema, null, 2)}</pre>
        
        <button onClick={editor.addField}>Add Field</button>
        
        {editor.fields.map((field, index) => (
          <div key={field.id}>
            {/* Render your custom field UI */}
            <button onClick={() => editor.removeField(index)}>Remove</button>
          </div>
        ))}

        {editor.errors && (
          <div>
            {editor.errors.map((error, i) => (
              <p key={i}>{error.message}</p>
            ))}
          </div>
        )}
      </div>
    </FormProvider>
  );
}
```

### Option 2: Using the Pre-built Components

Copy the components from `components/json-schema-editor/` and use them directly:

```tsx
import { JsonSchemaEditor } from "@/components/json-schema-editor";

function App() {
  return (
    <JsonSchemaEditor
      rootType="object"
      theme="light"
      readOnly={false}
      onChange={(schema) => console.log(schema)}
      styles={{
        form: { width: "full", height: "md" },
        output: { position: "bottom", showJson: true, width: "full", height: "md" },
      }}
    />
  );
}
```

### Option 3: Mix and Match

Use the headless hook with some pre-built components:

```tsx
import { useJsonSchemaEditor } from "@ht-rnd/json-schema-editor";
import { Root, FieldList, SettingsDialog } from "@/components/json-schema-editor";
import { FormProvider } from "react-hook-form";

function HybridEditor() {
  const editor = useJsonSchemaEditor({ rootType: "object" });

  return (
    <FormProvider {...editor.form}>
      <Root
        rootType="object"
        onAddField={editor.addField}
        onOpenSettings={editor.openSettings}
      />
      
      <FieldList
        fields={editor.fields}
        onRemove={editor.removeField}
        onOpenSettings={editor.openSettings}
      />

      {/* Your custom JSON output */}
      <textarea value={JSON.stringify(editor.schema, null, 2)} readOnly />

      <SettingsDialog
        isOpen={editor.settingsState.isOpen}
        fieldPath={editor.settingsState.fieldPath}
        onClose={editor.closeSettings}
      />
    </FormProvider>
  );
}
```

## API Reference

### `useJsonSchemaEditor(options)`

The main headless hook for managing JSON Schema editor state.

#### Options

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `rootType` | `"object" \| "array"` | `"object"` | Root schema type |
| `defaultValue` | `JSONSchema` | - | Initial schema value |
| `onChange` | `(schema: JSONSchema) => void` | - | Callback when schema changes |

#### Returns

| Property | Type | Description |
|----------|------|-------------|
| `schema` | `JSONSchema` | Current JSON Schema output |
| `errors` | `ErrorObject[] \| null` | AJV validation errors |
| `fields` | `FieldItem[]` | Field array for iteration |
| `form` | `UseFormReturn` | React Hook Form methods |
| `settingsState` | `{ isOpen, fieldPath }` | Settings dialog state |
| `addField()` | `() => void` | Add a new field |
| `removeField(index)` | `(index: number) => void` | Remove field by index |
| `openSettings(path)` | `(path: string) => void` | Open settings for a field |
| `closeSettings()` | `() => void` | Close settings dialog |
| `handleTypeChange(path, type)` | `(path: string, type: string) => void` | Change field type |
| `reset()` | `() => void` | Reset to default state |

### Exports

```typescript
export { useJsonSchemaEditor } from "@ht-rnd/json-schema-editor";
export type {
  JSONSchema,
  FormSchema,
  JsonSchemaEditorOptions,
  SettingsState,
  FieldItem,
  SchemaType,
} from "@ht-rnd/json-schema-editor";
export { validateSchema } from "@ht-rnd/json-schema-editor";
export {
  SCHEMA_TYPES,
  INTEGER_FORMATS,
  NUMBER_FORMATS,
  STRING_FORMATS,
  DEFAULT_SCHEMA_URI,
} from "@ht-rnd/json-schema-editor";
export { formToSchema, schemaToForm } from "@ht-rnd/json-schema-editor";
```

## Customizing Components

The components in `components/json-schema-editor/` follow shadcn/ui patterns:

1. **`cn()` utility**: All components use the `cn()` function to merge Tailwind classes
2. **`className` prop**: Every component accepts a `className` prop for customization
3. **`forwardRef`**: Components forward refs for DOM access
4. **Composable**: Use individual components or compose your own

### Example: Customizing the FieldRow

```tsx
import { FieldRow } from "@/components/json-schema-editor";

<FieldRow
  className="bg-slate-50 dark:bg-slate-900 rounded-lg"
  fieldPath="properties.0"
  theme="dark"
  // ... other props
/>
```

### Example: Creating a Custom Field Component

```tsx
import * as React from "react";
import { Controller, useFormContext } from "react-hook-form";
import { cn } from "./lib/utils";
import { Input } from "./ui/input";

interface MyCustomFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  fieldPath: string;
}

const MyCustomField = React.forwardRef<HTMLDivElement, MyCustomFieldProps>(
  ({ className, fieldPath, ...props }, ref) => {
    const { control } = useFormContext();

    return (
      <div ref={ref} className={cn("flex gap-2", className)} {...props}>
        <Controller
          control={control}
          name={`${fieldPath}.key`}
          render={({ field }) => (
            <Input {...field} placeholder="Field name" />
          )}
        />
      </div>
    );
  }
);
MyCustomField.displayName = "MyCustomField";

export { MyCustomField };
```

## License

Apache-2.0
