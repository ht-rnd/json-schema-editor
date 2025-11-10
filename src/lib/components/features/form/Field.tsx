import { useFormContext, useWatch, useFieldArray } from "react-hook-form";
import { nanoid } from "nanoid";
import { FieldProps } from "../../../interfaces/interfaces";
import { FieldRow } from "./FieldRow";
import { Button } from "../../ui/button";
import { PlusCircle } from "lucide-react";

export const Field = ({
  theme,
  readOnly,
  fieldPath,
  onRemove,
  onOpenSettings,
  isSimpleType = true,
  isRootLevel = false,
}: FieldProps) => {
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
    if (newType === "object")
      newValue = { type: "object", properties: [], additionalProperties: true };
    else if (newType === "array") newValue = { type: "array" };
    else newValue = { type: newType };
    setValue(`${fieldPath}.schema`, newValue);
  };

  return (
    <div key={`${fieldPath}-${fieldType}`}>
      <FieldRow
        theme={theme}
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
              theme={theme}
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
        <div
          className="ml-2 pl-2 border-l-2 border-input mr-11"
          data-testid="field-array"
        >
          <Field
            theme={theme}
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
};
