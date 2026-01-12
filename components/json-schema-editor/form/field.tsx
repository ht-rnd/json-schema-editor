import { PlusCircle } from "lucide-react";
import { nanoid } from "nanoid";
import * as React from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { cn } from "../lib/utils";
import { Button } from "../ui/button";
import { FieldRow } from "./field-row";

export interface FieldProps extends React.HTMLAttributes<HTMLDivElement> {
  readOnly?: boolean;
  fieldPath: string;
  onRemove?: () => void;
  onOpenSettings?: (path: string) => void;
  isSimpleType?: boolean;
  isRootLevel?: boolean;
  isSchemaDirect?: boolean;
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
      } else {
        newValue = { type: newType };
      }
      setValue(schemaPath, newValue);
    };

    return (
      <div ref={ref} className={cn(className)} key={`${fieldPath}-${fieldType}`} {...props}>
        <FieldRow
          readOnly={readOnly}
          control={control}
          fieldPath={fieldPath}
          schemaPath={schemaPath}
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
                fieldPath={`${schemaPath}.properties.${index}`}
                onRemove={() => remove(index)}
                onOpenSettings={onOpenSettings}
                isRootLevel={true}
                isSchemaDirect={false}
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
              fieldPath={`${schemaPath}.items`}
              onRemove={() => {}}
              onOpenSettings={onOpenSettings}
              isSimpleType={false}
              isSchemaDirect={true}
            />
          </div>
        )}
      </div>
    );
  },
);
Field.displayName = "Field";

export { Field };
