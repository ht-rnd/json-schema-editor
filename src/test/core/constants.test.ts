import { describe, expect, it } from "vitest";
import {
  createDefaultArraySchema,
  createDefaultField,
  createDefaultObjectSchema,
  DEFAULT_SCHEMA_URI,
  INTEGER_FORMATS,
  NUMBER_FORMATS,
  SCHEMA_TYPES,
  STRING_FORMATS,
} from "../../lib/core/constants";

describe("constants", () => {
  describe("SCHEMA_TYPES", () => {
    it("should contain all JSON Schema types", () => {
      expect(SCHEMA_TYPES).toContain("string");
      expect(SCHEMA_TYPES).toContain("number");
      expect(SCHEMA_TYPES).toContain("integer");
      expect(SCHEMA_TYPES).toContain("boolean");
      expect(SCHEMA_TYPES).toContain("object");
      expect(SCHEMA_TYPES).toContain("array");
      expect(SCHEMA_TYPES).toHaveLength(6);
    });
  });

  describe("format constants", () => {
    it("should have integer formats", () => {
      expect(INTEGER_FORMATS).toContain("int-32");
      expect(INTEGER_FORMATS).toContain("int-64");
    });

    it("should have number formats", () => {
      expect(NUMBER_FORMATS).toContain("float");
      expect(NUMBER_FORMATS).toContain("double");
    });

    it("should have string formats", () => {
      expect(STRING_FORMATS).toContain("email");
      expect(STRING_FORMATS).toContain("date");
      expect(STRING_FORMATS).toContain("uri");
      expect(STRING_FORMATS).toContain("uuid");
    });
  });

  describe("DEFAULT_SCHEMA_URI", () => {
    it("should be the draft 2020-12 schema URI", () => {
      expect(DEFAULT_SCHEMA_URI).toBe("http://json-schema.org/draft/2020-12/schema");
    });
  });

  describe("factory functions", () => {
    it("createDefaultObjectSchema should create a valid object schema", () => {
      const schema = createDefaultObjectSchema();
      expect(schema.type).toBe("object");
      expect(schema.$schema).toBe(DEFAULT_SCHEMA_URI);
      expect(schema.additionalProperties).toBe(true);
    });

    it("createDefaultArraySchema should create a valid array schema", () => {
      const schema = createDefaultArraySchema();
      expect(schema.type).toBe("array");
      expect(schema.$schema).toBe(DEFAULT_SCHEMA_URI);
      expect(schema.items).toEqual({ type: "string" });
    });

    it("createDefaultField should create a field with the given id", () => {
      const field = createDefaultField("test123");
      expect(field.id).toBe("test123");
      expect(field.key).toBe("field_test123");
      expect(field.isRequired).toBe(false);
      expect(field.schema).toEqual({ type: "string" });
    });
  });
});
