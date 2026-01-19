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

## Features

### Core Capabilities

- **JSON Schema 2020-12** - Full support for draft 2020-12 specification
- **Multiple Data Types** - string, number, integer, boolean, object, array, and $ref
- **Nested Schemas** - Support for nested objects and arrays with unlimited depth
- **Definitions ($defs)** - Create reusable schema definitions with $ref support
- **Validation Constraints** - min/max, length, format, pattern, enum, and more
- **Boolean Combinators** - allOf, anyOf, oneOf, not for complex schema logic
- **Real-time Validation** - AJV-based validation with inline error messages
- **Type Safety** - Full TypeScript support with comprehensive type definitions

### UI Features (Pre-built Components)

- **Responsive Layout** - Configurable form and output positioning (top/bottom/left/right)
- **Customizable Sizing** - Flexible width and height options (sm/md/lg/full)
- **Dark Mode Ready** - Theme prop support for dark/light mode
- **Read-only Mode** - View-only mode for displaying schemas
- **Settings Dialogs** - Rich settings for each field type with type-specific options
- **Inline Editing** - Direct field manipulation with instant feedback

## Usage

### Option 1: Using the Headless Hook (Full Control)

Use the `useJsonSchemaEditor` hook directly for complete control over the UI:

```tsx
import { useJsonSchemaEditor } from "@ht-rnd/json-schema-editor";
import { FormProvider } from "react-hook-form";

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
        <button onClick={editor.addDefinition}>Add Definition</button>
        
        {editor.fields.map((field, index) => (
          <div key={field.id}>
            {/* Render your custom field UI */}
            <input value={field.key} />
            <button onClick={() => editor.removeField(index)}>Remove</button>
            <button onClick={() => editor.openSettings(`properties.${index}`)}>Settings</button>
          </div>
        ))}

        {editor.definitions.map((def, index) => (
          <div key={def.id}>
            <input value={def.key} />
            <button onClick={() => editor.removeDefinition(index)}>Remove</button>
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
      showOutput={true}
      onChange={(schema) => console.log(schema)}
      styles={{
        form: { width: "full", height: "md" },
        output: { position: "bottom", showJson: true, width: "full", height: "md" },
        settings: { width: "md" },
        spacing: "md",
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
      <div className="space-y-4">
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

        {/* Add definitions support */}
        {editor.definitions.length > 0 && (
          <div className="mt-4">
            <h3>Definitions ($defs)</h3>
            {editor.definitions.map((def, index) => (
              <div key={def.id}>
                <span>{def.key}</span>
                <button onClick={() => editor.removeDefinition(index)}>Remove</button>
              </div>
            ))}
          </div>
        )}

        {/* Your custom JSON output */}
        <textarea value={JSON.stringify(editor.schema, null, 2)} readOnly />

        <SettingsDialog
          isOpen={editor.settingsState.isOpen}
          fieldPath={editor.settingsState.fieldPath}
          onClose={editor.closeSettings}
        />
      </div>
    </FormProvider>
  );
}
```

## API Reference

### `JsonSchemaEditor` Component (Pre-built)

The pre-built React component with full UI implementation.

#### Props

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `rootType` | `"object" \| "array"` | `"object"` | Root schema type |
| `defaultValue` | `JSONSchema` | - | Initial schema value |
| `onChange` | `(schema: JSONSchema) => void` | - | Callback when schema changes |
| `readOnly` | `boolean` | `false` | Make all inputs read-only |
| `showOutput` | `boolean` | `true` | Show/hide output panel |
| `theme` | `string` | `"light"` | Theme class for styling |
| `styles` | `Partial<Styles>` | - | Layout and sizing configuration |
| `className` | `string` | - | Additional CSS classes |

#### Styles Configuration

```typescript
interface Styles {
  form: { width: "sm" | "md" | "lg" | "full"; height: "sm" | "md" | "lg" | "full" };
  output: {
    position: "top" | "bottom" | "left" | "right";
    showJson: boolean;
    width: "sm" | "md" | "lg" | "full";
    height: "sm" | "md" | "lg" | "full";
  };
  settings: { width: "sm" | "md" | "lg" | "full" };
  spacing: "sm" | "md" | "lg";
}
```

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
| `definitions` | `DefinitionItem[]` | Definition array for $defs |
| `form` | `UseFormReturn` | React Hook Form methods |
| `settingsState` | `{ isOpen, fieldPath }` | Settings dialog state |
| `addField()` | `() => void` | Add a new field |
| `removeField(index)` | `(index: number) => void` | Remove field by index |
| `addDefinition()` | `() => void` | Add a new definition to $defs |
| `removeDefinition(index)` | `(index: number) => void` | Remove definition by index |
| `updateReferences(oldKey, newKey)` | `(oldKey: string, newKey: string \| null) => void` | Update $ref references when definition key changes |
| `openSettings(path)` | `(path: string) => void` | Open settings for a field |
| `closeSettings()` | `() => void` | Close settings dialog |
| `handleTypeChange(path, type)` | `(path: string, type: string) => void` | Change field type |
| `addNestedField(parentPath)` | `(parentPath: string) => void` | Add a nested field to an object |
| `reset()` | `() => void` | Reset to default state |

### Exports

```typescript
// Main hook
export { useJsonSchemaEditor } from "@ht-rnd/json-schema-editor";

// Types
export type {
  JSONSchema,
  FormSchema,
  JsonSchemaEditorOptions,
  SettingsState,
  FieldItem,
  DefinitionItem,
  SchemaType,
  SchemaTypeValue,
  SchemaTypeWithRefValue,
  UseJsonSchemaEditorReturn,
} from "@ht-rnd/json-schema-editor";

// Validation
export { validateSchema } from "@ht-rnd/json-schema-editor";
export { jsonSchemaZod } from "@ht-rnd/json-schema-editor";

// Constants
export {
  SCHEMA_TYPES,
  SCHEMA_TYPES_WITH_REF,
  INTEGER_FORMATS,
  NUMBER_FORMATS,
  STRING_FORMATS,
  DEFAULT_SCHEMA_URI,
} from "@ht-rnd/json-schema-editor";

// Transforms and utilities
export { formToSchema, schemaToForm } from "@ht-rnd/json-schema-editor";
export {
  createDefaultObjectSchema,
  createDefaultArraySchema,
  createDefaultField,
} from "@ht-rnd/json-schema-editor";
```

## Component Architecture

### Available Components

The `components/json-schema-editor/` folder includes these ready-to-use components:

#### Form Components
- `JsonSchemaEditor` - Complete editor with form and output
- `Root` - Root field component with type selector
- `FieldList` - List of field rows
- `FieldRow` - Individual field row with controls
- `Field` - Recursive field component for nested schemas

#### Settings Components
- `SettingsDialog` - Modal dialog for field settings
- `Settings` - Main settings router component
- `StringSettings`, `NumberSettings`, `IntegerSettings`, `BooleanSettings` - Type-specific settings
- `ObjectSettings`, `ArraySettings` - Complex type settings
- `BoolCombSettings` - allOf/anyOf/oneOf/not settings
- `DefinitionsSettings` - $defs management
- `RootSettings` - Root schema settings

#### UI Primitives
All based on [shadcn/ui](https://ui.shadcn.com/): `Button`, `Input`, `Select`, `Checkbox`, `Dialog`, `Badge`, `Tooltip`, etc.

## Customizing Components

The components in `components/json-schema-editor/` follow shadcn/ui patterns:

1. **`cn()` utility**: All components use the `cn()` function to merge Tailwind classes
2. **`className` prop**: Every component accepts a `className` prop for customization
3. **`forwardRef`**: Components forward refs for DOM access
4. **Composable**: Use individual components or compose your own
5. **Copy & Modify**: Copy components into your project and customize as needed

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
