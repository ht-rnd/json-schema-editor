import { useEffect, useRef, useState } from "react";
import { FormProvider, useFieldArray } from "react-hook-form";
import { nanoid } from "nanoid";
import { Root } from "./form/Root";
import { Field } from "./form/Field";
import { FieldList } from "./form/FieldList";
import { SettingsDialog } from "./settings/SettingsDialog";
import { useSchemaForm } from "../../hooks/useSchemaForm";
import {
  defaultStyles,
  heightMap,
  layoutMap,
  outputHeightMap,
  settingsWidthMap,
  spacingMap,
  widthMap,
} from "../../consts/consts";
import { cn } from "../../utils/utils";
import { validateSchema } from "../../utils/validator";
import { JsonSchemaEditorProps, Styles } from "../../interfaces/interfaces";
import { AutosizeTextarea, AutosizeTextAreaRef } from "../ui/autosize-textarea";
import { Badge } from "../ui/badge";

export const JsonSchemaEditor = ({
  rootType = "object",
  readOnly = false,
  theme = "light",
  styles,
  onChange,
  defaultValue,
}: JsonSchemaEditorProps) => {
  const { methods, jsonSchema } = useSchemaForm({ rootType, defaultValue });

  const { setError, clearErrors, getValues } = methods;
  const [ajvErrors, setAjvErrors] = useState<any[] | null>(null);

  useEffect(() => {
    if (onChange) {
      onChange(jsonSchema);
    }
  }, [jsonSchema, onChange]);

  useEffect(() => {
    const newErrors = validateSchema(jsonSchema);
    if (JSON.stringify(newErrors) !== JSON.stringify(ajvErrors)) {
      setAjvErrors(newErrors);
    }
  }, [jsonSchema, ajvErrors]);

  useEffect(() => {
    clearErrors();
    if (ajvErrors) {
      const properties = getValues("properties");

      ajvErrors.forEach((error) => {
        const pathParts = error.instancePath.split("/").filter(Boolean);
        if (pathParts[0] === "properties" && pathParts.length >= 3) {
          const propertyIndex =
            properties?.findIndex((p) => p.key === pathParts[1]) ?? -1;

          if (propertyIndex !== -1) {
            setError(
              `properties.${propertyIndex}.schema.${pathParts[2]}` as any,
              {
                type: "ajv",
                message: error.message,
              }
            );
          }
        } else if (pathParts.length > 0) {
          setError(`root.${pathParts[0]}`, {
            type: "ajv",
            message: error.message,
          });
        }
      });
    }
  }, [ajvErrors, getValues, setError, clearErrors]);

  useEffect(() => {
    if (!defaultValue) {
      const id = nanoid(6);
      const newDefaultValues = {
        root: {
          type: rootType,
          $schema: "http://json-schema.org/draft/2020-12/schema",
          ...(rootType === "object" && { additionalProperties: true }),
          ...(rootType === "array" && { items: { type: "string" as any } }),
        },
        properties:
          rootType === "object"
            ? [
                {
                  id: id,
                  key: `field_${id}`,
                  isRequired: false,
                  schema: { type: "number" as any },
                },
              ]
            : [],
      };
      methods.reset(newDefaultValues);
    }
  }, [rootType, methods, defaultValue]);

  const { fields, append, remove } = useFieldArray({
    control: methods.control,
    name: "properties",
    keyName: "fieldId",
  });

  const handleAddField = () => {
    const id = nanoid(6);
    append({
      id,
      key: `field_${id}`,
      isRequired: false,
      schema: { type: "string" },
    });
  };

  const [settings, setSettings] = useState<{
    isOpen: boolean;
    fieldPath: string | null;
  }>({ isOpen: false, fieldPath: null });

  const openSettings = (path: string) => {
    setSettings({ isOpen: true, fieldPath: path });
  };

  const finalStyles: Styles = {
    ...defaultStyles,
    ...styles,
    output: { ...defaultStyles.output, ...styles?.output },
    form: { ...defaultStyles.form, ...styles?.form },
    settings: { ...defaultStyles.settings, ...styles?.settings },
  };
  const textareaRef = useRef<AutosizeTextAreaRef>(null);
  const [overflowClass, setOverflowClass] = useState("overflow-hidden");
  useEffect(() => {
    const textAreaElement = textareaRef.current?.textArea;
    if (textAreaElement) {
      if (textAreaElement.scrollHeight > textAreaElement.clientHeight) {
        setOverflowClass("overflow-y-auto");
      } else {
        setOverflowClass("overflow-hidden");
      }
    }
  }, [jsonSchema]);

  return (
    <FormProvider {...methods}>
      <div
        className={cn(
          "bg-background text-foreground flex flex-col",
          theme,
          spacingMap[finalStyles.spacing]
        )}
      >
        <div
          className={cn(
            "bg-background text-foreground flex",
            theme,
            layoutMap[finalStyles.output.position],
            spacingMap[finalStyles.spacing]
          )}
        >
          <div
            className={cn(
              "p-4 pr-2 flex flex-col gap-2 border border-input rounded-lg overflow-y-auto",
              widthMap[finalStyles.form.width],
              heightMap[finalStyles.form.height]
            )}
          >
            <Root
              theme={theme}
              readOnly={readOnly}
              rootType={rootType}
              onAddField={handleAddField}
              onOpenSettings={openSettings}
            />
            {rootType === "object" && (
              <FieldList
                theme={theme}
                readOnly={readOnly}
                fields={fields}
                onRemove={remove}
                onOpenSettings={openSettings}
              />
            )}
            {rootType === "array" && (
              <div className="ml-2 pl-2 border-l-2 border-input">
                <Field
                  theme={theme}
                  readOnly={readOnly}
                  fieldPath="root.items"
                  onRemove={() => {}}
                  onOpenSettings={openSettings}
                  isSimpleType={false}
                  isRootLevel={false}
                />
              </div>
            )}
          </div>

          {ajvErrors ? (
            <div
              className={cn(
                "p-6 bg-background text-foreground border border-input rounded-lg overflow-y-auto overflow-x-auto",
                widthMap[finalStyles.output.width],
                heightMap[finalStyles.output.height]
              )}
            >
              <p className="text-lg">JSON Schema Errors</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {`The generated JSON Schema has ${ajvErrors?.length}
                    ${ajvErrors?.length > 1 ? "errors." : "error."}`}
              </p>

              <ul className="mt-4 flex flex-col gap-2">
                {ajvErrors?.map((error, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <Badge variant="destructive" className="font-mono">
                      root{error.instancePath}
                    </Badge>
                    <span>{error.message}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            finalStyles.output.showJson && (
              <AutosizeTextarea
                ref={textareaRef}
                readOnly
                maxHeight={outputHeightMap[finalStyles.output.height]}
                value={JSON.stringify(jsonSchema, null, 2)}
                className={cn(
                  "font-mono",
                  widthMap[finalStyles.output.width],
                  overflowClass
                )}
              />
            )
          )}
        </div>
      </div>

      <SettingsDialog
        theme={theme}
        readOnly={readOnly}
        isOpen={settings.isOpen}
        fieldPath={settings.fieldPath}
        className={settingsWidthMap[finalStyles.settings.width]}
        onClose={() => setSettings({ isOpen: false, fieldPath: null })}
      />
    </FormProvider>
  );
};
