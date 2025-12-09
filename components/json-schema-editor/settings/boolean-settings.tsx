import * as React from "react";
import { useFormContext } from "react-hook-form";
import { cn } from "../lib/utils";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

export interface BooleanSettingsProps extends React.HTMLAttributes<HTMLFormElement> {
  /** Base path in the form for this schema */
  basePath: string;
  /** Whether the form is read-only */
  readOnly?: boolean;
}

const BooleanSettings = React.forwardRef<HTMLFormElement, BooleanSettingsProps>(
  ({ className, basePath, readOnly = false, ...props }, ref) => {
    const { control } = useFormContext();

    return (
      <form ref={ref} className={cn(className)} {...props}>
        <FormField
          control={control}
          name={`${basePath}.default`}
          render={({ field }) => (
            <FormItem className="flex gap-2">
              <FormLabel>Default Value</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={readOnly}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="False" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="max-h-48">
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
