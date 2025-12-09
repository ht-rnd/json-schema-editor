import { SCHEMA_TYPES } from "@ht-rnd/json-schema-editor";
import { Settings, Trash2, TriangleAlert } from "lucide-react";
import * as React from "react";
import { Controller, useWatch } from "react-hook-form";
import { cn } from "./lib/utils";
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
} from "./ui/alert-dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export interface FieldRowProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Whether the form is read-only */
  readOnly?: boolean;
  /** React Hook Form control */
  control: any;
  /** Path to this field in the form */
  fieldPath: string;
  /** Whether to show the key input */
  isSimpleType?: boolean;
  /** Whether this is a root-level field (can be deleted) */
  isRootLevel?: boolean;
  /** Callback when field is removed */
  onRemove?: () => void;
  /** Callback when settings button is clicked */
  onOpenSettings?: (path: string) => void;
  /** Callback when type changes */
  onTypeChange?: (newType: string) => void;
}

const FieldRow = React.forwardRef<HTMLDivElement, FieldRowProps>(
  (
    {
      className,
      readOnly = false,
      control,
      fieldPath,
      isSimpleType = true,
      isRootLevel = false,
      onRemove,
      onOpenSettings,
      onTypeChange,
      ...props
    },
    ref,
  ) => {
    const fieldName = useWatch({
      control,
      name: `${fieldPath}.key`,
    });

    return (
      <div ref={ref} className={cn("p-2 flex gap-2", className)} data-testid="field" {...props}>
        {isSimpleType && (
          <Controller
            control={control}
            name={`${fieldPath}.key`}
            render={({ field }) => (
              <Input placeholder="field_name" disabled={readOnly} className="w-40" {...field} />
            )}
          />
        )}

        <Controller
          control={control}
          name={`${fieldPath}.schema.type`}
          render={({ field }) => (
            <Select
              disabled={readOnly}
              onValueChange={(value) => {
                field.onChange(value);
                onTypeChange?.(value);
              }}
              value={field.value}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-52">
                {SCHEMA_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />

        <Controller
          control={control}
          name={`${fieldPath}.schema.title`}
          render={({ field }) => (
            <Input placeholder="Title" disabled={readOnly} className="flex-1 min-w-24" {...field} />
          )}
        />

        <Controller
          control={control}
          name={`${fieldPath}.schema.description`}
          render={({ field }) => (
            <Input placeholder="Description" disabled={readOnly} className="flex-1 min-w-32" {...field} />
          )}
        />

        {isSimpleType && (
          <div className="flex gap-2">
            <Controller
              control={control}
              name={`${fieldPath}.isRequired`}
              render={({ field }) => (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
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

        <Button size="icon" variant="ghost" onClick={() => onOpenSettings?.(`${fieldPath}.schema`)}>
          <Settings className="text-blue-500" />
        </Button>

        {isRootLevel && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="icon" variant="ghost" data-testid="delete-button" disabled={readOnly}>
                <Trash2 className="text-red-500" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
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
