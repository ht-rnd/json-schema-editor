import { ChevronDown, ChevronUp, PlusCircle } from "lucide-react";
import { nanoid } from "nanoid";
import * as React from "react";
import { useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { cn } from "../lib/utils";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { Field } from "../form/field";

export interface DefinitionsSettingsProps extends React.HTMLAttributes<HTMLDivElement> {
  readOnly?: boolean;
  onKeyChange?: (oldKey: string, newKey: string | null) => void;
}

const DefinitionsSettings = React.forwardRef<HTMLDivElement, DefinitionsSettingsProps>(
  ({ className, readOnly = false, onKeyChange, ...props }, ref) => {
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

      // Also call the parent callback if provided
      onKeyChange?.(oldKey, newKey);
    };

    const handleAddDefinition = () => {
      const id = nanoid(6);
      append({
        id,
        key: `def_${id}`,
        schema: { type: "object", additionalProperties: true },
      });
      setIsOpen(true);
    };

    const handleRemoveDefinition = (index: number) => {
      const currentKey = getValues(`definitions.${index}.key`);
      updateReferences(currentKey, null);
      remove(index);
    };

    return (
      <div ref={ref} className={cn("max-h-[400px] overflow-y-auto", className)} {...props}>
        <Separator />
        <div
          className="mt-4 flex items-center justify-between cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex items-center gap-2">
            <p className="font-medium">Global Definitions</p>
            <Badge variant="secondary">{fields.length}</Badge>
          </div>
          {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>

        {isOpen && (
          <div className="mt-3 p-2 border border-dashed border-input rounded-md">
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
                    readOnly={readOnly}
                    fieldPath={`definitions.${index}`}
                    defs={true}
                    isRootLevel={true}
                    onRemove={() => handleRemoveDefinition(index)}
                    onKeyChange={(oldKey, newKey) => updateReferences(oldKey, newKey)}
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
  },
);
DefinitionsSettings.displayName = "DefinitionsSettings";

export { DefinitionsSettings };
