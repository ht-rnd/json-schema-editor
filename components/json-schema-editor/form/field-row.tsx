import { SCHEMA_TYPES } from "@ht-rnd/json-schema-editor";
import { Link2, Settings, Trash2, TriangleAlert } from "lucide-react";
import * as React from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { cn } from "../lib/utils";
import type { DefinitionItem } from "../types";
import type { FieldRowProps } from "../types/props";
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
} from "../ui/alert-dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

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
      theme,
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
              <SelectContent
                className={cn("max-h-64 bg-background text-foreground border-input", theme)}
              >
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
              <SelectTrigger className="w-10 shrink-0" />
              <SelectContent
                className={cn(
                  "min-w-52 max-h-64 bg-background text-foreground border-input",
                  theme,
                )}
              >
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
              )}
            />
            <div className="border-l-2 border-input"></div>
          </div>
        )}

        {!defs && fieldType !== "ref" && (
          <Button
            type="button"
            size="icon"
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
                size="icon"
                variant="ghost"
                data-testid="delete-button"
                disabled={readOnly}
              >
                <Trash2 className="text-red-500" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className={cn("border-input", theme)}>
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

export { FieldRow };
