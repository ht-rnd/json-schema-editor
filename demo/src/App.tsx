import { useState } from "react";
import { Moon, Sun, Github, Package, Code2, Layers } from "lucide-react";
import type { JSONSchema } from "@ht-rnd/json-schema-editor";
import { JsonSchemaEditor } from "@json-schema-editor";

type Theme = "light" | "dark";
type RootType = "object" | "array";

const exampleSchemas: Record<string, JSONSchema> = {
  empty: undefined as unknown as JSONSchema,
  user: {
    type: "object",
    title: "User",
    description: "A user profile schema",
    $schema: "http://json-schema.org/draft/2020-12/schema",
    properties: {
      name: { type: "string", title: "Full Name", minLength: 1 },
      email: { type: "string", title: "Email", format: "email" },
      age: { type: "integer", title: "Age", minimum: 0, maximum: 150 },
      isActive: { type: "boolean", title: "Active Status", default: true },
    },
    required: ["name", "email"],
    additionalProperties: false,
  },
  product: {
    type: "object",
    title: "Product",
    description: "E-commerce product schema",
    $schema: "http://json-schema.org/draft/2020-12/schema",
    properties: {
      sku: { type: "string", title: "SKU", pattern: "^[A-Z]{3}-[0-9]{4}$" },
      name: { type: "string", title: "Product Name" },
      price: { type: "number", title: "Price", minimum: 0 },
      tags: {
        type: "array",
        title: "Tags",
        items: { type: "string" },
        uniqueItems: true,
      },
    },
    required: ["sku", "name", "price"],
  },
  config: {
    type: "object",
    title: "App Config",
    $schema: "http://json-schema.org/draft/2020-12/schema",
    properties: {
      apiUrl: { type: "string", title: "API URL", format: "uri" },
      timeout: { type: "integer", title: "Timeout (ms)", default: 5000 },
      features: {
        type: "object",
        title: "Feature Flags",
        properties: {
          darkMode: { type: "boolean", default: false },
          analytics: { type: "boolean", default: true },
        },
        additionalProperties: true,
      },
    },
  },
};

function App() {
  const [theme, setTheme] = useState<Theme>("light");
  const [rootType, setRootType] = useState<RootType>("object");
  const [selectedExample, setSelectedExample] = useState<string>("empty");
  const [outputSchema, setOutputSchema] = useState<JSONSchema | null>(null);
  const [key, setKey] = useState(0);

  const toggleTheme = () => {
    setTheme((t) => (t === "light" ? "dark" : "light"));
  };

  const handleExampleChange = (example: string) => {
    setSelectedExample(example);
    setKey((k) => k + 1);
  };

  return (
    <div className={theme}>
      <div className="min-h-screen bg-background text-foreground">
        {/* Header */}
        <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur z-50">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                  <Layers className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">JSON Schema Editor</h1>
                  <p className="text-sm text-muted-foreground">Headless • React • TypeScript</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href="https://www.npmjs.com/package/@ht-rnd/json-schema-editor"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent transition-colors text-sm"
                >
                  <Package className="w-4 h-4" />
                  <span className="hidden sm:inline">npm</span>
                </a>
                <a
                  href="https://github.com/ht-rnd/json-schema-editor"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent transition-colors text-sm"
                >
                  <Github className="w-4 h-4" />
                  <span className="hidden sm:inline">GitHub</span>
                </a>
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-md hover:bg-accent transition-colors"
                  aria-label="Toggle theme"
                >
                  {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Hero */}
        <section className="border-b border-border bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-bold mb-4">Build JSON Schema Editors Your Way</h2>
              <p className="text-lg text-muted-foreground mb-6">
                A headless, fully customizable JSON Schema editor for React. Use the hook for
                complete control, or copy the pre-built shadcn-style components.
              </p>
              <div className="flex flex-wrap gap-3">
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                  Draft 2020-12
                </span>
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                  React Hook Form
                </span>
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                  Zod Validation
                </span>
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                  AJV
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Controls */}
        <section className="border-b border-border">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Root Type:</label>
                <select
                  value={rootType}
                  onChange={(e) => {
                    setRootType(e.target.value as RootType);
                    setKey((k) => k + 1);
                  }}
                  className="px-3 py-1.5 rounded-md border border-input bg-background text-sm"
                >
                  <option value="object">Object</option>
                  <option value="array">Array</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Load Example:</label>
                <select
                  value={selectedExample}
                  onChange={(e) => handleExampleChange(e.target.value)}
                  className="px-3 py-1.5 rounded-md border border-input bg-background text-sm"
                >
                  <option value="empty">Empty Schema</option>
                  <option value="user">User Profile</option>
                  <option value="product">Product</option>
                  <option value="config">App Config</option>
                </select>
              </div>

              <div className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
                <Code2 className="w-4 h-4" />
                <span>Edit the schema below</span>
              </div>
            </div>
          </div>
        </section>

        {/* Editor */}
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Editor Panel */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                  1
                </span>
                Schema Editor
              </h3>
              <div className="border border-border rounded-lg overflow-hidden">
                <JsonSchemaEditor
                  key={key}
                  rootType={rootType}
                  defaultValue={exampleSchemas[selectedExample]}
                  onChange={setOutputSchema}
                  showOutput={false}
                />
              </div>
            </div>

            {/* Output Panel */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <span className="w-6 h-6 rounded bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                  2
                </span>
                Generated JSON Schema
              </h3>
              <div className="border border-border rounded-lg overflow-hidden">
                <div className="bg-muted/30 px-4 py-2 border-b border-border flex items-center justify-between">
                  <span className="text-sm font-medium">Output</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(outputSchema, null, 2));
                    }}
                    className="text-xs px-2 py-1 rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    Copy
                  </button>
                </div>
                <pre className="p-4 overflow-auto max-h-[600px] text-sm font-mono bg-muted/10">
                  {outputSchema ? JSON.stringify(outputSchema, null, 2) : "// Schema will appear here"}
                </pre>
              </div>
            </div>
          </div>
        </main>

        {/* Features */}
        <section className="border-t border-border bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 py-12">
            <h3 className="text-2xl font-bold mb-8 text-center">Features</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  title: "Headless Architecture",
                  desc: "Use the hook directly for complete UI control, or use the pre-built components.",
                },
                {
                  title: "shadcn-style Components",
                  desc: "Copy-paste components with className support, cn() utility, and full customization.",
                },
                {
                  title: "Type Safe",
                  desc: "Full TypeScript support with exported types for JSONSchema, FormSchema, and more.",
                },
                {
                  title: "Real-time Validation",
                  desc: "AJV-powered validation against JSON Schema draft 2020-12 meta-schema.",
                },
                {
                  title: "React Hook Form",
                  desc: "Built on react-hook-form for efficient form state management.",
                },
                {
                  title: "Zero Lock-in",
                  desc: "No vendor lock-in. Copy the components, modify them, make them yours.",
                },
              ].map((feature) => (
                <div key={feature.title} className="p-6 rounded-lg border border-border bg-background">
                  <h4 className="font-semibold mb-2">{feature.title}</h4>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
              <p>MIT License • @ht-rnd/json-schema-editor</p>
              <div className="flex items-center gap-4">
                <a
                  href="https://github.com/ht-rnd/json-schema-editor"
                  className="hover:text-foreground transition-colors"
                >
                  Source Code
                </a>
                <a
                  href="https://www.npmjs.com/package/@ht-rnd/json-schema-editor"
                  className="hover:text-foreground transition-colors"
                >
                  npm Package
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;

