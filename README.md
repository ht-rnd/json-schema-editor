# @ht-rnd/json-schema-editor

A modern, highly customizable, and themeable JSON Schema editor built with React, TypeScript, and shadcn/ui.

This component provides a clean, intuitive interface for visually building and editing JSON Schemas. It features real-time JSON output and live validation against the official JSON Schema specification, powered by AJV.

## Features

- **Modern Stack:** Built with React, TypeScript, Tailwind CSS, and `shadcn/ui`.
- **Visual Editing:** Add, remove, and configure schema properties in a clear, row-based UI.
- **Deeply Nested Schemas:** Full support for nested `object` and `array` types with recursion.
- **Advanced Settings:** A detailed settings dialog for each property type (string, number, boolean, object, array).
- **Real-time Output:** Instantly see the generated JSON Schema as you build.
- **Live Schema Validation:** Integrated `ajv` validator provides real-time feedback and inline errors if your schema violates the JSON Schema specification.
- **Highly Configurable:** Control the root type (`object` or `array`) and layout via props.
- **Themeable:** Supports dark/light themes and custom styling.
- **Read-Only Mode:** A prop to disable all interactions for display purposes.

## Installation

```bash
npm install @ht-rnd/json-schema-editor
```

## Usage and Setup

Integration requires two simple steps: configuring Tailwind and then using the component.

### Step 1: Configure Tailwind CSS

Because this library is built with Tailwind, your project's Tailwind process needs to know to scan this library's files for class names.

In your project's tailwind.config.js (or .cjs), add the path to the library within your content array:

```ts
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}", // Your app's files

    // Add this line
    "./node_modules/@ht-rnd/json-schema-editor/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    // ...
  },
  plugins: [],
};
```

### Step 2: Use the Component

```tsx
import { JsonSchemaEditor } from "@ht-rnd/json-schema-editor";
function MySchema() {
  const existingSchema: any = {
    type: "object",
    title: "Existing User Schema",
    properties: {
      name: { type: "string" },
      age: { type: "number", minimum: 0 },
    },
    required: ["name"],
  };

  return (
    <div className="p-8">
      <JsonSchemaEditor
        rootType="object"
        theme="light"
        readOnly={false}
        defaultValue={existingSchema}
        onChange={(jsonSchema) => {
          console.log(jsonSchema);
        }}
      />
    </div>
  );
}
export default MySchema;
```

## Theming and Customization

This library is built on the `shadcn/ui` theming architecture, which relies on CSS variables for colors, borders, spacing, and radius. You can easily override these variables in your own project to match your application's design system.

1. In your project's global CSS file (e.g., `src/index.css`), define your custom theme variables inside a `@layer base` block.
2. Your definitions will automatically override the library's default theme.

When you pass the `theme="dark"` prop to the JsonSchemaEditor, it will apply a `.dark` class to its root element, causing the browser to use the variables defined in your `.dark { ... }` block.

### Example `index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 240 10% 3.9%;
    --primary: 329 100% 44%;
    --primary-hover: 329 100% 38%;
    --primary-pressed: 329 100% 31%;
    --primary-foreground: 0 0% 100%;
    --secondary: 240 4.8% 95.9%;
    --secondary-foreground: 240 5.9% 10%;
    --muted: 240 3.8% 80%;
    --muted-foreground: 240 3.8% 46.1%;
    --accent: 240 4.8% 95.9%;
    --accent-foreground: 240 5.9% 10%;
    --destructive: 0 100% 50%;
    --destructive-foreground: 0 0% 98%;
    --border: 240 5.9% 90%;
    --input: 240 5.9% 90%;
    --radius: 0.75rem;
  }

  .dark {
    --background: 240 5.9% 10%;
    --foreground: 0 0% 92%;
    --primary: 330 96% 35%;
    --primary-hover: 330 96% 41%;
    --primary-pressed: 330 96% 48%;
    --primary-foreground: 240 17.1% 92%;
    --secondary: 240 3.7% 15.9%;
    --secondary-foreground: 0 0% 92%;
    --muted: 240 3.8% 40%;
    --muted-foreground: 240 5% 64.9%;
    --accent: 240 3.7% 15.9%;
    --accent-foreground: 0 0% 92%;
    --destructive: 0 100% 60%;
    --destructive-foreground: 0 0% 98%;
    --border: 240 3.7% 30%;
    --input: 240 3.7% 30%;
  }
}

/* You can also add global styles like scrollbar theming */
* {
  scrollbar-color: hsl(var(--muted)) hsl(var(--background));
}
```

### Tailwind Configuration

For theming to work correctly you should ensure your project's `tailwind.config.js` (or `tailwind.config.ts`) includes the color tokens and `borderRadius` settings used by this library. Below is an example you can merge into your `theme.extend` section.

```ts
colors: {
  magenta: {
    50: "#ffe5ed",
    100: "#ffcddb",
    200: "#ffa3be",
    300: "#ff79a2",
    400: "#ff4f85",
    500: "#e6004e",
    600: "#b8003f",
    700: "#8f0033",
    800: "#660026",
    900: "#3d0019",
    950: "#260010",
  },
  magentaHover: "hsl(var(--magentaHover))",
  border: "hsl(var(--border))",
  input: "hsl(var(--input))",
  ring: "hsl(var(--ring))",
  background: "hsl(var(--background))",
  foreground: "hsl(var(--foreground))",
  primary: {
    DEFAULT: "hsl(var(--primary))",
    foreground: "hsl(var(--primary-foreground))",
    hover: "hsl(var(--primary-hover))",
    pressed: "hsl(var(--primary-pressed))",
  },
  secondary: {
    DEFAULT: "hsl(var(--secondary))",
    foreground: "hsl(var(--secondary-foreground))",
  },
  destructive: {
    DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
    foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
  },
  muted: {
    DEFAULT: "hsl(var(--muted))",
    foreground: "hsl(var(--muted-foreground))",
  },
  accent: {
    DEFAULT: "hsl(var(--accent))",
    foreground: "hsl(var(--accent-foreground))",
  },
  popover: {
    DEFAULT: "hsl(var(--popover))",
    foreground: "hsl(var(--popover-foreground))",
  },
  card: {
    DEFAULT: "hsl(var(--card))",
    foreground: "hsl(var(--card-foreground))",
  },
  sidebar: {
    DEFAULT: "hsl(var(--sidebar-background))",
    foreground: "hsl(var(--sidebar-foreground))",
    primary: "hsl(var(--sidebar-primary))",
    "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
    accent: "hsl(var(--sidebar-accent))",
    "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
    border: "hsl(var(--sidebar-border))",
    ring: "hsl(var(--sidebar-ring))",
  },
},
borderRadius: {
  "2xl": "calc(var(--radius) + 6px)",
  xl: "calc(var(--radius) + 4px)",
  lg: "var(--radius)",
  md: "calc(var(--radius) - 2px)",
  sm: "calc(var(--radius) - 4px)",
  xs: "calc(var(--radius) - 5px)",
  "2xs": "calc(var(--radius) - 7px)",
},
```

## API Reference

### `<JsonSchemaEditor />` Props

| Prop           | Type                            | Default    | Description                                                                                                  |
| :------------- | :------------------------------ | :--------- | :----------------------------------------------------------------------------------------------------------- |
| `rootType`     | `'object'` \| `'array'`         | `'object'` | Sets the root type of the schema.                                                                            |
| `readOnly`     | `boolean`                       | `false`    | Disables all user interactions, making the editor a display-only component.                                  |
| `theme`        | `string` (e.g., `'dark'`)       | `''`       | A class name to apply for theming (e.g., pass `"dark"` for dark mode).                                       |
| `styles`       | `Styles`                        | `{...}`    | An object to control the layout, width, and spacing of the editor panels.                                    |
| `onChange`     | `(schema: JSONSchema) => void` | `none`     | A callback function that is invoked with the final schema object on any change.                              |
| `defaultValue` | `JSONSchema`                   | `none`     | An existing JSON Schema object to load into the editor. When provided, this will override the rootType prop. |

### The `styles` Prop

You can customize the layout and dimensions of the editor using the `styles` prop. You only need to provide the properties you wish to override.

**Type Definition:**

```ts
interface Styles {
  form: {
    width: "sm" | "md" | "lg" | "full";
    height: "sm" | "md" | "lg" | "full";
  };
  output: {
    position: "top" | "bottom" | "left" | "right";
    showJson: boolean;
    width: "sm" | "md" | "lg" | "full";
    height: "sm" | "md" | "lg" | "full";
  };
  settings: {
    width: "sm" | "md" | "lg" | "full";
  };
  spacing: "sm" | "md" | "lg";
}
```

**Example Usage:**

```tsx
// Example 1: Move the JSON output to the right side
<JsonSchemaEditor
  styles={{
    output: { position: "right" },
  }}
/>
```

```tsx
// Example 2: Make the form wider and use less spacing
<JsonSchemaEditor
  styles={{
    form: { width: "lg" },
    spacing: "sm",
  }}
/>
```

```tsx
// Example 3: Hide the JSON output entirely
<JsonSchemaEditor
  styles={{
    output: { showJson: false },
  }}
/>
```

## Technology Stack

- React
- TypeScript
- React Hook Form for powerful and performant form state management.
- Zod for schema validation and type inference.
- AJV for real-time validation against the JSON Schema specification.
- Tailwind CSS for utility-first styling.
- shadcn/ui for the base component primitives.
- Vite for the build tooling.

## License

Licensed under the Apache License 2.0
