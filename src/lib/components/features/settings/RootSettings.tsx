import { useFormContext } from "react-hook-form";
import { SchemaSettingsProps } from "../../../interfaces/interfaces";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../ui/form";
import { Input } from "../../ui/input";

export const RootSettings = ({ basePath, readOnly }: SchemaSettingsProps) => {
  const { control } = useFormContext();

  return (
    <div className="flex flex-col gap-4">
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
                value={
                  field.value ?? "http://json-schema.org/draft/2020-12/schema"
                }
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
};
