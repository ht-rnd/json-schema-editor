import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { nanoid } from "nanoid";
import { z } from "zod";
import { useMemo } from "react";

const baseSchema = z.object({
  type: z
    .enum(["string", "number", "integer", "boolean", "object", "array"])
    .optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  default: z.any().optional(),
  minimum: z.number().optional(),
  maximum: z.number().optional(),
  exclusiveMin: z.number().optional(),
  exclusiveMax: z.number().optional(),
  multipleOf: z.number().optional(),
  minLength: z.number().optional(),
  maxLength: z.number().optional(),
  minContains: z.number().optional(),
  maxContains: z.number().optional(),
  minProperties: z.number().optional(),
  maxProperties: z.number().optional(),
  isModifiable: z.boolean().optional(),
  "x-modifiable": z.array(z.string()).optional(),
  pattern: z.string().optional(),
  format: z.string().optional(),
  minItems: z.number().optional(),
  maxItems: z.number().optional(),
  uniqueItems: z.boolean().optional(),
  enum: z.array(z.any()).optional(),
  $id: z.string().optional(),
  $schema: z.string().optional(),
});

export type JSONSchema = z.infer<typeof baseSchema> & {
  properties?: { [key: string]: JSONSchema };
  items?: JSONSchema | JSONSchema[];
  required?: string[];
  additionalProperties?: boolean | JSONSchema;
  allOf?: JSONSchema[];
  anyOf?: JSONSchema[];
  oneOf?: JSONSchema[];
  not?: JSONSchema;
};

const jsonSchema: z.ZodType<JSONSchema> = baseSchema.extend({
  properties: z.lazy(() => z.record(z.string(), jsonSchema)).optional(),
  items: z.lazy(() => z.union([jsonSchema, z.array(jsonSchema)])).optional(),
  required: z.array(z.string()).optional(),
  additionalProperties: z
    .lazy(() => z.union([z.boolean(), jsonSchema]))
    .optional(),
  allOf: z.lazy(() => z.array(jsonSchema)).optional(),
  anyOf: z.lazy(() => z.array(jsonSchema)).optional(),
  oneOf: z.lazy(() => z.array(jsonSchema)).optional(),
  not: z.lazy(() => jsonSchema).optional(),
});

const formSchema = z.object({
  root: jsonSchema,
  properties: z.array(
    z.object({
      id: z.string(),
      key: z.string().min(1),
      isRequired: z.boolean(),
      schema: jsonSchema,
    })
  ),
});

const formToSchema = (formData: z.infer<typeof formSchema>): JSONSchema => {
  const transformToSchema = (schema: any): JSONSchema => {
    const newSchema = { ...schema };

    if (Array.isArray(newSchema.properties)) {
      const propertiesObject: { [key: string]: JSONSchema } = {};
      const requiredFields: string[] = [];
      newSchema.properties.forEach((prop: any) => {
        if (prop.key) {
          propertiesObject[prop.key] = transformToSchema(prop.schema);
          if (prop.isRequired) {
            requiredFields.push(prop.key);
          }
        }
      });

      newSchema.properties = propertiesObject;
      if (requiredFields.length > 0) {
        newSchema.required = requiredFields;
      }
    }

    if (
      typeof newSchema.items === "object" &&
      newSchema.items !== null &&
      !Array.isArray(newSchema.items)
    ) {
      newSchema.items = transformToSchema(newSchema.items);
    } else if (Array.isArray(newSchema.items)) {
      newSchema.items = newSchema.items.map((itemSchema: any) =>
        transformToSchema(itemSchema)
      );
    }

    return newSchema;
  };

  const finalSchema: JSONSchema = { ...transformToSchema(formData.root) };
  const properties: { [key: string]: JSONSchema } = {};
  const required: string[] = [];

  formData.properties.forEach((prop) => {
    if (prop.key) {
      properties[prop.key] = transformToSchema(prop.schema);
      if (prop.isRequired) {
        required.push(prop.key);
      }
    }
  });

  if (Object.keys(properties).length > 0) {
    finalSchema.properties = properties;
  }

  if (required.length > 0) {
    finalSchema.required = required;
  }

  return finalSchema;
};

const schemaToForm = (schema: JSONSchema): z.infer<typeof formSchema> => {
  const transformToForm = (currentSchema: JSONSchema): any => {
    const newSchema: any = { ...currentSchema };

    if (
      typeof newSchema.properties === "object" &&
      !Array.isArray(newSchema.properties)
    ) {
      const propertiesArray: any[] = [];
      Object.keys(newSchema.properties).forEach((key) => {
        const propertySchema = newSchema.properties[key];
        propertiesArray.push({
          id: nanoid(6),
          key: key,
          isRequired: newSchema.required?.includes(key) || false,
          schema: transformToForm(propertySchema),
        });
      });
      newSchema.properties = propertiesArray;
    }

    if (
      typeof newSchema.items === "object" &&
      newSchema.items !== null &&
      !Array.isArray(newSchema.items)
    ) {
      newSchema.items = transformToForm(newSchema.items);
    } else if (Array.isArray(newSchema.items)) {
      newSchema.items = newSchema.items.map((itemSchema: any) =>
        transformToForm(itemSchema)
      );
    }

    return newSchema;
  };

  const { properties, required, ...rootData } = schema;
  const rootProperties = { properties, required };
  const transformedRoot = transformToForm(rootProperties);

  return {
    root: { ...rootData, ...transformedRoot.root },
    properties: transformedRoot.properties || [],
  };
};

export const useSchemaForm = ({
  rootType = "object",
  defaultValue,
}: {
  rootType: "object" | "array";
  defaultValue?: JSONSchema;
}) => {
  const id = nanoid(6);
  const methods = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValue
      ? schemaToForm(defaultValue)
      : {
          root: {
            type: rootType,
            $schema: "http://json-schema.org/draft/2020-12/schema",
            ...(rootType === "object" && { additionalProperties: true }),
            ...(rootType === "array" && { items: { type: "string" } }),
          },
          properties:
            rootType === "object"
              ? [
                  {
                    id: id,
                    key: `field_${id}`,
                    isRequired: false,
                    schema: { type: "number" },
                  },
                ]
              : [],
        },
  });

  const currentFormData = methods.watch();
  const jsonSchema = useMemo(
    () => formToSchema(currentFormData),
    [currentFormData]
  );

  return {
    methods,
    jsonSchema,
  };
};
