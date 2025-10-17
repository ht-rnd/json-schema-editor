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
import { Checkbox } from "../../ui/checkbox";

export const ArraySettings = ({ basePath, readOnly }: SchemaSettingsProps) => {
  const { control } = useFormContext();

  return (
    <form className="flex flex-col gap-4">
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
                    field.onChange(
                      e.target.value === "" ? null : Number(e.target.value)
                    )
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
                    field.onChange(
                      e.target.value === "" ? null : Number(e.target.value)
                    )
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
                    field.onChange(
                      e.target.value === "" ? null : Number(e.target.value)
                    )
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
                    field.onChange(
                      e.target.value === "" ? null : Number(e.target.value)
                    )
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
};
