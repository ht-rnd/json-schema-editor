import { type JsonSchemaEditorOptions, useJsonSchemaEditor } from "@ht-rnd/json-schema-editor";
import { nanoid } from "nanoid";
import * as React from "react";
import { FormProvider, useFieldArray } from "react-hook-form";
import { Field } from "./field";
import { FieldList } from "./field-list";
import { cn } from "./lib/utils";
import { Root } from "./root";
import { SettingsDialog } from "./settings-dialog";
import { AutosizeTextarea } from "./ui/autosize-textarea";
import { Badge } from "./ui/badge";

export interface JsonSchemaEditorProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange">,
    JsonSchemaEditorOptions {
  /** Whether the form is read-only */
  readOnly?: boolean;
  /** Whether to show the JSON output panel */
  showOutput?: boolean;
}

const JsonSchemaEditor = React.forwardRef<HTMLDivElement, JsonSchemaEditorProps>(
  (
    { className, rootType = "object", readOnly = false, showOutput = true, onChange, defaultValue, ...props },
    ref,
  ) => {
    const editor = useJsonSchemaEditor({ rootType, defaultValue, onChange });

    const { fields, append, remove } = useFieldArray({
      control: editor.form.control,
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

    return (
      <FormProvider {...editor.form}>
        <div
          ref={ref}
          className={cn("bg-background text-foreground flex flex-col gap-4", className)}
          {...props}
        >
          {/* Form Panel - modify classes here to change layout */}
          <div className="p-4 pr-2 flex flex-col gap-2 border border-input rounded-lg overflow-y-auto max-h-[600px]">
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
                  isSimpleType={false}
                  isRootLevel={false}
                />
              </div>
            )}
          </div>

          {/* Error Panel */}
          {editor.errors && (
            <div className="p-6 bg-background text-foreground border border-input rounded-lg overflow-auto">
              <p className="text-lg">JSON Schema Errors</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {`The generated JSON Schema has ${editor.errors.length} ${editor.errors.length > 1 ? "errors." : "error."}`}
              </p>
              <ul className="mt-4 flex flex-col gap-2">
                {editor.errors.map((error, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <Badge variant="destructive" className="font-mono">
                      root{error.instancePath}
                    </Badge>
                    <span>{error.message}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Output Panel - modify or remove as needed */}
          {showOutput && !editor.errors && (
            <AutosizeTextarea
              readOnly
              maxHeight={500}
              value={JSON.stringify(editor.schema, null, 2)}
              className="font-mono"
            />
          )}
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
