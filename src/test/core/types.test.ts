import { describe, expect, it } from "vitest";
import type { FormSchema, JSONSchema } from "../../lib/core/types";
import { formSchema, jsonSchemaZod } from "../../lib/core/types";

describe("types", () => {
  describe("jsonSchemaZod", () => {
    it("should validate a simple object schema", () => {
      const schema: JSONSchema = {
        type: "object",
        properties: {
          name: { type: "string" },
          age: { type: "number" },
        },
      };

      const result = jsonSchemaZod.safeParse(schema);
      expect(result.success).toBe(true);
    });

    it("should validate a schema with all primitive types", () => {
      const schema: JSONSchema = {
        type: "object",
        properties: {
          str: { type: "string" },
          num: { type: "number" },
          int: { type: "integer" },
          bool: { type: "boolean" },
          obj: { type: "object" },
          arr: { type: "array" },
        },
      };

      const result = jsonSchemaZod.safeParse(schema);
      expect(result.success).toBe(true);
    });

    it("should validate schema with string constraints", () => {
      const schema: JSONSchema = {
        type: "string",
        minLength: 1,
        maxLength: 100,
        pattern: "^[a-z]+$",
        format: "email",
      };

      const result = jsonSchemaZod.safeParse(schema);
      expect(result.success).toBe(true);
    });

    it("should validate schema with number constraints", () => {
      const schema: JSONSchema = {
        type: "number",
        minimum: 0,
        maximum: 100,
        exclusiveMin: 5,
        exclusiveMax: 95,
        multipleOf: 5,
      };

      const result = jsonSchemaZod.safeParse(schema);
      expect(result.success).toBe(true);
    });

    it("should validate schema with array constraints", () => {
      const schema: JSONSchema = {
        type: "array",
        items: { type: "string" },
        minItems: 1,
        maxItems: 10,
        uniqueItems: true,
        minContains: 1,
        maxContains: 5,
      };

      const result = jsonSchemaZod.safeParse(schema);
      expect(result.success).toBe(true);
    });

    it("should validate schema with object constraints", () => {
      const schema: JSONSchema = {
        type: "object",
        minProperties: 1,
        maxProperties: 10,
        additionalProperties: false,
      };

      const result = jsonSchemaZod.safeParse(schema);
      expect(result.success).toBe(true);
    });

    it("should validate schema with required fields", () => {
      const schema: JSONSchema = {
        type: "object",
        properties: {
          name: { type: "string" },
          email: { type: "string" },
        },
        required: ["name", "email"],
      };

      const result = jsonSchemaZod.safeParse(schema);
      expect(result.success).toBe(true);
    });

    it("should validate schema with enum", () => {
      const schema: JSONSchema = {
        type: "string",
        enum: ["red", "green", "blue"],
      };

      const result = jsonSchemaZod.safeParse(schema);
      expect(result.success).toBe(true);
    });

    it("should validate schema with $ref", () => {
      const schema: JSONSchema = {
        $ref: "#/$defs/User",
      };

      const result = jsonSchemaZod.safeParse(schema);
      expect(result.success).toBe(true);
    });

    it("should validate schema with $id and $schema", () => {
      const schema: JSONSchema = {
        $id: "https://example.com/schema.json",
        $schema: "http://json-schema.org/draft/2020-12/schema",
        type: "object",
      };

      const result = jsonSchemaZod.safeParse(schema);
      expect(result.success).toBe(true);
    });

    it("should validate schema with nested properties", () => {
      const schema: JSONSchema = {
        type: "object",
        properties: {
          address: {
            type: "object",
            properties: {
              street: { type: "string" },
              city: { type: "string" },
            },
          },
        },
      };

      const result = jsonSchemaZod.safeParse(schema);
      expect(result.success).toBe(true);
    });

    it("should validate schema with array items as object", () => {
      const schema: JSONSchema = {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "number" },
          },
        },
      };

      const result = jsonSchemaZod.safeParse(schema);
      expect(result.success).toBe(true);
    });

    it("should validate schema with array items as array (tuple)", () => {
      const schema: JSONSchema = {
        type: "array",
        items: [{ type: "string" }, { type: "number" }],
      };

      const result = jsonSchemaZod.safeParse(schema);
      expect(result.success).toBe(true);
    });

    it("should validate schema with additionalProperties as schema", () => {
      const schema: JSONSchema = {
        type: "object",
        additionalProperties: {
          type: "string",
        },
      };

      const result = jsonSchemaZod.safeParse(schema);
      expect(result.success).toBe(true);
    });

    it("should validate schema with allOf", () => {
      const schema: JSONSchema = {
        allOf: [{ type: "object" }, { properties: { name: { type: "string" } } }],
      };

      const result = jsonSchemaZod.safeParse(schema);
      expect(result.success).toBe(true);
    });

    it("should validate schema with anyOf", () => {
      const schema: JSONSchema = {
        anyOf: [{ type: "string" }, { type: "number" }],
      };

      const result = jsonSchemaZod.safeParse(schema);
      expect(result.success).toBe(true);
    });

    it("should validate schema with oneOf", () => {
      const schema: JSONSchema = {
        oneOf: [{ type: "string" }, { type: "number" }],
      };

      const result = jsonSchemaZod.safeParse(schema);
      expect(result.success).toBe(true);
    });

    it("should validate schema with not", () => {
      const schema: JSONSchema = {
        type: "object",
        not: { type: "string" },
      };

      const result = jsonSchemaZod.safeParse(schema);
      expect(result.success).toBe(true);
    });

    it("should validate schema with $defs", () => {
      const schema: JSONSchema = {
        type: "object",
        $defs: {
          User: {
            type: "object",
            properties: {
              name: { type: "string" },
            },
          },
        },
      };

      const result = jsonSchemaZod.safeParse(schema);
      expect(result.success).toBe(true);
    });

    it("should validate schema with default value", () => {
      const schema: JSONSchema = {
        type: "string",
        default: "hello",
      };

      const result = jsonSchemaZod.safeParse(schema);
      expect(result.success).toBe(true);
    });

    it("should validate schema with title and description", () => {
      const schema: JSONSchema = {
        type: "object",
        title: "My Schema",
        description: "This is my schema",
      };

      const result = jsonSchemaZod.safeParse(schema);
      expect(result.success).toBe(true);
    });

    it("should validate schema with x-modifiable", () => {
      const schema: JSONSchema = {
        type: "object",
        "x-modifiable": ["field1", "field2"],
      };

      const result = jsonSchemaZod.safeParse(schema);
      expect(result.success).toBe(true);
    });

    it("should validate schema with isModifiable", () => {
      const schema: JSONSchema = {
        type: "object",
        isModifiable: true,
      };

      const result = jsonSchemaZod.safeParse(schema);
      expect(result.success).toBe(true);
    });
  });

  describe("formSchema", () => {
    it("should validate a valid form schema", () => {
      const form: FormSchema = {
        root: {
          type: "object",
        },
        properties: [
          {
            id: "1",
            key: "name",
            isRequired: true,
            schema: { type: "string" },
          },
        ],
        definitions: [],
      };

      const result = formSchema.safeParse(form);
      expect(result.success).toBe(true);
    });

    it("should validate form schema with definitions", () => {
      const form: FormSchema = {
        root: {
          type: "object",
        },
        properties: [],
        definitions: [
          {
            id: "1",
            key: "User",
            schema: {
              type: "object",
              properties: {
                name: { type: "string" },
              },
            },
          },
        ],
      };

      const result = formSchema.safeParse(form);
      expect(result.success).toBe(true);
    });

    it("should reject form schema with empty property key", () => {
      const form = {
        root: {
          type: "object",
        },
        properties: [
          {
            id: "1",
            key: "",
            isRequired: true,
            schema: { type: "string" },
          },
        ],
        definitions: [],
      };

      const result = formSchema.safeParse(form);
      expect(result.success).toBe(false);
    });

    it("should reject form schema with missing required fields", () => {
      const form = {
        root: {
          type: "object",
        },
        properties: [
          {
            id: "1",
            key: "name",
            schema: { type: "string" },
          },
        ],
        definitions: [],
      };

      const result = formSchema.safeParse(form);
      expect(result.success).toBe(false);
    });

    it("should validate form schema with nested properties", () => {
      const form: FormSchema = {
        root: {
          type: "object",
        },
        properties: [
          {
            id: "1",
            key: "address",
            isRequired: false,
            schema: {
              type: "object",
              properties: {
                street: { type: "string" },
              },
            },
          },
        ],
        definitions: [],
      };

      const result = formSchema.safeParse(form);
      expect(result.success).toBe(true);
    });
  });
});
