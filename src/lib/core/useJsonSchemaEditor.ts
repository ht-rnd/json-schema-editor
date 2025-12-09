import { zodResolver } from "@hookform/resolvers/zod";
import type { ErrorObject } from "ajv/dist/2020";
import { nanoid } from "nanoid";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { formToSchema, schemaToForm } from "./transforms";
import type {
  FieldItem,
  FormSchema,
  JSONSchema,
  JsonSchemaEditorOptions,
  SettingsState,
} from "./types";
import { formSchema } from "./types";
import { validateSchema } from "./validator";

export interface UseJsonSchemaEditorReturn {
  /** The current JSON Schema output */
  schema: JSONSchema;
  /** Validation errors from AJV, or null if valid */
  errors: ErrorObject[] | null;
  /** Field array items for rendering */
  fields: FieldItem[];
  /** React Hook Form methods for direct access */
  form: ReturnType<typeof useForm<FormSchema>>;
  /** Settings dialog state */
  settingsState: SettingsState;
  /** Add a new field to the schema */
  addField: () => void;
  /** Remove a field by index */
  removeField: (index: number) => void;
  /** Open settings for a specific field path */
  openSettings: (path: string) => void;
  /** Close the settings dialog */
  closeSettings: () => void;
  /** Handle type change for a field */
  handleTypeChange: (fieldPath: string, newType: string) => void;
  /** Add a nested field to an object field */
  addNestedField: (parentPath: string) => void;
  /** Reset the editor to default state */
  reset: () => void;
}

/**
 * Headless hook for building JSON Schema editors.
 *
 * Provides all the state management, validation, and actions needed
 * to build a JSON Schema editor UI.
 *
 * @example
 * ```tsx
 * const editor = useJsonSchemaEditor({
 *   rootType: 'object',
 *   onChange: (schema) => console.log(schema)
 * });
 *
 * // Use editor.form with FormProvider for react-hook-form integration
 * // Use editor.fields to render field list
 * // Use editor.schema to get the current JSON Schema
 * ```
 */
export function useJsonSchemaEditor(
  options: JsonSchemaEditorOptions = {},
): UseJsonSchemaEditorReturn {
  const { rootType = "object", defaultValue, onChange } = options;

  // Store onChange in a ref to avoid infinite loops
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Generate initial field ID
  const initialId = useMemo(() => nanoid(6), []);

  // Create default form values
  const getDefaultValues = useCallback(
    (id: string): FormSchema => ({
      root: {
        type: rootType,
        $schema: "http://json-schema.org/draft/2020-12/schema",
        ...(rootType === "object" && { additionalProperties: true }),
        ...(rootType === "array" && { items: { type: "string" } }),
      },
      properties:
        rootType === "object"
          ? [
              {
                id: id,
                key: `field_${id}`,
                isRequired: false,
                schema: { type: "number" },
              },
            ]
          : [],
    }),
    [rootType],
  );

  // Initialize form
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: defaultValue ? schemaToForm(defaultValue) : getDefaultValues(initialId),
  });

  const { setError, clearErrors, setValue, reset: formReset, getValues } = form;

  // Field array management
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "properties",
    keyName: "fieldId",
  });

  // Schema state - updated via subscription to avoid infinite loops
  const [jsonSchema, setJsonSchema] = useState<JSONSchema>(() => formToSchema(getValues()));

  // Validation state
  const [ajvErrors, setAjvErrors] = useState<ErrorObject[] | null>(null);

  // Settings dialog state
  const [settingsState, setSettingsState] = useState<SettingsState>({
    isOpen: false,
    fieldPath: null,
  });

  // Track previous schema string to avoid unnecessary updates
  const prevSchemaStringRef = useRef<string>("");

  // Subscribe to form changes and update schema
  useEffect(() => {
    const subscription = form.watch((formData) => {
      const newSchema = formToSchema(formData as FormSchema);
      const newSchemaString = JSON.stringify(newSchema);

      // Only update if schema content actually changed
      if (newSchemaString !== prevSchemaStringRef.current) {
        prevSchemaStringRef.current = newSchemaString;
        setJsonSchema(newSchema);

        // Call onChange callback
        onChangeRef.current?.(newSchema);

        // Validate schema
        const newErrors = validateSchema(newSchema);
        setAjvErrors((prev) => {
          if (JSON.stringify(newErrors) !== JSON.stringify(prev)) {
            return newErrors;
          }
          return prev;
        });
      }
    });

    return () => subscription.unsubscribe();
  }, [form]);

  // Map validation errors to form fields
  useEffect(() => {
    clearErrors();
    if (ajvErrors) {
      const properties = getValues("properties");
      ajvErrors.forEach((error) => {
        const pathParts = error.instancePath.split("/").filter(Boolean);
        if (pathParts[0] === "properties" && pathParts.length >= 3) {
          const propertyIndex = properties?.findIndex((p) => p.key === pathParts[1]) ?? -1;

          if (propertyIndex !== -1) {
            setError(`properties.${propertyIndex}.schema.${pathParts[2]}` as any, {
              type: "ajv",
              message: error.message,
            });
          }
        } else if (pathParts.length > 0) {
          setError(`root.${pathParts[0]}` as any, {
            type: "ajv",
            message: error.message,
          });
        }
      });
    }
  }, [ajvErrors, clearErrors, setError, getValues]);

  // Reset when rootType changes (and no defaultValue)
  useEffect(() => {
    if (!defaultValue) {
      const id = nanoid(6);
      formReset(getDefaultValues(id));
    }
  }, [rootType, formReset, defaultValue, getDefaultValues]);

  // Actions
  const addField = useCallback(() => {
    const id = nanoid(6);
    append({
      id,
      key: `field_${id}`,
      isRequired: false,
      schema: { type: "string" },
    });
  }, [append]);

  const removeField = useCallback(
    (index: number) => {
      remove(index);
    },
    [remove],
  );

  const openSettings = useCallback((path: string) => {
    setSettingsState({ isOpen: true, fieldPath: path });
  }, []);

  const closeSettings = useCallback(() => {
    setSettingsState({ isOpen: false, fieldPath: null });
  }, []);

  const handleTypeChange = useCallback(
    (fieldPath: string, newType: string) => {
      let newValue = {};
      if (newType === "object") {
        newValue = { type: "object", properties: [], additionalProperties: true };
      } else if (newType === "array") {
        newValue = { type: "array" };
      } else {
        newValue = { type: newType };
      }
      setValue(`${fieldPath}.schema` as any, newValue);
    },
    [setValue],
  );

  const addNestedField = useCallback(
    (parentPath: string) => {
      const id = nanoid(6);
      const currentProperties =
        (getValues(`${parentPath}.schema.properties` as any) as any[]) || [];
      setValue(`${parentPath}.schema.properties` as any, [
        ...currentProperties,
        {
          id,
          key: `field_${id}`,
          isRequired: false,
          schema: { type: "string" },
        },
      ]);
    },
    [setValue, getValues],
  );

  const reset = useCallback(() => {
    const id = nanoid(6);
    formReset(getDefaultValues(id));
  }, [formReset, getDefaultValues]);

  return {
    schema: jsonSchema,
    errors: ajvErrors,
    fields: fields as FieldItem[],
    form,
    settingsState,
    addField,
    removeField,
    openSettings,
    closeSettings,
    handleTypeChange,
    addNestedField,
    reset,
  };
}
