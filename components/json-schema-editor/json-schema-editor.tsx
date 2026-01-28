import { useJsonSchemaEditor } from "@ht-rnd/json-schema-editor";
import { nanoid } from "nanoid";
import * as React from "react";
import { FormProvider, useFieldArray } from "react-hook-form";
import { Field, FieldList, Root } from "./json-schema-form";
import { SettingsDialog } from "./json-schema-settings";
import {
  defaultStyles,
  heightMap,
  layoutMap,
  outputHeightMap,
  type Styles,
  settingsWidthMap,
  spacingMap,
  widthMap,
} from "./lib/constants";
import { cn } from "./lib/utils";
import { type AutosizeTextAreaRef, AutosizeTextarea } from "./ui/autosize-textarea";
import { Badge } from "./ui/badge";

export interface JsonSchemaEditorProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  rootType?: "object" | "array";
  defaultValue?: any;
  onChange?: (schema: any) => void;
  readOnly?: boolean;
  showOutput?: boolean;
  styles?: Partial<Styles>;
}

const JsonSchemaEditor = React.forwardRef<HTMLDivElement, JsonSchemaEditorProps>(
  (
    {
      className,
      rootType = "object",
      readOnly = false,
      showOutput = true,
      onChange,
      defaultValue,
      styles,
      ...props
    },
    ref,
  ) => {
    const editor = useJsonSchemaEditor({ rootType, defaultValue, onChange });

    const { fields, append, remove } = useFieldArray({
      control: editor.form.control,
      name: "properties",
      keyName: "fieldId",
    });

    const finalStyles: Styles = {
      ...defaultStyles,
      ...styles,
      output: { ...defaultStyles.output, ...styles?.output },
      form: { ...defaultStyles.form, ...styles?.form },
      settings: { ...defaultStyles.settings, ...styles?.settings },
    };

    const textareaRef = React.useRef<AutosizeTextAreaRef>(null);
    const [overflowClass, setOverflowClass] = React.useState("overflow-hidden");

    React.useEffect(() => {
      const textAreaElement = textareaRef.current?.textArea;
      if (textAreaElement) {
        if (textAreaElement.scrollHeight > textAreaElement.clientHeight) {
          setOverflowClass("overflow-y-auto");
        } else {
          setOverflowClass("overflow-hidden");
        }
      }
    }, [editor.schema]);

    const handleAddField = () => {
      const id = nanoid(6);
      append({
        id,
        key: `field_${id}`,
        isRequired: false,
        schema: { type: "string" },
      });
    };

    return (
      <FormProvider {...editor.form}>
        <div
          ref={ref}
          className={cn(
            "bg-background text-foreground flex flex-col",
            spacingMap[finalStyles.spacing],
            className,
          )}
          {...props}
        >
          <div
            className={cn(
              "bg-background text-foreground flex",
              layoutMap[finalStyles.output.position],
              spacingMap[finalStyles.spacing],
            )}
          >
            <div
              className={cn(
                "p-4 pr-2 flex flex-col gap-2 border border-input rounded-lg overflow-y-auto",
                widthMap[finalStyles.form.width],
                heightMap[finalStyles.form.height],
              )}
            >
              <Root
                readOnly={readOnly}
                rootType={rootType}
                onAddField={handleAddField}
                onOpenSettings={editor.openSettings}
              />
              {rootType === "object" && (
                <FieldList
                  readOnly={readOnly}
                  fields={fields as any}
                  onRemove={remove}
                  onOpenSettings={editor.openSettings}
                />
              )}
              {rootType === "array" && (
                <div className="ml-2 pl-2 border-l-2 border-input">
                  <Field
                    readOnly={readOnly}
                    fieldPath="root.items"
                    onRemove={() => {}}
                    onOpenSettings={editor.openSettings}
                    defs={false}
                    isRootLevel={false}
                    isSchemaDirect={true}
                  />
                </div>
              )}
            </div>

            {editor.errors ? (
              <div
                className={cn(
                  "p-6 bg-background text-foreground border border-input rounded-lg overflow-y-auto overflow-x-auto",
                  widthMap[finalStyles.output.width],
                  heightMap[finalStyles.output.height],
                )}
              >
                <p className="text-lg">JSON Schema Errors</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {`The generated JSON Schema has ${editor.errors.length} ${
                    editor.errors.length > 1 ? "errors." : "error."
                  }`}
                </p>
                <ul className="mt-4 flex flex-col gap-2">
                  {editor.errors.map((error: any, index: any) => (
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
                  value={JSON.stringify(editor.schema, null, 2)}
                  className={cn("font-mono", widthMap[finalStyles.output.width], overflowClass)}
                />
              )
            )}
          </div>
        </div>

        <SettingsDialog
          readOnly={readOnly}
          isOpen={editor.settingsState.isOpen}
          fieldPath={editor.settingsState.fieldPath}
          onClose={editor.closeSettings}
          className={settingsWidthMap[finalStyles.settings.width]}
        />
      </FormProvider>
    );
  },
);
JsonSchemaEditor.displayName = "JsonSchemaEditor";

export { JsonSchemaEditor };
