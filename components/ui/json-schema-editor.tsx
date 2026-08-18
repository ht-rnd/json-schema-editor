import {
  extractJsonSchema,
  type JSONSchema,
  useJsonSchemaEditor,
} from "@ht-rnd/json-schema-editor";
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
  onRootTypeChange?: (rootType: "object" | "array", schema?: JSONSchema) => void;
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
      onRootTypeChange,
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
    const [jsonText, setJsonText] = React.useState(() => JSON.stringify(editor.schema, null, 2));
    const [jsonEditError, setJsonEditError] = React.useState<string | null>(null);
    const [isJsonFocused, setIsJsonFocused] = React.useState(false);

    React.useEffect(() => {
      if (!isJsonFocused) {
        setJsonText(JSON.stringify(editor.schema, null, 2));
        setJsonEditError(null);
      }
    }, [editor.schema, isJsonFocused]);

    const handleAddField = () => {
      const id = nanoid(6);
      append({
        id,
        key: `field_${id}`,
        isRequired: false,
        schema: { type: "string" },
      });
    };

    const applyJsonText = (text: string) => {
      setJsonText(text);

      if (readOnly) return;

      if (text.trim() === "") {
        setJsonEditError("JSON cannot be empty.");
        return;
      }

      try {
        const parsed = JSON.parse(text);
        const schema = extractJsonSchema(parsed);
        const nextRootType = schema.type === "array" ? "array" : "object";

        setJsonEditError(null);

        if (nextRootType !== rootType) {
          onRootTypeChange?.(nextRootType, schema);
          return;
        }

        editor.loadSchema(schema);
      } catch (error) {
        setJsonEditError(error instanceof Error ? error.message : "Invalid JSON.");
      }
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
                  <span>{readOnly ? "JSON Output" : "JSON (edit / paste)"}</span>
                  {isOutputCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                </button>

                {!isOutputCollapsed && (
                  <div className="flex flex-col gap-2 px-2 pb-2">
                    {editor.errors && (
                      <div className="px-4 pt-2 text-foreground">
                        <p className="text-sm text-muted-foreground">
                          {`Schema has ${editor.errors.length} ${
                            editor.errors.length > 1 ? "errors" : "error"
                          }:`}
                        </p>
                        <ul className="mt-2 flex flex-col gap-2">
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
                    )}

                    <AutosizeTextarea
                      ref={textareaRef}
                      readOnly={readOnly}
                      value={jsonText}
                      minHeight={200}
                      maxHeight={480}
                      placeholder='Paste a JSON Schema or a document with "targetEntitySchema"…'
                      className="font-mono text-sm border-0 resize-none h-full min-h-[200px] max-h-[480px]"
                      onFocus={() => setIsJsonFocused(true)}
                      onBlur={() => {
                        setIsJsonFocused(false);
                        if (!jsonEditError) {
                          setJsonText(JSON.stringify(editor.schema, null, 2));
                        }
                      }}
                      onChange={(e) => applyJsonText(e.target.value)}
                    />

                    {jsonEditError && (
                      <p className="px-4 pb-2 text-sm text-destructive">{jsonEditError}</p>
                    )}
                  </div>
                )}
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
