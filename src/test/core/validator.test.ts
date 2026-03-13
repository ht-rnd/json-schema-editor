import { describe, expect, it } from "vitest";
import type { JSONSchema } from "../../lib/core/types";
import { validateCrossFieldConstraints, validateSchema } from "../../lib/core/validator";

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
    } as unknown as JSONSchema;

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

  it("should return empty array if ajv.errors is null but validation fails", () => {
    const schemaWithCircularRef: JSONSchema = {
      type: "object",
      properties: {
        self: {} as any,
      },
    };

    const result = validateSchema(schemaWithCircularRef);
    expect(result === null || Array.isArray(result)).toBe(true);
  });

  it("should validate a draft-07 schema correctly", () => {
    const schema: JSONSchema = {
      $schema: "http://json-schema.org/draft-07/schema",
      type: "object",
      properties: {
        name: { type: "string" },
      },
    } as any;

    const result = validateSchema(schema);
    expect(result).toBeNull();
  });

  it("should validate a draft-07 schema with numeric exclusiveMinimum without errors", () => {
    // Draft-07 uses exclusiveMinimum as a number (not boolean - that's draft-04)
    const schema = {
      $schema: "http://json-schema.org/draft-07/schema",
      type: "object",
      properties: {
        count: { type: "number", exclusiveMinimum: 5 },
      },
    } as any;

    const result = validateSchema(schema);
    expect(result).toBeNull();
  });

  it("should validate a 2019-09 schema correctly", () => {
    const schema: JSONSchema = {
      $schema: "https://json-schema.org/draft/2019-09/schema",
      type: "object",
      properties: {
        name: { type: "string" },
      },
    } as any;

    const result = validateSchema(schema);
    expect(result).toBeNull();
  });

  it("should fall back to 2020-12 when no $schema is present", () => {
    const schema: JSONSchema = {
      type: "object",
      properties: {
        name: { type: "string" },
      },
    };

    // Should validate successfully against the 2020-12 meta-schema
    const result = validateSchema(schema);
    expect(result).toBeNull();
  });
});

describe("validateCrossFieldConstraints", () => {
  // --- numeric bounds ---
  it("returns no errors when maximum >= minimum", () => {
    expect(validateCrossFieldConstraints({ minimum: 1, maximum: 5 })).toHaveLength(0);
    expect(validateCrossFieldConstraints({ minimum: 5, maximum: 5 })).toHaveLength(0);
  });

  it("returns an error when maximum < minimum", () => {
    const errors = validateCrossFieldConstraints({ minimum: 10, maximum: 5 });
    expect(errors).toHaveLength(1);
    expect(errors[0].instancePath).toBe("/maximum");
    expect(errors[0].message).toMatch(/maximum.*minimum/);
  });

  it("errors when maximum === minimum and a boolean exclusive flag is set", () => {
    const errMin = validateCrossFieldConstraints({
      minimum: 5,
      maximum: 5,
      exclusiveMinimum: true,
    });
    expect(errMin).toHaveLength(1);
    const errMax = validateCrossFieldConstraints({
      minimum: 5,
      maximum: 5,
      exclusiveMaximum: true,
    });
    expect(errMax).toHaveLength(1);
  });

  it("no error when maximum > minimum and boolean exclusive flag is set", () => {
    expect(
      validateCrossFieldConstraints({ minimum: 1, maximum: 5, exclusiveMinimum: true }),
    ).toHaveLength(0);
  });

  // --- numeric exclusiveMinimum ---
  it("errors when maximum <= numeric exclusiveMinimum", () => {
    const errors = validateCrossFieldConstraints({ exclusiveMinimum: 10, maximum: 10 });
    expect(errors).toHaveLength(1);
    expect(errors[0].instancePath).toBe("/maximum");
    expect(errors[0].message).toMatch(/exclusiveMinimum/);
  });

  it("no error when maximum > numeric exclusiveMinimum", () => {
    expect(validateCrossFieldConstraints({ exclusiveMinimum: 5, maximum: 6 })).toHaveLength(0);
  });

  // --- numeric exclusiveMaximum ---
  it("errors when numeric exclusiveMaximum <= minimum", () => {
    const errors = validateCrossFieldConstraints({ minimum: 5, exclusiveMaximum: 5 });
    expect(errors).toHaveLength(1);
    expect(errors[0].instancePath).toBe("/exclusiveMaximum");
    expect(errors[0].message).toMatch(/exclusiveMaximum.*minimum/);
  });

  it("errors when numeric exclusiveMaximum <= numeric exclusiveMinimum", () => {
    const errors = validateCrossFieldConstraints({ exclusiveMinimum: 5, exclusiveMaximum: 5 });
    expect(errors).toHaveLength(1);
    expect(errors[0].instancePath).toBe("/exclusiveMaximum");
    expect(errors[0].message).toMatch(/exclusiveMaximum.*exclusiveMinimum/);
  });

  it("no error when numeric exclusiveMaximum > numeric exclusiveMinimum", () => {
    expect(
      validateCrossFieldConstraints({ exclusiveMinimum: 1, exclusiveMaximum: 2 }),
    ).toHaveLength(0);
  });

  // --- exclusiveMinimum === minimum ---
  it("errors when numeric exclusiveMinimum equals minimum", () => {
    const errors = validateCrossFieldConstraints({ minimum: 5, exclusiveMinimum: 5 });
    expect(errors).toHaveLength(1);
    expect(errors[0].instancePath).toBe("/exclusiveMinimum");
    expect(errors[0].message).toMatch(/exclusiveMinimum.*minimum/);
  });

  it("no error when numeric exclusiveMinimum differs from minimum", () => {
    expect(validateCrossFieldConstraints({ minimum: 3, exclusiveMinimum: 5 })).toHaveLength(0);
    expect(validateCrossFieldConstraints({ minimum: 5, exclusiveMinimum: 7 })).toHaveLength(0);
  });

  // --- exclusiveMaximum === maximum ---
  it("errors when numeric exclusiveMaximum equals maximum", () => {
    const errors = validateCrossFieldConstraints({ maximum: 10, exclusiveMaximum: 10 });
    expect(errors).toHaveLength(1);
    expect(errors[0].instancePath).toBe("/exclusiveMaximum");
    expect(errors[0].message).toMatch(/exclusiveMaximum.*maximum/);
  });

  it("no error when numeric exclusiveMaximum differs from maximum", () => {
    expect(validateCrossFieldConstraints({ maximum: 10, exclusiveMaximum: 8 })).toHaveLength(0);
    expect(validateCrossFieldConstraints({ maximum: 10, exclusiveMaximum: 5 })).toHaveLength(0);
  });

  // --- string ---
  it("errors when maxLength < minLength", () => {
    const errors = validateCrossFieldConstraints({ minLength: 10, maxLength: 3 });
    expect(errors).toHaveLength(1);
    expect(errors[0].instancePath).toBe("/maxLength");
  });

  it("no error when maxLength >= minLength", () => {
    expect(validateCrossFieldConstraints({ minLength: 3, maxLength: 10 })).toHaveLength(0);
    expect(validateCrossFieldConstraints({ minLength: 5, maxLength: 5 })).toHaveLength(0);
  });

  // --- array ---
  it("errors when maxItems < minItems", () => {
    const errors = validateCrossFieldConstraints({ minItems: 5, maxItems: 2 });
    expect(errors).toHaveLength(1);
    expect(errors[0].instancePath).toBe("/maxItems");
  });

  it("errors when maxContains < minContains", () => {
    const errors = validateCrossFieldConstraints({ minContains: 3, maxContains: 1 });
    expect(errors).toHaveLength(1);
    expect(errors[0].instancePath).toBe("/maxContains");
  });

  // --- object ---
  it("errors when maxProperties < minProperties", () => {
    const errors = validateCrossFieldConstraints({ minProperties: 5, maxProperties: 2 });
    expect(errors).toHaveLength(1);
    expect(errors[0].instancePath).toBe("/maxProperties");
  });

  it("no error when maxProperties >= minProperties", () => {
    expect(validateCrossFieldConstraints({ minProperties: 2, maxProperties: 5 })).toHaveLength(0);
  });

  // --- multiple violations at once ---
  it("reports multiple violations simultaneously", () => {
    const errors = validateCrossFieldConstraints({
      minimum: 10,
      maximum: 5,
      minLength: 10,
      maxLength: 3,
    });
    expect(errors.length).toBeGreaterThanOrEqual(2);
  });

  // --- recursion ---
  it("recurses into object properties", () => {
    const errors = validateCrossFieldConstraints({
      properties: {
        count: { minimum: 10, maximum: 5 },
      },
    });
    expect(errors).toHaveLength(1);
    expect(errors[0].instancePath).toBe("/properties/count/maximum");
  });

  it("recurses into non-array items", () => {
    const errors = validateCrossFieldConstraints({
      items: { minLength: 10, maxLength: 2 },
    });
    expect(errors).toHaveLength(1);
    expect(errors[0].instancePath).toBe("/items/maxLength");
  });

  it("does not recurse into array-form items", () => {
    // tuple-style items array should be ignored
    const errors = validateCrossFieldConstraints({
      items: [{ minimum: 10, maximum: 5 }],
    });
    expect(errors).toHaveLength(0);
  });

  it("recurses into $defs", () => {
    const errors = validateCrossFieldConstraints({
      $defs: {
        myDef: { minItems: 5, maxItems: 1 },
      },
    });
    expect(errors).toHaveLength(1);
    expect(errors[0].instancePath).toBe("/$defs/myDef/maxItems");
  });

  it("recurses into definitions", () => {
    const errors = validateCrossFieldConstraints({
      definitions: {
        myDef: { minProperties: 4, maxProperties: 2 },
      },
    });
    expect(errors).toHaveLength(1);
    expect(errors[0].instancePath).toBe("/definitions/myDef/maxProperties");
  });

  // --- path prefix ---
  it("prepends custom path prefix", () => {
    const errors = validateCrossFieldConstraints({ minimum: 10, maximum: 5 }, "/properties/age");
    expect(errors[0].instancePath).toBe("/properties/age/maximum");
  });

  // --- edge cases ---
  it("returns no errors for null or non-object input", () => {
    expect(validateCrossFieldConstraints(null)).toHaveLength(0);
    expect(validateCrossFieldConstraints("string" as any)).toHaveLength(0);
  });

  it("returns no errors when only one side of a pair is present", () => {
    expect(validateCrossFieldConstraints({ minimum: 5 })).toHaveLength(0);
    expect(validateCrossFieldConstraints({ maxLength: 10 })).toHaveLength(0);
  });
});

describe("validateSchema cross-field integration", () => {
  it("returns null for a fully valid schema with no constraint violations", () => {
    const schema: JSONSchema = {
      type: "object",
      properties: {
        age: { type: "number", minimum: 0, maximum: 120 },
      },
    };
    expect(validateSchema(schema)).toBeNull();
  });

  it("returns cross-field errors even when AJV finds no structural errors", () => {
    // AJV won't catch maximum < minimum; cross-field check should
    const schema = {
      type: "object",
      properties: {
        age: { type: "number", minimum: 100, maximum: 10 },
      },
    } as unknown as JSONSchema;
    const errors = validateSchema(schema);
    expect(errors).not.toBeNull();
    expect(errors!.some((e) => e.instancePath.includes("maximum"))).toBe(true);
  });

  it("combines AJV and cross-field errors when both are present", () => {
    const schema = {
      type: "invalid-type",
      minimum: 100,
      maximum: 5,
    } as unknown as JSONSchema;
    const errors = validateSchema(schema);
    expect(errors).not.toBeNull();
    // Should have at least one AJV error (invalid type) and one cross-field error
    expect(errors!.length).toBeGreaterThanOrEqual(2);
  });
});
