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
  schema: JSONSchema;
  errors: ErrorObject[] | null;
  fields: FieldItem[];
  form: ReturnType<typeof useForm<FormSchema>>;
  settingsState: SettingsState;
  addField: () => void;
  removeField: (index: number) => void;
  openSettings: (path: string) => void;
  closeSettings: () => void;
  handleTypeChange: (fieldPath: string, newType: string) => void;
  addNestedField: (parentPath: string) => void;
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

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const initialId = useMemo(() => nanoid(6), []);

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

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: defaultValue ? schemaToForm(defaultValue) : getDefaultValues(initialId),
  });

  const { setError, clearErrors, setValue, reset: formReset, getValues } = form;

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "properties",
    keyName: "fieldId",
  });

  const [jsonSchema, setJsonSchema] = useState<JSONSchema>(() => formToSchema(getValues()));
  const [ajvErrors, setAjvErrors] = useState<ErrorObject[] | null>(null);
  const [settingsState, setSettingsState] = useState<SettingsState>({
    isOpen: false,
    fieldPath: null,
  });

  const prevSchemaStringRef = useRef<string>("");

  useEffect(() => {
    const subscription = form.watch((formData) => {
      const newSchema = formToSchema(formData as FormSchema);
      const newSchemaString = JSON.stringify(newSchema);

      if (newSchemaString !== prevSchemaStringRef.current) {
        prevSchemaStringRef.current = newSchemaString;
        setJsonSchema(newSchema);

        onChangeRef.current?.(newSchema);

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

  useEffect(() => {
    if (!defaultValue) {
      const id = nanoid(6);
      formReset(getDefaultValues(id));
    }
  }, [rootType, formReset, defaultValue, getDefaultValues]);

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
        newValue = {
          type: "object",
          properties: [],
          additionalProperties: true,
        };
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
