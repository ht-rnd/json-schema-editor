import { validateSchema } from "@ht-rnd/json-schema-editor";
import * as React from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { cn } from "../lib/utils";
import type { SettingsProps } from "../types/props";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { TagsInput } from "../ui/tags-input";
import { Textarea } from "../ui/textarea";

const ObjectSettings = React.forwardRef<HTMLFormElement, SettingsProps>(
  ({ className, basePath, readOnly = false, theme, ...props }, ref) => {
    const { control, setValue, getValues } = useFormContext();
    const [additionalProperties, setAdditionalProperties] = React.useState(
      JSON.stringify(getValues(`${basePath}.additionalProperties`), null, 2),
    );
    const [jsonError, setJsonError] = React.useState<Array<string> | null>(null);

    const additionalPropertiesValue = useWatch({
      control,
      name: `${basePath}.additionalProperties`,
    });

    React.useEffect(() => {
      setJsonError(null);
      setAdditionalProperties(JSON.stringify(additionalPropertiesValue, null, 2));
    }, [additionalPropertiesValue]);

    let currentMode: "true" | "false" | "schema";
    if (typeof additionalPropertiesValue === "boolean") {
      currentMode = additionalPropertiesValue ? "true" : "false";
    } else if (
      typeof additionalPropertiesValue === "object" &&
      additionalPropertiesValue !== null
    ) {
      currentMode = "schema";
    } else {
      currentMode = "true";
    }

    const handleModeChange = (newMode: "true" | "false" | "schema") => {
      const fieldPath = `${basePath}.additionalProperties`;
      if (newMode === "true") {
        setValue(fieldPath, true);
      } else if (newMode === "false") {
        setValue(fieldPath, false);
      } else {
        const defaultSchema = { type: "string" };
        setValue(fieldPath, defaultSchema);
        setAdditionalProperties(JSON.stringify(defaultSchema, null, 2));
      }
    };

    return (
      <form ref={ref} className={cn("flex flex-col gap-4", className)} {...props}>
        <div className="flex gap-4 items-start">
          <FormField
            control={control}
            name={`${basePath}.minProperties`}
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Minimum Properties</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    disabled={readOnly}
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(e.target.value === "" ? null : Number(e.target.value))
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name={`${basePath}.maxProperties`}
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Maximum Properties</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    disabled={readOnly}
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(e.target.value === "" ? null : Number(e.target.value))
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-2">
          <FormLabel>Additional Properties</FormLabel>
          <RadioGroup
            value={currentMode}
            onValueChange={handleModeChange}
            className="flex space-x-4 pt-2"
            disabled={readOnly}
          >
            <FormItem className="flex items-center space-x-2">
              <RadioGroupItem value="true" id="ap-true" />
              <FormLabel htmlFor="ap-true" className="font-normal">
                Allow (true)
              </FormLabel>
            </FormItem>
            <FormItem className="flex items-center space-x-2">
              <RadioGroupItem value="false" id="ap-false" />
              <FormLabel htmlFor="ap-false" className="font-normal">
                Disallow (false)
              </FormLabel>
            </FormItem>
            <FormItem className="flex items-center space-x-2">
              <RadioGroupItem value="schema" id="ap-schema" />
              <FormLabel htmlFor="ap-schema" className="font-normal">
                Specify Schema
              </FormLabel>
            </FormItem>
          </RadioGroup>
          <FormMessage />
        </div>

        {currentMode === "schema" && (
          <FormItem>
            <FormControl>
              <Textarea
                data-testid="schema-textarea"
                rows={6}
                disabled={readOnly}
                className="font-mono"
                value={additionalProperties}
                onChange={(e) => {
                  const newText = e.target.value;
                  setAdditionalProperties(newText);
                  try {
                    const jsonObject = JSON.parse(newText);
                    const validationErrors = validateSchema(jsonObject);
                    if (validationErrors) {
                      const errorMessages = validationErrors.map(
                        (error) => `${error.instancePath} - ${error.message ?? "Unknown error"}`,
                      );
                      setJsonError(errorMessages);
                    } else {
                      setValue(`${basePath}.additionalProperties`, jsonObject);
                    }
                  } catch {
                    setJsonError(["Invalid schema structure."]);
                  }
                }}
              />
            </FormControl>
            {jsonError && jsonError.length > 0 && (
              <div className="mt-2 text-sm font-medium text-destructive">
                {jsonError.map((error, index) => (
                  <p key={index}>{error}</p>
                ))}
              </div>
            )}
          </FormItem>
        )}

        <FormField
          control={control}
          name={`${basePath}."x-modifiable"`}
          render={({ field }) => (
            <FormItem className="mt-2">
              <FormLabel>Modifiable Properties</FormLabel>
              <FormControl>
                <TagsInput
                  disabled={readOnly}
                  value={field.value || []}
                  onValueChange={field.onChange}
                  placeholder="Enter your modifiable properties"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    );
  },
);
ObjectSettings.displayName = "ObjectSettings";

export { ObjectSettings };
