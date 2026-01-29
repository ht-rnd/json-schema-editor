import {
  INTEGER_FORMATS,
  NUMBER_FORMATS,
  STRING_FORMATS,
  validateSchema,
} from "@ht-rnd/json-schema-editor";
import { ChevronDown, ChevronUp, PlusCircle } from "lucide-react";
import { nanoid } from "nanoid";
import * as React from "react";
import { useEffect, useState } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Badge } from "./badge";
import { Button } from "./button";
import { Checkbox } from "./checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./dialog";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "./form";
import { Input } from "./input";
import { Field } from "./json-schema-form";
import { RadioGroup, RadioGroupItem } from "./radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
import { Separator } from "./separator";
import { TagsInput } from "./tags-input";
import { Textarea } from "./textarea";

export type BoolCombKeyword = "allOf" | "anyOf" | "oneOf" | "not";

export interface BoolCombFieldProps {
  basePath: string;
  readOnly?: boolean;
  keyword: BoolCombKeyword;
  isSchema: boolean;
}

export interface DefinitionsSettingsProps extends React.HTMLAttributes<HTMLDivElement> {
  readOnly?: boolean;
  onKeyChange?: (oldKey: string, newKey: string | null) => void;
}

export interface SettingsDialogProps extends React.HTMLAttributes<HTMLDivElement> {
  readOnly?: boolean;
  isOpen?: boolean;
  fieldPath?: string | null;
  onClose?: () => void;
}

export interface SettingsProps extends React.HTMLAttributes<HTMLFormElement> {
  basePath: string;
  readOnly?: boolean;
}

export interface DivSettingsProps extends React.HTMLAttributes<HTMLDivElement> {
  basePath: string;
  readOnly?: boolean;
}

const ArraySettings = React.forwardRef<HTMLFormElement, SettingsProps>(
  ({ className, basePath, readOnly = false, ...props }, ref) => {
    const { control } = useFormContext();

    return (
      <form ref={ref} className={cn("flex flex-col gap-4", className)} {...props}>
        <div className="flex gap-4 items-start">
          <FormField
            control={control}
            name={`${basePath}.minItems`}
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Minimum Items</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    disabled={readOnly}
                    {...field}
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
            name={`${basePath}.maxItems`}
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Maximum Items</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    disabled={readOnly}
                    {...field}
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

        <div className="flex gap-4">
          <FormField
            control={control}
            name={`${basePath}.minContains`}
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Minimum Contains</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    disabled={readOnly}
                    {...field}
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
            name={`${basePath}.maxContains`}
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Maximum Contains</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    disabled={readOnly}
                    {...field}
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

        <FormField
          control={control}
          name={`${basePath}.uniqueItems`}
          render={({ field }) => (
            <FormItem className="p-4 flex border border-input rounded-md">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={readOnly}
                />
              </FormControl>
              <FormLabel className="ml-2">Unique Items</FormLabel>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    );
  },
);
ArraySettings.displayName = "ArraySettings";

const BooleanSettings = React.forwardRef<HTMLFormElement, SettingsProps>(
  ({ className, basePath, readOnly = false, ...props }, ref) => {
    const { control } = useFormContext();

    return (
      <form ref={ref} className={className} {...props}>
        <FormField
          control={control}
          name={`${basePath}.default`}
          render={({ field }) => (
            <FormItem className="flex gap-2">
              <FormLabel>Default Value</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(value === "true")}
                value={field.value === undefined ? undefined : String(field.value)}
                disabled={readOnly}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="False" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="max-h-48 bg-background text-foreground border-input">
                  <SelectItem value="true" data-testid="true">
                    True
                  </SelectItem>
                  <SelectItem value="false">False</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    );
  },
);
BooleanSettings.displayName = "BooleanSettings";

const StringSettings = React.forwardRef<HTMLFormElement, SettingsProps>(
  ({ className, basePath, readOnly = false, ...props }, ref) => {
    const { control, watch } = useFormContext();
    const isEnumEnabled = watch(`${basePath}.enumEnabled`);

    return (
      <form ref={ref} className={cn("flex flex-col gap-4", className)} {...props}>
        <FormField
          control={control}
          name={`${basePath}.default`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Default Value</FormLabel>
              <FormControl>
                <Input disabled={readOnly} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4 items-start">
          <FormField
            control={control}
            name={`${basePath}.minLength`}
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Minimum Length</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    disabled={readOnly}
                    {...field}
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
            name={`${basePath}.maxLength`}
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Maximum Length</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    disabled={readOnly}
                    {...field}
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

        <FormField
          control={control}
          name={`${basePath}.pattern`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pattern (Regular Expression)</FormLabel>
              <FormControl>
                <Input disabled={readOnly} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name={`${basePath}.format`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Format</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={readOnly}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose data type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="max-h-48 bg-background text-foreground border-input">
                  <SelectItem value="none">none</SelectItem>
                  {STRING_FORMATS.map((format: string) => (
                    <SelectItem key={format} value={format}>
                      {format}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name={`${basePath}.enumEnabled`}
          render={({ field }) => (
            <FormItem className="p-4 flex border border-input rounded-md">
              <FormControl>
                <Checkbox
                  disabled={readOnly}
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel className="ml-2">Enable Enum</FormLabel>
              <FormMessage />
            </FormItem>
          )}
        />

        {isEnumEnabled && (
          <FormField
            control={control}
            name={`${basePath}.enumInput`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Enum Values</FormLabel>
                <FormControl>
                  <TagsInput
                    disabled={readOnly}
                    value={field.value || []}
                    onValueChange={field.onChange}
                    placeholder="Enter your enums"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </form>
    );
  },
);
StringSettings.displayName = "StringSettings";

const IntegerSettings = React.forwardRef<HTMLFormElement, SettingsProps>(
  ({ className, basePath, readOnly = false, ...props }, ref) => {
    const { control, watch } = useFormContext();
    const isEnumEnabled = watch(`${basePath}.enumEnabled`);

    return (
      <form ref={ref} className={cn("flex flex-col gap-4", className)} {...props}>
        <FormField
          control={control}
          name={`${basePath}.default`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Default Value</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  disabled={readOnly}
                  {...field}
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

        <div className="flex gap-4 items-start">
          <FormField
            control={control}
            name={`${basePath}.minimum`}
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Minimum Value</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    disabled={readOnly}
                    {...field}
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
            name={`${basePath}.maximum`}
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Maximum Value</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    disabled={readOnly}
                    {...field}
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

        <div className="flex gap-4">
          <FormField
            control={control}
            name={`${basePath}.exclusiveMin`}
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Exclusive Minimum</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    disabled={readOnly}
                    {...field}
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
            name={`${basePath}.exclusiveMax`}
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Exclusive Maximum</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    disabled={readOnly}
                    {...field}
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

        <FormField
          control={control}
          name={`${basePath}.multipleOf`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Multiple Of</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  disabled={readOnly}
                  {...field}
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
          name={`${basePath}.format`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Format</FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={readOnly}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose data type" />
                  </SelectTrigger>
                  <SelectContent className="max-h-48 bg-background text-foreground border-input">
                    <SelectItem value="none">none</SelectItem>
                    {INTEGER_FORMATS.map((format: string) => (
                      <SelectItem key={format} value={format}>
                        {format}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name={`${basePath}.enumEnabled`}
          render={({ field }) => (
            <FormItem className="p-4 flex border border-input rounded-md">
              <FormControl>
                <Checkbox
                  disabled={readOnly}
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel className="ml-2">Enable Enum</FormLabel>
              <FormMessage />
            </FormItem>
          )}
        />

        {isEnumEnabled && (
          <FormField
            control={control}
            name={`${basePath}.enumInput`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Enum Values</FormLabel>
                <FormControl>
                  <TagsInput
                    disabled={readOnly}
                    value={field.value || []}
                    onValueChange={field.onChange}
                    placeholder="Enter your enums"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </form>
    );
  },
);
IntegerSettings.displayName = "IntegerSettings";

const NumberSettings = React.forwardRef<HTMLFormElement, SettingsProps>(
  ({ className, basePath, readOnly = false, ...props }, ref) => {
    const { control, watch } = useFormContext();
    const isEnumEnabled = watch(`${basePath}.enumEnabled`);

    return (
      <form ref={ref} className={cn("flex flex-col gap-4", className)} {...props}>
        <FormField
          control={control}
          name={`${basePath}.default`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Default Value</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  disabled={readOnly}
                  {...field}
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

        <div className="flex gap-4 items-start">
          <FormField
            control={control}
            name={`${basePath}.minimum`}
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Minimum Value</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    disabled={readOnly}
                    {...field}
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
            name={`${basePath}.maximum`}
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Maximum Value</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    disabled={readOnly}
                    {...field}
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

        <div className="flex gap-4">
          <FormField
            control={control}
            name={`${basePath}.exclusiveMin`}
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Exclusive Minimum</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    disabled={readOnly}
                    {...field}
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
            name={`${basePath}.exclusiveMax`}
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Exclusive Maximum</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    disabled={readOnly}
                    {...field}
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

        <FormField
          control={control}
          name={`${basePath}.multipleOf`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Multiple Of</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  disabled={readOnly}
                  {...field}
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
          name={`${basePath}.format`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Format</FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={readOnly}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose data type" />
                  </SelectTrigger>
                  <SelectContent className="max-h-48 bg-background text-foreground border-input">
                    <SelectItem value="none">none</SelectItem>
                    {NUMBER_FORMATS.map((format: string) => (
                      <SelectItem key={format} value={format}>
                        {format}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name={`${basePath}.enumEnabled`}
          render={({ field }) => (
            <FormItem className="p-4 flex border border-input rounded-md">
              <FormControl>
                <Checkbox
                  disabled={readOnly}
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel className="ml-2">Enable Enum</FormLabel>
              <FormMessage />
            </FormItem>
          )}
        />

        {isEnumEnabled && (
          <FormField
            control={control}
            name={`${basePath}.enumInput`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Enum Values</FormLabel>
                <FormControl>
                  <TagsInput
                    disabled={readOnly}
                    value={field.value || []}
                    onValueChange={field.onChange}
                    placeholder="Enter your enums"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </form>
    );
  },
);
NumberSettings.displayName = "NumberSettings";

const ObjectSettings = React.forwardRef<HTMLFormElement, SettingsProps>(
  ({ className, basePath, readOnly = false, ...props }, ref) => {
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
        {/* biome-ignore lint/a11y/noStaticElementInteractions: toggle accordion on click */}
        {/* biome-ignore lint/a11y/useKeyWithClickEvents: toggle accordion on click */}
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
          <div className="mt-3 p-2 border border-dashed border-input rounded-md overflow-x-auto">
            <div className="space-y-2">
              {fields.map((field, index) => (
                <div key={field.id} className="border border-input rounded-md bg-accent/5">
                  <span className="p-2 text-xs font-semibold">Definition: {index + 1}</span>

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
              type="button"
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

const RootSettings = React.forwardRef<HTMLDivElement, DivSettingsProps>(
  ({ className, basePath, readOnly = false, ...props }, ref) => {
    const { control } = useFormContext();

    return (
      <div ref={ref} className={cn("flex flex-col gap-4", className)} {...props}>
        <FormField
          control={control}
          name={`${basePath}["$schema"]`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>$schema</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., http://json-schema.org/draft/2020-12/schema"
                  disabled={readOnly}
                  {...field}
                  value={field.value ?? "http://json-schema.org/draft/2020-12/schema"}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name={`${basePath}["$id"]`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>$id</FormLabel>
              <FormControl>
                <Input disabled={readOnly} {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <DefinitionsSettings readOnly={readOnly} />
      </div>
    );
  },
);
RootSettings.displayName = "RootSettings";

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
  ({ className, basePath, readOnly = false, ...props }, ref) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <div ref={ref} className={className} {...props}>
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

const Settings = React.forwardRef<HTMLDivElement, DivSettingsProps>(
  ({ className, basePath, readOnly = false, ...props }, ref) => {
    const { watch } = useFormContext();
    const type = watch(`${basePath}.type`);

    const typeSettings = () => {
      switch (type) {
        case "number":
          return <NumberSettings basePath={basePath} readOnly={readOnly} />;
        case "integer":
          return <IntegerSettings basePath={basePath} readOnly={readOnly} />;
        case "string":
          return <StringSettings basePath={basePath} readOnly={readOnly} />;
        case "boolean":
          return <BooleanSettings basePath={basePath} readOnly={readOnly} />;
        case "array":
          return <ArraySettings basePath={basePath} readOnly={readOnly} />;
        case "object":
          return <ObjectSettings basePath={basePath} readOnly={readOnly} />;
        default:
          return <>{`Settings for type ${type} are not yet implemented.`}</>;
      }
    };

    return (
      <div
        ref={ref}
        className={cn("bg-background text-foreground border-input", className)}
        {...props}
      >
        {basePath === "root" && (
          <>
            <RootSettings basePath={basePath} readOnly={readOnly} />
            <Separator className="my-4" />
          </>
        )}

        {typeSettings()}

        <BoolCombSettings basePath={basePath} readOnly={readOnly} />
      </div>
    );
  },
);
Settings.displayName = "Settings";

const SettingsDialog = React.forwardRef<HTMLDivElement, SettingsDialogProps>(
  ({ className, readOnly = false, isOpen = false, fieldPath, onClose, ...props }, ref) => {
    const { getValues } = useFormContext();
    const field = fieldPath ? getValues(fieldPath) : null;

    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose?.()}>
        <DialogContent
          ref={ref}
          className={cn(
            "w-full max-w-2xl lg:max-w-4xl bg-background text-foreground border-input max-h-[90vh] overflow-y-auto",
            className,
          )}
          {...props}
        >
          <DialogHeader>
            <DialogTitle className="capitalize">{field?.type} Schema Settings</DialogTitle>
            <DialogDescription>Configure the settings for this schema field.</DialogDescription>
          </DialogHeader>

          {fieldPath && <Settings basePath={fieldPath} readOnly={readOnly} />}

          <Button type="button" onClick={onClose} variant="default">
            Close
          </Button>
        </DialogContent>
      </Dialog>
    );
  },
);
SettingsDialog.displayName = "SettingsDialog";

export {
  ArraySettings,
  BoolCombSettings,
  BooleanSettings,
  DefinitionsSettings,
  IntegerSettings,
  NumberSettings,
  ObjectSettings,
  RootSettings,
  Settings,
  SettingsDialog,
  StringSettings,
};
