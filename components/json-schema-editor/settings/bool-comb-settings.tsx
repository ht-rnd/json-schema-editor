import { validateSchema } from "@ht-rnd/json-schema-editor";
import { ChevronDown, ChevronUp } from "lucide-react";
import * as React from "react";
import { useEffect, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { cn } from "../lib/utils";
import type { BoolCombFieldProps, DivSettingsProps } from "../types/props";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Separator } from "../ui/separator";
import { Textarea } from "../ui/textarea";

const BoolCombField = ({ basePath, readOnly = false, keyword, isSchema }: BoolCombFieldProps) => {
  const fieldName = `${basePath}.${keyword}`;
  const { control, setValue, getValues, clearErrors } = useFormContext();

  const value = useWatch({
    control,
    name: fieldName,
  });

  const [textValue, setTextValue] = useState(JSON.stringify(getValues(fieldName), null, 2));
  const [jsonError, setJsonError] = useState<string | null>(null);

  useEffect(() => {
    if (!jsonError) {
      setTextValue(JSON.stringify(value, null, 2));
    }
  }, [value, jsonError]);

  const handleTextChange = (newText: string) => {
    setTextValue(newText);

    if (newText.trim() === "" || newText.trim() === "null" || newText.trim() === "undefined") {
      setValue(fieldName, undefined);
      setJsonError(null);
      clearErrors(fieldName);
      return;
    }

    try {
      const jsonObject = JSON.parse(newText);
      const validationErrors = isSchema
        ? validateSchema(jsonObject)
        : jsonObject.map(validateSchema).find((e: any) => e);

      if (validationErrors) {
        const errorMessage = Array.isArray(validationErrors)
          ? validationErrors.map((error) => `${error.instancePath} - ${error.message}`).join(", ")
          : "Invalid schema structure.";
        setJsonError(errorMessage);
      } else {
        setJsonError(null);
        clearErrors(fieldName);
        setValue(fieldName, jsonObject, { shouldValidate: true });
      }
    } catch {
      setJsonError("Invalid JSON format.");
    }
  };

  return (
    <FormField
      control={control}
      name={fieldName}
      render={() => (
        <FormItem className="flex-1">
          <FormLabel className="capitalize">{keyword}</FormLabel>
          <FormControl>
            <Textarea
              rows={5}
              disabled={readOnly}
              className="font-mono text-xs"
              placeholder={isSchema ? 'e.g., { "type": "string" }' : 'e.g., [{ "minLength": 2 }]'}
              value={textValue || ""}
              onChange={(e) => handleTextChange(e.target.value)}
            />
          </FormControl>
          <FormMessage>{jsonError}</FormMessage>
        </FormItem>
      )}
    />
  );
};

const BoolCombSettings = React.forwardRef<HTMLDivElement, DivSettingsProps>(
  ({ className, basePath, readOnly = false, theme, ...props }, ref) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <div ref={ref} className={cn(className)} {...props}>
        <Separator className="my-4" />
        {/* biome-ignore lint/a11y/noStaticElementInteractions: toggle accordion on click */}
        {/* biome-ignore lint/a11y/useKeyWithClickEvents: toggle accordion on click */}
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
        >
          <p className="font-medium">Boolean Combinations</p>
          {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>

        {isOpen && (
          <div className="mt-3 space-y-3">
            <div className="flex gap-4 items-start">
              <BoolCombField
                basePath={basePath}
                readOnly={readOnly}
                keyword="allOf"
                isSchema={false}
              />
              <BoolCombField
                basePath={basePath}
                readOnly={readOnly}
                keyword="anyOf"
                isSchema={false}
              />
            </div>

            <div className="flex gap-4 items-start">
              <BoolCombField
                basePath={basePath}
                readOnly={readOnly}
                keyword="oneOf"
                isSchema={false}
              />
              <BoolCombField
                basePath={basePath}
                readOnly={readOnly}
                keyword="not"
                isSchema={true}
              />
            </div>
          </div>
        )}
      </div>
    );
  },
);
BoolCombSettings.displayName = "BoolCombSettings";

export { BoolCombSettings };
