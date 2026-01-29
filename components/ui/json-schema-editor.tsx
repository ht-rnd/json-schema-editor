import { useJsonSchemaEditor } from "@ht-rnd/json-schema-editor";
import { nanoid } from "nanoid";
import * as React from "react";
import { FormProvider, useFieldArray } from "react-hook-form";
import { cn } from "@/lib/utils";
import { type AutosizeTextAreaRef, AutosizeTextarea } from "./autosize-textarea";
import { Badge } from "./badge";
import { Field, FieldList, Root } from "./json-schema-form";
import { SettingsDialog } from "./json-schema-settings";

export interface JsonSchemaEditorProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  rootType?: "object" | "array";
  defaultValue?: any;
  onChange?: (schema: any) => void;
  readOnly?: boolean;
  showOutput?: boolean;
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

    const textareaRef = React.useRef<AutosizeTextAreaRef>(null);

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
        <div ref={ref} className={cn("w-full", className)} {...props}>
          <div className="flex flex-col gap-4 w-full">
            <div className="p-4 flex flex-col gap-3 border border-input rounded-lg overflow-auto bg-background w-full max-h-[600px]">
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
                <div className="ml-2 pl-3 border-l-2 border-input">
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
              <div className="p-6 bg-background text-foreground border border-input rounded-lg overflow-auto w-full min-h-[200px] max-h-[400px]">
                <p className="text-lg font-semibold">JSON Schema Errors</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {`The generated JSON Schema has ${editor.errors.length} ${
                    editor.errors.length > 1 ? "errors." : "error."
                  }`}
                </p>
                <ul className="mt-4 flex flex-col gap-2">
                  {editor.errors.map((error: any, index: any) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Badge variant="destructive" className="font-mono text-xs shrink-0">
                        root{error.instancePath}
                      </Badge>
                      <span>{error.message}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              showOutput && (
                <div className="border border-input rounded-lg bg-background overflow-auto w-full min-h-[200px] max-h-[400px]">
                  <AutosizeTextarea
                    ref={textareaRef}
                    readOnly
                    value={JSON.stringify(editor.schema, null, 2)}
                    minHeight={200}
                    className="font-mono text-sm border-0 resize-none h-full min-h-[200px]"
                  />
                </div>
              )
            )}
          </div>
        </div>

        <SettingsDialog
          readOnly={readOnly}
          isOpen={editor.settingsState.isOpen}
          fieldPath={editor.settingsState.fieldPath}
          onClose={editor.closeSettings}
        />
      </FormProvider>
    );
  },
);
JsonSchemaEditor.displayName = "JsonSchemaEditor";

export { JsonSchemaEditor };
