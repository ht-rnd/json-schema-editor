import { STRING_FORMATS } from "@ht-rnd/json-schema-editor";
import * as React from "react";
import { useFormContext } from "react-hook-form";
import { cn } from "../lib/utils";
import { Checkbox } from "../ui/checkbox";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { TagsInput } from "../ui/tags-input";

export interface StringSettingsProps extends React.HTMLAttributes<HTMLFormElement> {
  /** Base path in the form for this schema */
  basePath: string;
  /** Whether the form is read-only */
  readOnly?: boolean;
}

const StringSettings = React.forwardRef<HTMLFormElement, StringSettingsProps>(
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
                <SelectContent className="max-h-48">
                  <SelectItem value="none">none</SelectItem>
                  {STRING_FORMATS.map((format) => (
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

export { StringSettings };
