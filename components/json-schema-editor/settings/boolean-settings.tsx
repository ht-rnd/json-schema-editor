import * as React from "react";
import { useFormContext } from "react-hook-form";
import { cn } from "../lib/utils";
import type { SettingsProps } from "../types/props";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

const BooleanSettings = React.forwardRef<HTMLFormElement, SettingsProps>(
  ({ className, basePath, readOnly = false, theme, ...props }, ref) => {
    const { control } = useFormContext();

    return (
      <form ref={ref} className={cn(className)} {...props}>
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
                <SelectContent
                  className={cn("max-h-48 bg-background text-foreground border-input", theme)}
                >
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

export { BooleanSettings };
