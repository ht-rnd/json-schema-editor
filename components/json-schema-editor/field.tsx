import { PlusCircle } from "lucide-react";
import { nanoid } from "nanoid";
import * as React from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { FieldRow } from "./field-row";
import { cn } from "./lib/utils";
import { Button } from "./ui/button";

export interface FieldProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Whether the form is read-only */
  readOnly?: boolean;
  /** Path to this field in the form */
  fieldPath: string;
  /** Callback when field is removed */
  onRemove?: () => void;
  /** Callback when settings button is clicked */
  onOpenSettings?: (path: string) => void;
  /** Whether to show the key input */
  isSimpleType?: boolean;
  /** Whether this is a root-level field (can be deleted) */
  isRootLevel?: boolean;
}

const Field = React.forwardRef<HTMLDivElement, FieldProps>(
  (
    {
      className,
      readOnly = false,
      fieldPath,
      onRemove,
      onOpenSettings,
      isSimpleType = true,
      isRootLevel = false,
      ...props
    },
    ref,
  ) => {
    const { control, setValue } = useFormContext();
    const fieldType = useWatch({ control, name: `${fieldPath}.schema.type` });

    const { fields, append, remove } = useFieldArray({
      control,
      name: `${fieldPath}.schema.properties`,
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
      } else {
        newValue = { type: newType };
      }
      setValue(`${fieldPath}.schema`, newValue);
    };

    return (
      <div ref={ref} className={cn(className)} key={`${fieldPath}-${fieldType}`} {...props}>
        <FieldRow
          readOnly={readOnly}
          control={control}
          fieldPath={fieldPath}
          isSimpleType={isSimpleType}
          isRootLevel={isRootLevel}
          onRemove={onRemove}
          onOpenSettings={onOpenSettings}
          onTypeChange={handleTypeChange}
        />

        {fieldType === "object" && (
          <div className="ml-2 pl-2 border-l-2 border-input">
            {fields.map((field, index) => (
              <Field
                key={field.id}
                readOnly={readOnly}
                fieldPath={`${fieldPath}.schema.properties.${index}`}
                onRemove={() => remove(index)}
                onOpenSettings={onOpenSettings}
                isRootLevel={true}
              />
            ))}
            <Button
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
              fieldPath={`${fieldPath}.schema.items`}
              onRemove={() => {}}
              onOpenSettings={onOpenSettings}
              isSimpleType={false}
            />
          </div>
        )}
      </div>
    );
  },
);
Field.displayName = "Field";

export { Field };
