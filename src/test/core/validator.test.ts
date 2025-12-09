import { describe, expect, it } from "vitest";
import type { JSONSchema } from "../../lib/core/types";
import { validateSchema } from "../../lib/core/validator";

describe("validateSchema", () => {
  it("should return null for a valid schema", () => {
    const validSchema: JSONSchema = {
      type: "object",
      properties: {
        name: { type: "string" },
      },
    };

    const result = validateSchema(validSchema);
    expect(result).toBeNull();
  });

  it("should return errors for an invalid schema", () => {
    const invalidSchema = {
      type: "invalid-type",
    } as JSONSchema;

    const result = validateSchema(invalidSchema);
    expect(result).not.toBeNull();
    expect(result).toBeInstanceOf(Array);
    expect(result!.length).toBeGreaterThan(0);
  });

  it("should validate nested object schemas", () => {
    const nestedSchema: JSONSchema = {
      type: "object",
      properties: {
        address: {
          type: "object",
          properties: {
            city: { type: "string" },
            zip: { type: "string" },
          },
        },
      },
    };

    const result = validateSchema(nestedSchema);
    expect(result).toBeNull();
  });

  it("should validate array schemas", () => {
    const arraySchema: JSONSchema = {
      type: "array",
      items: { type: "string" },
      minItems: 1,
      maxItems: 10,
    };

    const result = validateSchema(arraySchema);
    expect(result).toBeNull();
  });

  it("should validate schemas with string constraints", () => {
    const stringSchema: JSONSchema = {
      type: "object",
      properties: {
        email: {
          type: "string",
          format: "email",
          minLength: 5,
        },
      },
    };

    const result = validateSchema(stringSchema);
    expect(result).toBeNull();
  });
});
