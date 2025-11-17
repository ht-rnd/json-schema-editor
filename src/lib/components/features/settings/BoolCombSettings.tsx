import { useFormContext, useWatch } from "react-hook-form";
import { useEffect, useState } from "react";
import { SchemaSettingsProps } from "../../../interfaces/interfaces";
import { validateSchema } from "../../../utils/validator";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../ui/form";
import { Textarea } from "../../ui/textarea";
import { Separator } from "../../ui/separator";
import { ChevronDown, ChevronUp } from "lucide-react";

const Field = ({
  basePath,
  readOnly,
  keyword,
  isSchema,
}: {
  basePath: string;
  readOnly: boolean | undefined;
  keyword: "allOf" | "anyOf" | "oneOf" | "not";
  isSchema: boolean;
}) => {
  const fieldName = `${basePath}.${keyword}`;
  const { control, setValue, getValues, clearErrors } = useFormContext();

  const value = useWatch({
    control,
    name: fieldName,
  });

  const [textValue, setTextValue] = useState(
    JSON.stringify(getValues(fieldName), null, 2)
  );
  const [jsonError, setJsonError] = useState<string | null>(null);

  useEffect(() => {
    if (!jsonError) {
      setTextValue(JSON.stringify(value, null, 2));
    }
  }, [value, jsonError]);

  const handleTextChange = (newText: string) => {
    setTextValue(newText);

    if (
      newText.trim() === "" ||
      newText.trim() === "null" ||
      newText.trim() === "undefined"
    ) {
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
          ? validationErrors
              .map((error) => `${error.instancePath} - ${error.message}`)
              .join(", ")
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
              className="font-mono"
              placeholder={
                isSchema
                  ? 'e.g., { "type": "string" }'
                  : 'e.g., [{ "minLength": 2 }]'
              }
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

export const BoolCombSettings = ({
  basePath,
  readOnly,
}: SchemaSettingsProps) => {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <Separator className="my-4" />
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        <p className="font-medium">Boolean Combinations</p>
        {open ? <ChevronUp size="24" /> : <ChevronDown size="24" />}
      </div>

      {open && (
        <div className="mt-2 space-y-2">
          <div className="flex gap-4 items-start">
            <Field
              basePath={basePath}
              readOnly={readOnly}
              keyword="allOf"
              isSchema={false}
            />
            <Field
              basePath={basePath}
              readOnly={readOnly}
              keyword="anyOf"
              isSchema={false}
            />
          </div>

          <div className="flex gap-4 items-start">
            <Field
              basePath={basePath}
              readOnly={readOnly}
              keyword="oneOf"
              isSchema={false}
            />
            <Field
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
};
