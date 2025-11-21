import { useFieldArray, useFormContext } from "react-hook-form";
import { nanoid } from "nanoid";
import { SchemaSettingsProps } from "../../../interfaces/interfaces";
import { Field } from "../form/Field";
import { Button } from "../../ui/button";
import { PlusCircle, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Separator } from "../../ui/separator";
import { Badge } from "../../ui/badge";

export const DefinitionsSettings = ({
  theme,
  readOnly,
}: SchemaSettingsProps) => {
  const { control, getValues, setValue } = useFormContext();
  const [isOpen, setIsOpen] = useState(false);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "definitions",
  });

  const updateReferences = (oldKey: string, newKey: string | null) => {
    const oldRef = `#/$defs/${oldKey}`;
    const newRef = newKey ? `#/$defs/${newKey}` : "";

    const formData = getValues();

    const traverse = (path: string, item: any) => {
      if (!item) return;

      if (item.schema && item.schema.$ref === oldRef) {
        setValue(`${path}.schema.$ref`, newRef);
      }
      if (item.$ref === oldRef) {
        setValue(`${path}.$ref`, newRef);
      }

      if (item.schema?.properties && Array.isArray(item.schema.properties)) {
        item.schema.properties.forEach((subField: any, idx: number) => {
          traverse(`${path}.schema.properties.${idx}`, subField);
        });
      }
      if (item.properties && Array.isArray(item.properties)) {
        item.properties.forEach((subField: any, idx: number) => {
          traverse(`${path}.properties.${idx}`, subField);
        });
      }
      if (item.schema?.items) {
        if (!Array.isArray(item.schema.items)) {
          traverse(`${path}.schema.items`, { schema: item.schema.items });
        }
      }
    };

    if (formData.properties) {
      formData.properties.forEach((field: any, index: number) => {
        traverse(`properties.${index}`, field);
      });
    }
    if (formData.definitions) {
      formData.definitions.forEach((def: any, index: number) => {
        if (def.key !== oldKey) {
          traverse(`definitions.${index}`, def);
        }
      });
    }
    if (formData.root) {
      if (formData.root.$ref === oldRef) {
        setValue(`root.$ref`, newRef);
      }
    }
  };

  const handleAddDefinition = () => {
    const id = nanoid(6);
    append({
      id,
      key: `def_${id}`,
      schema: { type: "object", properties: {}, additionalProperties: true },
    });
    setIsOpen(true);
  };

  return (
    <div className="max-h-[400px] overflow-y-auto">
      <Separator />
      <div
        className="mt-4 flex items-center justify-between cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          <p className="font-medium">Global Definitions</p>
          <Badge>{fields.length}</Badge>
        </div>
        {isOpen ? <ChevronUp size="24" /> : <ChevronDown size="24" />}
      </div>

      {isOpen && (
        <div className="mt-2 p-2 border border-dashed border-input rounded-md">
          <div className="space-y-2">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="border border-input rounded-md bg-accent/5"
              >
                <span className="p-2 text-xs font-semibold">
                  Definition: {index + 1}
                </span>

                <Field
                  theme={theme}
                  readOnly={readOnly}
                  fieldPath={`definitions.${index}`}
                  defs={true}
                  isRootLevel={true}
                  onRemove={() => {
                    const currentKey = getValues(`definitions.${index}.key`);
                    updateReferences(currentKey, null);
                    remove(index);
                  }}
                  onKeyChange={(oldKey, newKey) =>
                    updateReferences(oldKey, newKey)
                  }
                />
              </div>
            ))}
          </div>

          <Button
            disabled={readOnly}
            size="sm"
            variant="outline"
            onClick={handleAddDefinition}
            className="mt-2 flex gap-2 text-green-500 w-full"
          >
            <PlusCircle size={16} /> Add Definition
          </Button>
        </div>
      )}
    </div>
  );
};
