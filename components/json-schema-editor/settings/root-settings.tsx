import * as React from "react";
import { useFormContext } from "react-hook-form";
import { cn } from "../lib/utils";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";

export interface RootSettingsProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Base path in the form for this schema */
  basePath: string;
  /** Whether the form is read-only */
  readOnly?: boolean;
}

const RootSettings = React.forwardRef<HTMLDivElement, RootSettingsProps>(
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
      </div>
    );
  },
);
RootSettings.displayName = "RootSettings";

export { RootSettings };
