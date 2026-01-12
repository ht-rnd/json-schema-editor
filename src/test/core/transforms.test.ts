import { describe, expect, it } from "vitest";
import { formToSchema, schemaToForm } from "../../lib/core/transforms";
import type { FormSchema, JSONSchema } from "../../lib/core/types";

describe("transforms", () => {
  describe("formToSchema", () => {
    it("should convert simple form data to JSON Schema", () => {
      const formData: FormSchema = {
        root: {
          type: "object",
          $schema: "http://json-schema.org/draft/2020-12/schema",
        },
        properties: [
          {
            id: "1",
            key: "name",
            isRequired: true,
            schema: { type: "string" },
          },
          {
            id: "2",
            key: "age",
            isRequired: false,
            schema: { type: "integer" },
          },
        ],
        definitions: [],
      };

      const result = formToSchema(formData);

      expect(result).toEqual({
        type: "object",
        $schema: "http://json-schema.org/draft/2020-12/schema",
        properties: {
          name: { type: "string" },
          age: { type: "integer" },
        },
        required: ["name"],
      });
    });

    it("should handle nested object properties", () => {
      const formData: FormSchema = {
        root: { type: "object" },
        properties: [
          {
            id: "1",
            key: "address",
            isRequired: false,
            schema: {
              type: "object",
              properties: [
                {
                  id: "2",
                  key: "street",
                  isRequired: true,
                  schema: { type: "string" },
                },
              ] as any,
            },
          },
        ],
        definitions: [],
      };

      const result = formToSchema(formData);

      expect(result.properties?.address).toEqual({
        type: "object",
        properties: {
          street: { type: "string" },
        },
        required: ["street"],
      });
    });

    it("should handle array items", () => {
      const formData: FormSchema = {
        root: {
          type: "array",
          items: { type: "string" },
        },
        properties: [],
        definitions: [],
      };

      const result = formToSchema(formData);

      expect(result).toEqual({
        type: "array",
        items: { type: "string" },
      });
    });
  });

  describe("schemaToForm", () => {
    it("should convert JSON Schema to form data", () => {
      const schema: JSONSchema = {
        type: "object",
        $schema: "http://json-schema.org/draft/2020-12/schema",
        properties: {
          name: { type: "string" },
          age: { type: "integer" },
        },
        required: ["name"],
      };

      const result = schemaToForm(schema);

      expect(result.root).toEqual({
        type: "object",
        $schema: "http://json-schema.org/draft/2020-12/schema",
      });
      expect(result.properties).toHaveLength(2);

      const nameField = result.properties.find((p) => p.key === "name");
      expect(nameField?.isRequired).toBe(true);
      expect(nameField?.schema).toEqual({ type: "string" });

      const ageField = result.properties.find((p) => p.key === "age");
      expect(ageField?.isRequired).toBe(false);
      expect(ageField?.schema).toEqual({ type: "integer" });
    });

    it("should handle nested objects", () => {
      const schema: JSONSchema = {
        type: "object",
        properties: {
          address: {
            type: "object",
            properties: {
              city: { type: "string" },
            },
          },
        },
      };

      const result = schemaToForm(schema);

      const addressField = result.properties.find((p) => p.key === "address");
      expect(addressField?.schema.type).toBe("object");
      expect((addressField?.schema as any).properties).toHaveLength(1);
    });

    it("should handle array schemas", () => {
      const schema: JSONSchema = {
        type: "array",
        items: { type: "number" },
      };

      const result = schemaToForm(schema);

      expect(result.root.type).toBe("array");
      expect(result.root.items).toEqual({ type: "number" });
      expect(result.properties).toHaveLength(0);
    });
  });

  describe("roundtrip", () => {
    it("should preserve schema structure through form conversion and back", () => {
      const originalSchema: JSONSchema = {
        type: "object",
        title: "Test Schema",
        description: "A test schema",
        properties: {
          name: { type: "string", minLength: 1 },
          count: { type: "integer", minimum: 0 },
        },
        required: ["name"],
      };

      const formData = schemaToForm(originalSchema);
      const resultSchema = formToSchema(formData);

      expect(resultSchema.type).toBe(originalSchema.type);
      expect(resultSchema.title).toBe(originalSchema.title);
      expect(resultSchema.description).toBe(originalSchema.description);
      expect(resultSchema.properties?.name).toEqual(originalSchema.properties?.name);
      expect(resultSchema.properties?.count).toEqual(originalSchema.properties?.count);
      expect(resultSchema.required).toEqual(originalSchema.required);
    });
  });
});
