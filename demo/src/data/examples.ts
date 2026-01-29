import type { JSONSchema } from "../../../src/lib/core/types";

export const exampleSchema: Record<string, JSONSchema> = {
  emptySchema: undefined as unknown as JSONSchema,
  emptyArray: undefined as unknown as JSONSchema,
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
  todoList: {
    type: "array",
    title: "Todo List",
    description: "Array of todo items",
    $schema: "http://json-schema.org/draft/2020-12/schema",
    items: {
      type: "object",
      properties: {
        id: { type: "integer", title: "ID" },
        task: { type: "string", title: "Task", minLength: 1 },
        completed: { type: "boolean", title: "Completed", default: false },
        priority: {
          type: "string",
          title: "Priority",
          enum: ["low", "medium", "high"],
          default: "medium",
        },
      },
      required: ["id", "task"],
    },
    minItems: 0,
  },
  stringArray: {
    type: "array",
    title: "Tags Array",
    description: "Simple array of strings",
    $schema: "http://json-schema.org/draft/2020-12/schema",
    items: {
      type: "string",
      minLength: 1,
    },
    uniqueItems: true,
    minItems: 1,
  },
  numberArray: {
    type: "array",
    title: "Scores Array",
    description: "Array of numeric scores",
    $schema: "http://json-schema.org/draft/2020-12/schema",
    items: {
      type: "number",
      minimum: 0,
      maximum: 100,
    },
    minItems: 1,
    maxItems: 10,
  },
};
