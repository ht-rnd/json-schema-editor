import { nanoid } from "nanoid";
import type { FormSchema, JSONSchema } from "./types";

export const formToSchema = (formData: FormSchema): JSONSchema => {
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
      newSchema.items = newSchema.items.map((itemSchema: any) => transformToSchema(itemSchema));
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

export const schemaToForm = (schema: JSONSchema): FormSchema => {
  const transformToForm = (currentSchema: JSONSchema): any => {
    const newSchema: any = { ...currentSchema };

    if (typeof newSchema.properties === "object" && !Array.isArray(newSchema.properties)) {
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
      newSchema.items = newSchema.items.map((itemSchema: any) => transformToForm(itemSchema));
    }

    return newSchema;
  };

  const { properties, required, ...rootData } = schema;

  const transformedRootData = transformToForm(rootData);
  const propertiesArray: any[] = [];
  if (properties) {
    Object.keys(properties).forEach((key) => {
      propertiesArray.push({
        id: nanoid(6),
        key: key,
        isRequired: required?.includes(key) || false,
        schema: transformToForm(properties[key]),
      });
    });
  }

  return {
    root: transformedRootData,
    properties: propertiesArray,
  };
};
