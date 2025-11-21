import { useFormContext } from "react-hook-form";
import { SchemaSettingsProps } from "../../../interfaces/interfaces";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";

export const BooleanSettings = ({
  theme,
  basePath,
  readOnly,
}: SchemaSettingsProps) => {
  const { control } = useFormContext();

  return (
    <form>
      <FormField
        control={control}
        name={`${basePath}.default`}
        render={({ field }) => (
          <FormItem className="flex gap-2">
            <FormLabel>Default Value</FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value}
              disabled={readOnly}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="False" />
                </SelectTrigger>
              </FormControl>
              <SelectContent
                className={`${theme} max-h-48 bg-background text-foreground border-input`}
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
};
