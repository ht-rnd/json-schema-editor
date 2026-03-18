import { useJsonSchemaEditor } from "@ht-rnd/json-schema-editor";
import { ChevronDown, ChevronUp, TriangleAlert } from "lucide-react";
import { nanoid } from "nanoid";
import * as React from "react";
import { FormProvider, useFieldArray } from "react-hook-form";
import { cn } from "@/lib/utils";
import { type AutosizeTextAreaRef, AutosizeTextarea } from "./autosize-textarea";
import { Badge } from "./badge";
import { Field, FieldList, Root } from "./json-schema-form";
import { SettingsDialog } from "./json-schema-settings";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

export interface JsonSchemaEditorProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  rootType?: "object" | "array";
  defaultValue?: any;
  onChange?: (schema: any) => void;
  readOnly?: boolean;
  showOutput?: boolean;
  defaultOutputCollapsed?: boolean;
}

const JsonSchemaEditor = React.forwardRef<HTMLDivElement, JsonSchemaEditorProps>(
  (
    {
      className,
      rootType = "object",
      readOnly = false,
      showOutput = true,
      defaultOutputCollapsed = false,
      onChange,
      defaultValue,
      ...props
    },
    ref,
  ) => {
    const editor = useJsonSchemaEditor({
      rootType,
      defaultValue,
      onChange,
    });

    const { fields, append, remove } = useFieldArray({
      control: editor.form.control,
      name: "properties",
      keyName: "fieldId",
    });

    const textareaRef = React.useRef<AutosizeTextAreaRef>(null);
    const [isOutputCollapsed, setIsOutputCollapsed] = React.useState(defaultOutputCollapsed);

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
            <div className="relative p-4 flex flex-col gap-3 border border-input rounded-lg overflow-auto bg-background w-full max-h-[600px]">
              {editor.errors && !showOutput && (
                <div className="absolute bottom-2 left-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-default">
                        <TriangleAlert size={16} className="text-destructive" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      {`${editor.errors.length} schema ${editor.errors.length === 1 ? "error" : "errors"}`}
                    </TooltipContent>
                  </Tooltip>
                </div>
              )}
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

            {showOutput && (
              <div className="border border-input rounded-lg bg-background w-full overflow-hidden">
                <button
                  type="button"
                  onClick={() => setIsOutputCollapsed((prev) => !prev)}
                  className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium hover:bg-muted/50 transition-colors"
                >
                  <span>{editor.errors ? "JSON Schema Errors" : "JSON Output"}</span>
                  {isOutputCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                </button>

                {!isOutputCollapsed &&
                  (editor.errors ? (
                    <div className="px-6 pb-6 text-foreground overflow-auto max-h-[360px]">
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
                    <AutosizeTextarea
                      ref={textareaRef}
                      readOnly
                      value={JSON.stringify(editor.schema, null, 2)}
                      minHeight={200}
                      className="font-mono text-sm border-0 resize-none h-full min-h-[200px] max-h-[400px]"
                    />
                  ))}
              </div>
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
