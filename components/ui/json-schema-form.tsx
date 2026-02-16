import { SCHEMA_TYPES } from "@ht-rnd/json-schema-editor";
import { Link2, PlusCircle, Settings, Trash2, TriangleAlert } from "lucide-react";
import { nanoid } from "nanoid";
import * as React from "react";
import type { FieldArrayWithId } from "react-hook-form";
import { Controller, useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./alert-dialog";
import { Button } from "./button";
import { Input } from "./input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";

export interface DefinitionItem {
  id: string;
  key: string;
  schema: any;
}

export interface FieldProps extends React.HTMLAttributes<HTMLDivElement> {
  readOnly?: boolean;
  fieldPath: string;
  defs?: boolean;
  onRemove?: () => void;
  onOpenSettings?: (path: string) => void;
  onKeyChange?: (oldKey: string, newKey: string) => void;
  isRootLevel?: boolean;
  isSchemaDirect?: boolean;
}

export interface FieldRowProps extends React.HTMLAttributes<HTMLDivElement> {
  readOnly?: boolean;
  control: any;
  fieldPath: string;
  schemaPath: string;
  defs?: boolean;
  isRootLevel?: boolean;
  onRemove?: () => void;
  onOpenSettings?: (path: string) => void;
  onTypeChange?: (newType: string) => void;
  onKeyChange?: (oldKey: string, newKey: string) => void;
}

export interface FieldListProps extends React.HTMLAttributes<HTMLDivElement> {
  readOnly?: boolean;
  fields: FieldArrayWithId<any, "properties", "fieldId">[];
  onRemove?: (index: number) => void;
  onOpenSettings?: (path: string) => void;
}

export interface RootProps extends React.HTMLAttributes<HTMLDivElement> {
  readOnly?: boolean;
  rootType?: "object" | "array";
  onAddField?: () => void;
  onOpenSettings?: (path: string) => void;
}

const FieldRow = React.forwardRef<HTMLDivElement, FieldRowProps>(
  (
    {
      className,
      readOnly = false,
      control,
      fieldPath,
      schemaPath,
      defs = false,
      isRootLevel = false,
      onRemove,
      onOpenSettings,
      onTypeChange,
      onKeyChange,
      ...props
    },
    ref,
  ) => {
    const { setValue } = useFormContext();

    const fieldName = useWatch({
      control,
      name: `${fieldPath}.key`,
    });

    const definitions = useWatch({
      control,
      name: "definitions",
    }) as DefinitionItem[] | undefined;

    const fieldType = useWatch({
      control,
      name: `${schemaPath}.type`,
    });

    return (
      <div ref={ref} className={cn("p-2 flex gap-2", className)} data-testid="field" {...props}>
        {fieldType !== "array" && (
          <Controller
            control={control}
            name={`${fieldPath}.key`}
            render={({ field }) => (
              <Input
                placeholder="field_name"
                disabled={readOnly}
                className="flex-1"
                {...field}
                onChange={(e) => {
                  const oldKey = field.value;
                  const newKey = e.target.value;
                  field.onChange(e);
                  if (onKeyChange && oldKey !== newKey) {
                    onKeyChange(oldKey, newKey);
                  }
                }}
              />
            )}
          />
        )}

        <Controller
          control={control}
          name={`${schemaPath}.type`}
          render={({ field }) => (
            <Select
              disabled={readOnly}
              onValueChange={(value) => {
                field.onChange(value);
                onTypeChange?.(value);
              }}
              value={field.value}
            >
              <SelectTrigger className="flex-1 min-w-0">
                <SelectValue className="truncate" />
              </SelectTrigger>
              <SelectContent className="max-h-64 bg-background text-foreground border-input">
                {SCHEMA_TYPES.map((type: string) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
                <SelectItem value="ref">reference</SelectItem>
              </SelectContent>
            </Select>
          )}
        />

        {fieldType !== "ref" ? (
          <>
            <Controller
              control={control}
              name={`${schemaPath}.title`}
              render={({ field }) => (
                <Input placeholder="Title" disabled={readOnly} className="flex-1" {...field} />
              )}
            />

            <Controller
              control={control}
              name={`${schemaPath}.description`}
              render={({ field }) => (
                <Input
                  placeholder="Description"
                  disabled={readOnly}
                  className="flex-1"
                  {...field}
                />
              )}
            />
          </>
        ) : (
          <div className="flex-1 flex gap-2 items-center">
            <Link2 size={16} className="text-muted-foreground shrink-0" />
            <Controller
              control={control}
              name={`${schemaPath}.$ref`}
              render={({ field }) => (
                <Input
                  {...field}
                  disabled={readOnly}
                  placeholder="#/$defs/definition or https://example.com/schema"
                  className="flex-1 font-mono text-xs"
                />
              )}
            />
            <Select
              disabled={readOnly}
              onValueChange={(value) => {
                setValue(`${schemaPath}.$ref`, value, { shouldDirty: true });
              }}
              value=""
            >
              <SelectTrigger className="w-16 shrink-0">
                <SelectValue placeholder="defs" />
              </SelectTrigger>
              <SelectContent className="min-w-52 max-h-64 bg-background text-foreground border-input">
                {definitions && definitions.length > 0 ? (
                  definitions.map((def) => (
                    <SelectItem key={def.id} value={`#/$defs/${def.key}`}>
                      {def.key}
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-2 text-sm text-muted-foreground">
                    No definitions found. Create one in Root Settings.
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>
        )}

        {fieldType !== "array" && !defs && fieldType !== "ref" && (
          <div className="flex gap-2">
            <Controller
              control={control}
              name={`${fieldPath}.isRequired`}
              render={({ field }) => (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        data-testid="required"
                        disabled={readOnly}
                        size="icon"
                        variant={field.value ? "default" : "outline"}
                        onClick={() => {
                          field.onChange(!field.value);
                        }}
                      >
                        <TriangleAlert />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Required</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            />
            <div className="border-l-2 border-input"></div>
          </div>
        )}

        {!defs && fieldType !== "ref" && (
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            onClick={() => onOpenSettings?.(schemaPath)}
          >
            <Settings className="text-blue-500" />
          </Button>
        )}

        {isRootLevel && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                size="icon-sm"
                variant="ghost"
                data-testid="delete-button"
                disabled={readOnly}
              >
                <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="border-input">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-foreground">
                  Are you absolutely sure?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete field {fieldName}.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="text-foreground">Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onRemove}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    );
  },
);
FieldRow.displayName = "FieldRow";

const Field = React.forwardRef<HTMLDivElement, FieldProps>(
  (
    {
      className,
      readOnly = false,
      fieldPath,
      defs = false,
      onRemove,
      onOpenSettings,
      onKeyChange,
      isRootLevel = false,
      isSchemaDirect = false,
      ...props
    },
    ref,
  ) => {
    const { control, setValue } = useFormContext();
    const schemaPath = isSchemaDirect ? fieldPath : `${fieldPath}.schema`;
    const fieldType = useWatch({ control, name: `${schemaPath}.type` });

    const { fields, append, remove } = useFieldArray({
      control,
      name: `${schemaPath}.properties`,
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

    const handleTypeChange = (newType: string) => {
      let newValue = {};
      if (newType === "object") {
        newValue = {
          type: "object",
          properties: [],
          additionalProperties: true,
        };
      } else if (newType === "array") {
        newValue = { type: "array" };
      } else if (newType === "ref") {
        newValue = { type: "ref", $ref: "" };
      } else {
        newValue = { type: newType };
      }
      setValue(schemaPath, newValue);
    };

    return (
      <div ref={ref} className={className} key={`${fieldPath}-${fieldType}`} {...props}>
        <FieldRow
          readOnly={readOnly}
          control={control}
          fieldPath={fieldPath}
          schemaPath={schemaPath}
          defs={defs}
          isRootLevel={isRootLevel}
          onRemove={onRemove}
          onOpenSettings={onOpenSettings}
          onTypeChange={handleTypeChange}
          onKeyChange={onKeyChange}
        />

        {fieldType === "object" && (
          <div className="ml-2 pl-2 border-l-2 border-input">
            {fields.map((field, index) => (
              <Field
                key={field.id}
                readOnly={readOnly}
                fieldPath={`${schemaPath}.properties.${index}`}
                onRemove={() => remove(index)}
                onOpenSettings={onOpenSettings}
                isRootLevel={true}
                isSchemaDirect={false}
                defs={defs}
              />
            ))}
            <Button
              type="button"
              disabled={readOnly}
              size="sm"
              variant="outline"
              onClick={handleAddField}
              className="ml-2 mt-2 mb-4 flex gap-2 text-green-500"
            >
              <PlusCircle /> Add Field
            </Button>
          </div>
        )}

        {fieldType === "array" && (
          <div className="ml-2 pl-2 border-l-2 border-input mr-11" data-testid="field-array">
            <Field
              readOnly={readOnly}
              fieldPath={`${schemaPath}.items`}
              onRemove={() => {}}
              onOpenSettings={onOpenSettings}
              isSchemaDirect={true}
            />
          </div>
        )}
      </div>
    );
  },
);
Field.displayName = "Field";

const FieldList = React.forwardRef<HTMLDivElement, FieldListProps>(
  ({ className, readOnly = false, fields, onRemove, onOpenSettings, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("pl-2 border-l-2 border-input", className)} {...props}>
        {fields.map((field, index) => (
          <Field
            key={field.fieldId}
            readOnly={readOnly}
            fieldPath={`properties.${index}`}
            onRemove={() => onRemove?.(index)}
            onOpenSettings={onOpenSettings}
            isRootLevel={true}
          />
        ))}
      </div>
    );
  },
);
FieldList.displayName = "FieldList";

const Root = React.forwardRef<HTMLDivElement, RootProps>(
  (
    { className, readOnly = false, rootType = "object", onAddField, onOpenSettings, ...props },
    ref,
  ) => {
    const { control } = useFormContext();

    return (
      <div ref={ref} className={cn("flex gap-2", className)} {...props}>
        <Input value="root" disabled className="flex-1" />

        <Select disabled value={rootType}>
          <SelectTrigger className="flex-1 min-w-0">
            <SelectValue className="truncate" />
          </SelectTrigger>
          <SelectContent className="max-h-52 bg-background text-foreground border-input">
            <SelectItem value={rootType}>{rootType}</SelectItem>
          </SelectContent>
        </Select>

        <Controller
          control={control}
          name="root.title"
          render={({ field }) => (
            <Input placeholder="Title" disabled={readOnly} className="flex-1" {...field} />
          )}
        />

        <Controller
          control={control}
          name="root.description"
          render={({ field }) => (
            <Input placeholder="Description" disabled={readOnly} className="flex-1" {...field} />
          )}
        />

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button type="button" disabled size="icon">
                <TriangleAlert />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Required</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <div className="border-l-2 border-input"></div>

        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          data-testid="root-settings-button"
          onClick={() => onOpenSettings?.("root")}
        >
          <Settings className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        </Button>

        {rootType === "object" && (
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            data-testid="root-add-button"
            disabled={readOnly}
            onClick={onAddField}
          >
            <PlusCircle className="text-green-500" />
          </Button>
        )}
      </div>
    );
  },
);
Root.displayName = "Root";

export { Field, FieldList, FieldRow, Root };
