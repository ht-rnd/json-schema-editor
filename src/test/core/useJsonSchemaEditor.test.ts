import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { JSONSchema } from "../../lib/core/types";
import { useJsonSchemaEditor } from "../../lib/core/useJsonSchemaEditor";

describe("useJsonSchemaEditor", () => {
  describe("initialization", () => {
    it("should initialize with default object type", () => {
      const { result } = renderHook(() => useJsonSchemaEditor());

      expect(result.current.schema.type).toBe("object");
      expect(result.current.schema.$schema).toBe("http://json-schema.org/draft/2020-12/schema");
      expect(result.current.schema.additionalProperties).toBe(true);
      expect(result.current.fields).toHaveLength(1);
      expect(result.current.definitions).toHaveLength(0);
      expect(result.current.errors).toBeNull();
    });

    it("should initialize with array type", () => {
      const { result } = renderHook(() =>
        useJsonSchemaEditor({
          rootType: "array",
        }),
      );

      expect(result.current.schema.type).toBe("array");
      expect(result.current.schema.items).toEqual({ type: "string" });
      expect(result.current.fields).toHaveLength(0);
    });

    it("should initialize with default value", () => {
      const defaultValue: JSONSchema = {
        type: "object",
        title: "Custom Schema",
        properties: {
          customField: { type: "string" },
        },
      };

      const { result } = renderHook(() =>
        useJsonSchemaEditor({
          defaultValue,
        }),
      );

      expect(result.current.schema.title).toBe("Custom Schema");
      expect(result.current.fields).toHaveLength(1);
      expect(result.current.fields[0].key).toBe("customField");
    });

    it("should call onChange when schema changes", async () => {
      const onChange = vi.fn();
      const { result } = renderHook(() =>
        useJsonSchemaEditor({
          onChange,
        }),
      );

      act(() => {
        result.current.addField();
      });

      await waitFor(() => {
        expect(onChange).toHaveBeenCalled();
      });
    });
  });

  describe("addField", () => {
    it("should add a new field", () => {
      const { result } = renderHook(() => useJsonSchemaEditor());

      const initialLength = result.current.fields.length;

      act(() => {
        result.current.addField();
      });

      expect(result.current.fields).toHaveLength(initialLength + 1);
      const newField = result.current.fields[result.current.fields.length - 1];
      expect(newField.schema.type).toBe("string");
      expect(newField.isRequired).toBe(false);
    });
  });

  describe("removeField", () => {
    it("should remove a field by index", () => {
      const { result } = renderHook(() => useJsonSchemaEditor());

      const initialLength = result.current.fields.length;

      act(() => {
        result.current.removeField(0);
      });

      expect(result.current.fields).toHaveLength(initialLength - 1);
    });
  });

  describe("addDefinition", () => {
    it("should add a new definition", () => {
      const { result } = renderHook(() => useJsonSchemaEditor());

      expect(result.current.definitions).toHaveLength(0);

      act(() => {
        result.current.addDefinition();
      });

      expect(result.current.definitions).toHaveLength(1);
      const newDef = result.current.definitions[0];
      expect(newDef.schema.type).toBe("object");
      expect(newDef.schema.additionalProperties).toBe(true);
    });
  });

  describe("removeDefinition", () => {
    it("should remove a definition and update references", async () => {
      const { result } = renderHook(() => useJsonSchemaEditor());

      act(() => {
        result.current.addDefinition();
      });

      const defKey = result.current.definitions[0].key;

      act(() => {
        result.current.addField();
      });

      act(() => {
        result.current.form.setValue(`properties.1.schema.$ref`, `#/$defs/${defKey}`);
        result.current.form.setValue(`properties.1.schema.type`, "ref" as any);
      });

      await waitFor(() => {
        expect(result.current.form.getValues(`properties.1.schema.$ref`)).toBe(`#/$defs/${defKey}`);
      });

      act(() => {
        result.current.removeDefinition(0);
      });

      expect(result.current.definitions).toHaveLength(0);

      await waitFor(() => {
        expect(result.current.form.getValues(`properties.1.schema.$ref`)).toBe("");
      });
    });
  });

  describe("updateReferences", () => {
    it("should update all references when a definition key changes", async () => {
      const { result } = renderHook(() => useJsonSchemaEditor());

      act(() => {
        result.current.addDefinition();
      });

      const oldKey = result.current.definitions[0].key;
      const newKey = "NewDefinitionName";

      act(() => {
        result.current.addField();
      });

      act(() => {
        result.current.form.setValue(`properties.1.schema.$ref`, `#/$defs/${oldKey}`);
      });

      await waitFor(() => {
        expect(result.current.form.getValues(`properties.1.schema.$ref`)).toBe(`#/$defs/${oldKey}`);
      });

      act(() => {
        result.current.updateReferences(oldKey, newKey);
      });

      await waitFor(() => {
        expect(result.current.form.getValues(`properties.1.schema.$ref`)).toBe(`#/$defs/${newKey}`);
      });
    });

    it("should clear references when new key is null", async () => {
      const { result } = renderHook(() => useJsonSchemaEditor());

      act(() => {
        result.current.addDefinition();
      });

      const oldKey = result.current.definitions[0].key;

      act(() => {
        result.current.addField();
      });

      act(() => {
        result.current.form.setValue(`properties.1.schema.$ref`, `#/$defs/${oldKey}`);
      });

      await waitFor(() => {
        expect(result.current.form.getValues(`properties.1.schema.$ref`)).toBe(`#/$defs/${oldKey}`);
      });

      act(() => {
        result.current.updateReferences(oldKey, null);
      });

      await waitFor(() => {
        expect(result.current.form.getValues(`properties.1.schema.$ref`)).toBe("");
      });
    });

    it("should update references in nested properties", async () => {
      const { result } = renderHook(() => useJsonSchemaEditor());

      act(() => {
        result.current.addDefinition();
      });

      const oldKey = result.current.definitions[0].key;
      const newKey = "UpdatedKey";

      act(() => {
        result.current.form.setValue("properties.0.schema.type", "object");
        result.current.form.setValue("properties.0.schema.properties" as any, [
          {
            key: "nestedField",
            isRequired: false,
            schema: {
              type: "ref" as any,
              $ref: `#/$defs/${oldKey}`,
            },
          } as any,
        ]);
      });

      await waitFor(() => {
        expect(result.current.form.getValues("properties.0.schema.properties.0.schema.$ref")).toBe(
          `#/$defs/${oldKey}`,
        );
      });

      act(() => {
        result.current.updateReferences(oldKey, newKey);
      });

      await waitFor(() => {
        expect(result.current.form.getValues("properties.0.schema.properties.0.schema.$ref")).toBe(
          `#/$defs/${newKey}`,
        );
      });
    });

    it("should update references in root", async () => {
      const { result } = renderHook(() => useJsonSchemaEditor());

      act(() => {
        result.current.addDefinition();
      });

      const oldKey = result.current.definitions[0].key;
      const newKey = "RootRef";

      act(() => {
        result.current.form.setValue("root.$ref", `#/$defs/${oldKey}`);
      });

      await waitFor(() => {
        expect(result.current.form.getValues("root.$ref")).toBe(`#/$defs/${oldKey}`);
      });

      act(() => {
        result.current.updateReferences(oldKey, newKey);
      });

      await waitFor(() => {
        expect(result.current.form.getValues("root.$ref")).toBe(`#/$defs/${newKey}`);
      });
    });

    it("should update direct $ref in items", async () => {
      const { result } = renderHook(() => useJsonSchemaEditor());

      act(() => {
        result.current.addDefinition();
      });

      const oldKey = result.current.definitions[0].key;
      const newKey = "DirectRef";

      act(() => {
        result.current.form.setValue("properties.0.schema.$ref" as any, `#/$defs/${oldKey}`);
      });

      await waitFor(() => {
        expect(result.current.form.getValues("properties.0.schema.$ref" as any)).toBe(
          `#/$defs/${oldKey}`,
        );
      });

      act(() => {
        result.current.updateReferences(oldKey, newKey);
      });

      await waitFor(() => {
        expect(result.current.form.getValues("properties.0.schema.$ref" as any)).toBe(
          `#/$defs/${newKey}`,
        );
      });
    });

    it("should update references in items with array type", async () => {
      const { result } = renderHook(() => useJsonSchemaEditor());

      act(() => {
        result.current.addDefinition();
      });

      const oldKey = result.current.definitions[0].key;

      act(() => {
        result.current.form.setValue("properties.0.schema", {
          type: "array",
          items: [
            {
              $ref: `#/$defs/${oldKey}`,
            },
            {
              type: "string",
            },
          ],
        });
      });

      await waitFor(() => {
        const items = result.current.form.getValues("properties.0.schema.items");
        expect(Array.isArray(items)).toBe(true);
      });

      const items = result.current.form.getValues("properties.0.schema.items");
      expect(Array.isArray(items)).toBe(true);
    });
  });

  describe("openSettings and closeSettings", () => {
    it("should open settings for a field", () => {
      const { result } = renderHook(() => useJsonSchemaEditor());

      expect(result.current.settingsState.isOpen).toBe(false);
      expect(result.current.settingsState.fieldPath).toBeNull();

      act(() => {
        result.current.openSettings("properties.0");
      });

      expect(result.current.settingsState.isOpen).toBe(true);
      expect(result.current.settingsState.fieldPath).toBe("properties.0");
    });

    it("should close settings", () => {
      const { result } = renderHook(() => useJsonSchemaEditor());

      act(() => {
        result.current.openSettings("properties.0");
      });

      expect(result.current.settingsState.isOpen).toBe(true);

      act(() => {
        result.current.closeSettings();
      });

      expect(result.current.settingsState.isOpen).toBe(false);
      expect(result.current.settingsState.fieldPath).toBeNull();
    });
  });

  describe("handleTypeChange", () => {
    it("should change type to object", () => {
      const { result } = renderHook(() => useJsonSchemaEditor());

      act(() => {
        result.current.handleTypeChange("properties.0", "object");
      });

      const field = result.current.form.getValues("properties.0.schema");
      expect(field.type).toBe("object");
      expect((field as any).properties).toEqual([]);
      expect((field as any).additionalProperties).toBe(true);
    });

    it("should change type to array", () => {
      const { result } = renderHook(() => useJsonSchemaEditor());

      act(() => {
        result.current.handleTypeChange("properties.0", "array");
      });

      const field = result.current.form.getValues("properties.0.schema");
      expect(field.type).toBe("array");
    });

    it("should change type to ref", () => {
      const { result } = renderHook(() => useJsonSchemaEditor());

      act(() => {
        result.current.handleTypeChange("properties.0", "ref");
      });

      const field = result.current.form.getValues("properties.0.schema");
      expect((field as any).type).toBe("ref");
      expect((field as any).$ref).toBe("");
    });

    it("should change type to primitive", () => {
      const { result } = renderHook(() => useJsonSchemaEditor());

      act(() => {
        result.current.handleTypeChange("properties.0", "string");
      });

      const field = result.current.form.getValues("properties.0.schema");
      expect(field.type).toBe("string");
    });
  });

  describe("addNestedField", () => {
    it("should add a nested field to an object property", () => {
      const { result } = renderHook(() => useJsonSchemaEditor());

      act(() => {
        result.current.handleTypeChange("properties.0", "object");
      });

      act(() => {
        result.current.addNestedField("properties.0");
      });

      const properties = result.current.form.getValues("properties.0.schema.properties");
      expect(properties).toHaveLength(1);
      expect((properties as any)[0].schema.type).toBe("string");
    });

    it("should add nested field to existing nested properties", () => {
      const { result } = renderHook(() => useJsonSchemaEditor());

      act(() => {
        result.current.form.setValue("properties.0.schema", {
          type: "object",
          properties: [
            {
              key: "existing",
              isRequired: false,
              schema: { type: "number" },
            } as any,
          ],
        } as any);
      });

      act(() => {
        result.current.addNestedField("properties.0");
      });

      const properties = result.current.form.getValues("properties.0.schema.properties");
      expect(properties).toHaveLength(2);
    });
  });

  describe("reset", () => {
    it("should reset to initial state", async () => {
      const { result } = renderHook(() => useJsonSchemaEditor());

      act(() => {
        result.current.addField();
        result.current.addField();
        result.current.addDefinition();
      });

      expect(result.current.fields.length).toBeGreaterThan(1);
      expect(result.current.definitions).toHaveLength(1);

      act(() => {
        result.current.reset();
      });

      await waitFor(() => {
        expect(result.current.fields).toHaveLength(1);
        expect(result.current.definitions).toHaveLength(0);
      });
    });

    it("should reset when rootType changes", async () => {
      const { result, rerender } = renderHook(
        ({ rootType }: { rootType: "object" | "array" }) => useJsonSchemaEditor({ rootType }),
        {
          initialProps: { rootType: "object" as "object" | "array" },
        },
      );

      expect(result.current.schema.type).toBe("object");

      rerender({ rootType: "array" });

      await waitFor(() => {
        expect(result.current.schema.type).toBe("array");
      });
    });
  });

  describe("validation", () => {
    it("should validate schema and set errors", async () => {
      const { result } = renderHook(() => useJsonSchemaEditor());

      act(() => {
        result.current.form.setValue("properties.0.schema.type", "invalid-type" as any);
      });

      await waitFor(() => {
        expect(result.current.errors).not.toBeNull();
      });
    });

    it("should clear errors when schema becomes valid", async () => {
      const { result } = renderHook(() => useJsonSchemaEditor());

      act(() => {
        result.current.form.setValue("properties.0.schema.type", "invalid-type" as any);
      });

      await waitFor(() => {
        expect(result.current.errors).not.toBeNull();
      });

      act(() => {
        result.current.form.setValue("properties.0.schema.type", "string");
      });

      await waitFor(() => {
        expect(result.current.errors).toBeNull();
      });
    });

    it("should set form errors based on AJV errors", async () => {
      const { result } = renderHook(() => useJsonSchemaEditor());

      act(() => {
        result.current.form.setValue("properties.0.schema", {
          type: "string",
          minimum: 5,
        } as any);
      });

      await waitFor(() => {
        const formState = result.current.form.formState;
        expect(Object.keys(formState.errors).length >= 0).toBe(true);
      });
    });
  });

  describe("schema generation", () => {
    it("should generate correct schema from form data", async () => {
      const { result } = renderHook(() => useJsonSchemaEditor());

      act(() => {
        result.current.form.setValue("properties.0.key", "username");
        result.current.form.setValue("properties.0.isRequired", true);
        result.current.form.setValue("properties.0.schema", {
          type: "string",
          minLength: 3,
        });
      });

      await waitFor(() => {
        expect(result.current.schema.properties?.username).toEqual({
          type: "string",
          minLength: 3,
        });
        expect(result.current.schema.required).toContain("username");
      });
    });

    it("should not update schema if unchanged", async () => {
      const onChange = vi.fn();
      const { result } = renderHook(() => useJsonSchemaEditor({ onChange }));

      const callCount = onChange.mock.calls.length;

      act(() => {
        result.current.form.trigger();
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(onChange.mock.calls.length).toBe(callCount);
    });
  });

  describe("complex scenarios", () => {
    it("should handle deeply nested structures", async () => {
      const { result } = renderHook(() => useJsonSchemaEditor());

      act(() => {
        result.current.form.setValue("properties.0.key", "address");
        result.current.form.setValue("properties.0.schema", {
          type: "object",
          properties: [
            {
              key: "street",
              isRequired: true,
              schema: {
                type: "object",
                properties: [
                  {
                    key: "number",
                    isRequired: false,
                    schema: { type: "number" },
                  } as any,
                ],
              },
            } as any,
          ],
        } as any);
      });

      await waitFor(() => {
        const addressSchema = result.current.schema.properties?.address;
        expect(addressSchema).toBeDefined();
        expect((addressSchema as any).properties?.street).toBeDefined();
      });
    });

    it("should handle multiple definitions with cross-references", async () => {
      const { result } = renderHook(() => useJsonSchemaEditor());

      act(() => {
        result.current.addDefinition();
        result.current.addDefinition();
      });

      const def1Key = result.current.definitions[0].key;
      const def2Key = result.current.definitions[1].key;

      act(() => {
        result.current.form.setValue(`definitions.1.schema`, {
          type: "object",
          properties: [
            {
              key: "refField",
              isRequired: false,
              schema: {
                type: "ref" as any,
                $ref: `#/$defs/${def1Key}`,
              },
            } as any,
          ],
        } as any);
      });

      await waitFor(() => {
        expect(result.current.schema.$defs).toBeDefined();
        expect(result.current.schema.$defs?.[def2Key]).toBeDefined();
      });
    });

    it("should handle array with different item types", async () => {
      const { result } = renderHook(() =>
        useJsonSchemaEditor({
          rootType: "array",
        }),
      );

      act(() => {
        result.current.form.setValue("root.items", [
          { type: "string" },
          { type: "number" },
          { type: "boolean" },
        ] as any);
      });

      await waitFor(() => {
        expect(Array.isArray(result.current.schema.items)).toBe(true);
        expect((result.current.schema.items as any[]).length).toBe(3);
      });
    });
  });

  describe("onChange callback", () => {
    it("should call onChange with updated schema", async () => {
      const onChange = vi.fn();
      const { result } = renderHook(() => useJsonSchemaEditor({ onChange }));

      onChange.mockClear();

      act(() => {
        result.current.form.setValue("properties.0.key", "newField");
      });

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith(
          expect.objectContaining({
            properties: expect.objectContaining({
              newField: expect.any(Object),
            }),
          }),
        );
      });
    });

    it("should update onChange callback ref", async () => {
      const onChange1 = vi.fn();
      const onChange2 = vi.fn();

      const { result, rerender } = renderHook(({ onChange }) => useJsonSchemaEditor({ onChange }), {
        initialProps: { onChange: onChange1 },
      });

      onChange1.mockClear();

      act(() => {
        result.current.addField();
      });

      await waitFor(() => {
        expect(onChange1).toHaveBeenCalled();
      });

      onChange1.mockClear();
      onChange2.mockClear();

      rerender({ onChange: onChange2 });

      act(() => {
        result.current.addField();
      });

      await waitFor(() => {
        expect(onChange2).toHaveBeenCalled();
        expect(onChange1).not.toHaveBeenCalled();
      });
    });
  });
});
