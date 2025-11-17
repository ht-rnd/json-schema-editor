import { describe, it, expect, vi, beforeEach } from "vitest";
import { JSONSchema } from "../../lib/hooks/useSchemaForm";

const mockAjvInstance = {
  validate: vi.fn(),
  errors: null as any[] | null,
};

vi.doMock("ajv/dist/2020", () => ({
  default: class MockAjv {
    constructor() {
      return mockAjvInstance;
    }
  },
}));

vi.doMock("ajv-formats", () => ({
  default: vi.fn(),
}));

const { validateSchema } = await import("../../lib/utils/validator");

describe("validator", () => {
  beforeEach(() => {
    mockAjvInstance.validate.mockClear();
    mockAjvInstance.errors = null;
  });

  it("should return null for a valid schema", () => {
    mockAjvInstance.validate.mockReturnValue(true);
    const validSchema: JSONSchema = { type: "string" };

    const result = validateSchema(validSchema);
    expect(mockAjvInstance.validate).toHaveBeenCalledWith(
      "https://json-schema.org/draft/2020-12/schema",
      validSchema
    );
    expect(result).toBeNull();
  });

  it("should return an array of errors for an invalid schema", () => {
    const mockErrors = [{ message: "is the wrong type" }];
    mockAjvInstance.validate.mockReturnValue(false);
    mockAjvInstance.errors = mockErrors;
    const invalidSchema: JSONSchema = { type: "invalid" as any };

    const result = validateSchema(invalidSchema);
    expect(result).toEqual(mockErrors);
  });

  it("should return an empty array if validation fails but ajv.errors is null", () => {
    mockAjvInstance.validate.mockReturnValue(false);
    mockAjvInstance.errors = null;
    const schema: JSONSchema = { type: "any" as any };

    const result = validateSchema(schema);
    expect(result).toEqual([]);
  });
});
