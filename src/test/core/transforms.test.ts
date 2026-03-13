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

    it("should handle Date objects in cleanSchema", () => {
      const formData: FormSchema = {
        root: {
          type: "string",
          default: new Date("2024-01-01"),
        },
        properties: [],
        definitions: [],
      };

      const result = formToSchema(formData);
      expect(result.default).toBeInstanceOf(Date);
    });

    it("should handle $ref schemas", () => {
      const formData: FormSchema = {
        root: { type: "object" },
        properties: [
          {
            id: "1",
            key: "user",
            isRequired: false,
            schema: {
              type: "ref" as any,
              $ref: "#/$defs/User",
              title: "User Reference",
              description: "A reference to user",
            },
          },
        ],
        definitions: [],
      };

      const result = formToSchema(formData);
      expect(result.properties?.user).toEqual({
        $ref: "#/$defs/User",
        title: "User Reference",
        description: "A reference to user",
      });
      expect((result.properties?.user as any).type).toBeUndefined();
    });

    it("should handle $ref without title and description", () => {
      const formData: FormSchema = {
        root: { type: "object" },
        properties: [
          {
            id: "1",
            key: "item",
            isRequired: false,
            schema: {
              type: "ref" as any,
              $ref: "#/$defs/Item",
            },
          },
        ],
        definitions: [],
      };

      const result = formToSchema(formData);
      expect(result.properties?.item).toEqual({
        $ref: "#/$defs/Item",
      });
    });

    it("should handle array items as array", () => {
      const formData: FormSchema = {
        root: {
          type: "array",
          items: [{ type: "string" }, { type: "number" }] as any,
        },
        properties: [],
        definitions: [],
      };

      const result = formToSchema(formData);
      expect(Array.isArray(result.items)).toBe(true);
      expect(result.items).toEqual([{ type: "string" }, { type: "number" }]);
    });

    it("should handle definitions", () => {
      const formData: FormSchema = {
        root: { type: "object" },
        properties: [],
        definitions: [
          {
            id: "1",
            key: "User",
            schema: {
              type: "object",
              properties: [
                {
                  id: "2",
                  key: "name",
                  isRequired: true,
                  schema: { type: "string" },
                },
              ] as any,
            },
          },
        ],
      };

      const result = formToSchema(formData);
      expect(result.$defs).toBeDefined();
      expect(result.$defs?.User).toEqual({
        type: "object",
        properties: {
          name: { type: "string" },
        },
        required: ["name"],
      });
    });

    it("should handle empty values and clean them", () => {
      const formData: FormSchema = {
        root: {
          type: "object",
          title: "",
          description: undefined,
        },
        properties: [
          {
            id: "1",
            key: "field1",
            isRequired: false,
            schema: {
              type: "string",
              minLength: undefined,
              maxLength: null as any,
            },
          },
        ],
        definitions: [],
      };

      const result = formToSchema(formData);
      expect(result.title).toBeUndefined();
      expect(result.description).toBeUndefined();
      expect((result.properties?.field1 as any).minLength).toBeUndefined();
      expect((result.properties?.field1 as any).maxLength).toBeUndefined();
    });

    it("should not add properties or required if empty", () => {
      const formData: FormSchema = {
        root: { type: "string" },
        properties: [],
        definitions: [],
      };

      const result = formToSchema(formData);
      expect(result.properties).toBeUndefined();
      expect(result.required).toBeUndefined();
    });

    it("should not add $defs if definitions are empty", () => {
      const formData: FormSchema = {
        root: { type: "object" },
        properties: [],
        definitions: [],
      };

      const result = formToSchema(formData);
      expect(result.$defs).toBeUndefined();
    });

    it("should convert exclusiveMin to exclusiveMinimum for modern draft", () => {
      const formData: FormSchema = {
        root: { type: "object" },
        properties: [
          {
            id: "1",
            key: "count",
            isRequired: false,
            schema: { type: "number", exclusiveMin: 5 } as any,
          },
        ],
        definitions: [],
      };

      const result = formToSchema(formData);
      expect((result.properties?.count as any).exclusiveMinimum).toBe(5);
      expect((result.properties?.count as any).exclusiveMin).toBeUndefined();
    });

    it("should convert exclusiveMin to minimum + exclusiveMinimum:true for draft-04", () => {
      const formData: FormSchema = {
        root: { type: "object", $schema: "http://json-schema.org/draft-04/schema" },
        properties: [
          {
            id: "1",
            key: "count",
            isRequired: false,
            schema: { type: "number", exclusiveMin: 5 } as any,
          },
        ],
        definitions: [],
      };

      const result = formToSchema(formData);
      expect((result.properties?.count as any).minimum).toBe(5);
      expect((result.properties?.count as any).exclusiveMinimum).toBe(true);
      expect((result.properties?.count as any).exclusiveMin).toBeUndefined();
    });

    it("should convert exclusiveMin to exclusiveMinimum (numeric) for draft-07", () => {
      const formData: FormSchema = {
        root: { type: "object", $schema: "http://json-schema.org/draft-07/schema" },
        properties: [
          {
            id: "1",
            key: "count",
            isRequired: false,
            schema: { type: "number", exclusiveMin: 3 } as any,
          },
        ],
        definitions: [],
      };

      const result = formToSchema(formData);
      expect((result.properties?.count as any).exclusiveMinimum).toBe(3);
      expect((result.properties?.count as any).minimum).toBeUndefined();
      expect((result.properties?.count as any).exclusiveMin).toBeUndefined();
    });

    it("should convert exclusiveMax to exclusiveMaximum for modern draft", () => {
      const formData: FormSchema = {
        root: { type: "object" },
        properties: [
          {
            id: "1",
            key: "count",
            isRequired: false,
            schema: { type: "number", exclusiveMax: 10 } as any,
          },
        ],
        definitions: [],
      };

      const result = formToSchema(formData);
      expect((result.properties?.count as any).exclusiveMaximum).toBe(10);
      expect((result.properties?.count as any).exclusiveMax).toBeUndefined();
    });

    it("should convert exclusiveMax to maximum + exclusiveMaximum:true for draft-04", () => {
      const formData: FormSchema = {
        root: { type: "object", $schema: "http://json-schema.org/draft-04/schema" },
        properties: [
          {
            id: "1",
            key: "count",
            isRequired: false,
            schema: { type: "number", exclusiveMax: 10 } as any,
          },
        ],
        definitions: [],
      };

      const result = formToSchema(formData);
      expect((result.properties?.count as any).maximum).toBe(10);
      expect((result.properties?.count as any).exclusiveMaximum).toBe(true);
      expect((result.properties?.count as any).exclusiveMax).toBeUndefined();
    });

    it("should convert exclusiveMax to exclusiveMaximum (numeric) for draft-07", () => {
      const formData: FormSchema = {
        root: { type: "object", $schema: "http://json-schema.org/draft-07/schema" },
        properties: [
          {
            id: "1",
            key: "count",
            isRequired: false,
            schema: { type: "number", exclusiveMax: 10 } as any,
          },
        ],
        definitions: [],
      };

      const result = formToSchema(formData);
      expect((result.properties?.count as any).exclusiveMaximum).toBe(10);
      expect((result.properties?.count as any).maximum).toBeUndefined();
      expect((result.properties?.count as any).exclusiveMax).toBeUndefined();
    });

    it("should convert enumEnabled + enumInput to enum and strip UI fields", () => {
      const formData: FormSchema = {
        root: { type: "object" },
        properties: [
          {
            id: "1",
            key: "status",
            isRequired: false,
            schema: {
              type: "string",
              enumEnabled: true,
              enumInput: ["active", "inactive"],
              isModifiable: true,
            } as any,
          },
        ],
        definitions: [],
      };

      const result = formToSchema(formData);
      expect((result.properties?.status as any).enum).toEqual(["active", "inactive"]);
      expect((result.properties?.status as any).enumEnabled).toBeUndefined();
      expect((result.properties?.status as any).enumInput).toBeUndefined();
      expect((result.properties?.status as any).isModifiable).toBeUndefined();
    });

    it("should strip isModifiable even without enum fields", () => {
      const formData: FormSchema = {
        root: { type: "object" },
        properties: [
          {
            id: "1",
            key: "field",
            isRequired: false,
            schema: { type: "string", isModifiable: false } as any,
          },
        ],
        definitions: [],
      };

      const result = formToSchema(formData);
      expect((result.properties?.field as any).isModifiable).toBeUndefined();
    });

    it('should strip format: "none"', () => {
      const formData: FormSchema = {
        root: { type: "object" },
        properties: [
          {
            id: "1",
            key: "field",
            isRequired: false,
            schema: { type: "string", format: "none" } as any,
          },
        ],
        definitions: [],
      };

      const result = formToSchema(formData);
      expect((result.properties?.field as any).format).toBeUndefined();
    });

    it("should emit $defs for modern draft with definitions", () => {
      const formData: FormSchema = {
        root: { type: "object" },
        properties: [],
        definitions: [{ id: "1", key: "MyType", schema: { type: "string" } }],
      };

      const result = formToSchema(formData);
      expect(result.$defs?.MyType).toEqual({ type: "string" });
      expect((result as any).definitions).toBeUndefined();
    });

    it("should coerce enumInput strings to numbers for number type", () => {
      const formData: FormSchema = {
        root: { type: "object" },
        properties: [
          {
            id: "1",
            key: "price",
            isRequired: false,
            schema: {
              type: "number",
              enumEnabled: true,
              enumInput: ["1.5", "2", "3.14"],
            } as any,
          },
        ],
        definitions: [],
      };

      const result = formToSchema(formData);
      expect((result.properties?.price as any).enum).toEqual([1.5, 2, 3.14]);
    });

    it("should coerce enumInput strings to integers for integer type", () => {
      const formData: FormSchema = {
        root: { type: "object" },
        properties: [
          {
            id: "1",
            key: "count",
            isRequired: false,
            schema: {
              type: "integer",
              enumEnabled: true,
              enumInput: ["1", "2", "3"],
            } as any,
          },
        ],
        definitions: [],
      };

      const result = formToSchema(formData);
      expect((result.properties?.count as any).enum).toEqual([1, 2, 3]);
    });

    it("should filter out non-numeric enumInput values for number type", () => {
      const formData: FormSchema = {
        root: { type: "object" },
        properties: [
          {
            id: "1",
            key: "score",
            isRequired: false,
            schema: {
              type: "number",
              enumEnabled: true,
              enumInput: ["1", "abc", "3"],
            } as any,
          },
        ],
        definitions: [],
      };

      const result = formToSchema(formData);
      expect((result.properties?.score as any).enum).toEqual([1, 3]);
    });

    it("should filter out non-integer enumInput values for integer type", () => {
      const formData: FormSchema = {
        root: { type: "object" },
        properties: [
          {
            id: "1",
            key: "qty",
            isRequired: false,
            schema: {
              type: "integer",
              enumEnabled: true,
              enumInput: ["1", "2.5", "3"],
            } as any,
          },
        ],
        definitions: [],
      };

      const result = formToSchema(formData);
      expect((result.properties?.qty as any).enum).toEqual([1, 3]);
    });

    it("should emit definitions (not $defs) for draft-07", () => {
      const formData: FormSchema = {
        root: { type: "object", $schema: "http://json-schema.org/draft-07/schema" },
        properties: [],
        definitions: [{ id: "1", key: "MyType", schema: { type: "string" } }],
      };

      const result = formToSchema(formData);
      expect((result as any).definitions?.MyType).toEqual({ type: "string" });
      expect(result.$defs).toBeUndefined();
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

    it("should reverse exclusiveMinimum (number) to exclusiveMin", () => {
      const schema: JSONSchema = {
        type: "object",
        properties: {
          count: { type: "number", exclusiveMinimum: 5 } as any,
        },
      };

      const result = schemaToForm(schema);
      const countField = result.properties.find((p) => p.key === "count");
      expect((countField?.schema as any).exclusiveMin).toBe(5);
      expect((countField?.schema as any).exclusiveMinimum).toBeUndefined();
    });

    it("should reverse draft-07 exclusiveMinimum:true + minimum to exclusiveMin", () => {
      const schema: JSONSchema = {
        type: "object",
        properties: {
          count: { type: "number", minimum: 5, exclusiveMinimum: true } as any,
        },
      };

      const result = schemaToForm(schema);
      const countField = result.properties.find((p) => p.key === "count");
      expect((countField?.schema as any).exclusiveMin).toBe(5);
      expect((countField?.schema as any).minimum).toBeUndefined();
      expect((countField?.schema as any).exclusiveMinimum).toBeUndefined();
    });

    it("should reverse enum array to enumEnabled + enumInput", () => {
      const schema: JSONSchema = {
        type: "object",
        properties: {
          status: { type: "string", enum: ["active", "inactive"] } as any,
        },
      };

      const result = schemaToForm(schema);
      const statusField = result.properties.find((p) => p.key === "status");
      expect((statusField?.schema as any).enumEnabled).toBe(true);
      expect((statusField?.schema as any).enumInput).toEqual(["active", "inactive"]);
    });

    it("should stringify numeric enum values into enumInput", () => {
      const schema: JSONSchema = {
        type: "object",
        properties: {
          count: { type: "integer", enum: [1, 2, 3] } as any,
        },
      };

      const result = schemaToForm(schema);
      const countField = result.properties.find((p) => p.key === "count");
      expect((countField?.schema as any).enumEnabled).toBe(true);
      expect((countField?.schema as any).enumInput).toEqual(["1", "2", "3"]);
    });

    it("should handle draft-07 definitions key in schemaToForm", () => {
      const schema = {
        type: "object",
        definitions: {
          MyType: { type: "string" },
        },
      } as any;

      const result = schemaToForm(schema);
      expect(result.definitions).toHaveLength(1);
      expect(result.definitions[0].key).toBe("MyType");
      expect(result.definitions[0].schema.type).toBe("string");
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

    it("should handle $ref in root", () => {
      const schema: JSONSchema = {
        $ref: "#/$defs/MyType",
      };

      const result = schemaToForm(schema);
      expect((result.root as any).type).toBe("ref");
      expect(result.root.$ref).toBe("#/$defs/MyType");
    });

    it("should handle array items as array", () => {
      const schema: JSONSchema = {
        type: "array",
        items: [{ type: "string" }, { type: "number" }],
      };

      const result = schemaToForm(schema);
      expect(Array.isArray(result.root.items)).toBe(true);
      expect((result.root.items as any)[0]).toEqual({ type: "string" });
      expect((result.root.items as any)[1]).toEqual({ type: "number" });
    });

    it("should handle definitions ($defs)", () => {
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

      const result = schemaToForm(schema);
      expect(result.definitions).toHaveLength(1);
      expect(result.definitions[0].key).toBe("User");
      expect(result.definitions[0].schema.type).toBe("object");
    });

    it("should handle schema without properties", () => {
      const schema: JSONSchema = {
        type: "string",
        minLength: 5,
      };

      const result = schemaToForm(schema);
      expect(result.root.type).toBe("string");
      expect(result.root.minLength).toBe(5);
      expect(result.properties).toHaveLength(0);
    });

    it("should skip properties without keys", () => {
      const formData: FormSchema = {
        root: { type: "object" },
        properties: [
          {
            id: "1",
            key: "",
            isRequired: false,
            schema: { type: "string" },
          },
          {
            id: "2",
            key: "valid",
            isRequired: false,
            schema: { type: "number" },
          },
        ],
        definitions: [],
      };

      const result = formToSchema(formData);
      expect(result.properties?.valid).toBeDefined();
      expect(Object.keys(result.properties || {}).length).toBe(1);
    });

    it("should skip definitions without keys", () => {
      const formData: FormSchema = {
        root: { type: "object" },
        properties: [],
        definitions: [
          {
            id: "1",
            key: "",
            schema: { type: "object" },
          },
          {
            id: "2",
            key: "ValidDef",
            schema: { type: "object" },
          },
        ],
      };

      const result = formToSchema(formData);
      expect(result.$defs?.ValidDef).toBeDefined();
      expect(Object.keys(result.$defs || {}).length).toBe(1);
    });

    it("should skip nested properties without keys", () => {
      const formData: FormSchema = {
        root: { type: "object" },
        properties: [
          {
            id: "1",
            key: "parent",
            isRequired: false,
            schema: {
              type: "object",
              properties: [
                {
                  id: "2",
                  key: "",
                  isRequired: false,
                  schema: { type: "string" },
                },
                {
                  id: "3",
                  key: "child",
                  isRequired: true,
                  schema: { type: "number" },
                },
              ] as any,
            },
          },
        ],
        definitions: [],
      };

      const result = formToSchema(formData);
      const parentSchema = result.properties?.parent as any;
      expect(parentSchema.properties.child).toBeDefined();
      expect(Object.keys(parentSchema.properties).length).toBe(1);
    });
  });
});
