import { nanoid } from "nanoid";
import type { FormSchema, JSONSchema } from "./types";

type DraftFamily = "draft04" | "legacy" | "modern";
// draft04  = draft-04 only: boolean exclusiveMinimum, definitions keyword
// legacy   = draft-06/07:   numeric exclusiveMinimum, definitions keyword
// modern   = 2019-09+:      numeric exclusiveMinimum, $defs keyword

const detectDraft = (schemaUri?: string): DraftFamily => {
  if (!schemaUri) return "modern";
  if (schemaUri.includes("draft-04")) return "draft04";
  if (schemaUri.includes("draft-07") || schemaUri.includes("draft-06")) return "legacy";
  return "modern";
};

const UI_ONLY_KEYS = ["enumEnabled", "enumInput", "isModifiable"];

const applyUiTransforms = (schema: any, draft: DraftFamily): any => {
  const s = { ...schema };

  // Convert enumEnabled + enumInput → enum
  if (s.enumEnabled && Array.isArray(s.enumInput) && s.enumInput.length > 0) {
    let values: any[] = s.enumInput;
    if (s.type === "number") {
      values = s.enumInput.map(Number).filter((v: number) => !Number.isNaN(v));
    } else if (s.type === "integer") {
      values = s.enumInput.map(Number).filter((v: number) => Number.isInteger(v));
    }
    if (values.length > 0) {
      s.enum = values;
    }
  }

  // exclusiveMin → exclusiveMinimum (draft-aware)
  if (s.exclusiveMin != null) {
    if (draft === "draft04") {
      s.minimum = s.exclusiveMin;
      s.exclusiveMinimum = true;
    } else {
      s.exclusiveMinimum = s.exclusiveMin;
    }
    delete s.exclusiveMin;
  }

  // exclusiveMax → exclusiveMaximum (draft-aware)
  if (s.exclusiveMax != null) {
    if (draft === "draft04") {
      s.maximum = s.exclusiveMax;
      s.exclusiveMaximum = true;
    } else {
      s.exclusiveMaximum = s.exclusiveMax;
    }
    delete s.exclusiveMax;
  }

  // Strip format: "none"
  if (s.format === "none" || s.format === "") {
    delete s.format;
  }

  // Strip UI-only keys
  for (const key of UI_ONLY_KEYS) {
    delete s[key];
  }

  return s;
};

export const formToSchema = (formData: FormSchema): JSONSchema => {
  const cleanSchema = (obj: any): any => {
    if (obj === null || obj === undefined || obj === "") {
      return undefined;
    }

    if (typeof obj !== "object" || obj instanceof Date) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(cleanSchema).filter((item) => item !== undefined);
    }

    const cleaned: any = {};
    for (const key in obj) {
      const value = cleanSchema(obj[key]);
      if (value !== undefined) {
        cleaned[key] = value;
      }
    }
    return cleaned;
  };

  const draft = detectDraft(formData.root.$schema);

  const transformToSchema = (schema: any, d: DraftFamily): JSONSchema => {
    if (schema.type === "ref" && schema.$ref) {
      return cleanSchema({
        $ref: schema.$ref,
        ...(schema.title && { title: schema.title }),
        ...(schema.description && { description: schema.description }),
      });
    }

    const newSchema = applyUiTransforms({ ...schema }, d);
    if (newSchema.type === "ref") delete newSchema.type;

    if (Array.isArray(newSchema.properties)) {
      const propertiesObject: { [key: string]: JSONSchema } = {};
      const requiredFields: string[] = [];
      newSchema.properties.forEach((prop: any) => {
        if (prop.key) {
          propertiesObject[prop.key] = transformToSchema(prop.schema, d);
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
      newSchema.items = transformToSchema(newSchema.items, d);
    } else if (Array.isArray(newSchema.items)) {
      newSchema.items = newSchema.items.map((itemSchema: any) => transformToSchema(itemSchema, d));
    }

    return cleanSchema(newSchema);
  };

  const finalSchema: JSONSchema = { ...transformToSchema(formData.root, draft) };
  const properties: { [key: string]: JSONSchema } = {};
  const required: string[] = [];

  formData.properties.forEach((prop) => {
    if (prop.key) {
      properties[prop.key] = transformToSchema(prop.schema, draft);
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

  if (formData.definitions && formData.definitions.length > 0) {
    const defs: { [key: string]: JSONSchema } = {};
    formData.definitions.forEach((def) => {
      if (def.key) {
        defs[def.key] = transformToSchema(def.schema, draft);
      }
    });
    if (draft !== "modern") {
      (finalSchema as any).definitions = defs;
    } else {
      finalSchema.$defs = defs;
    }
  }

  return finalSchema;
};

const sanitizeSchema = (schema: any): any => {
  if (!schema || typeof schema !== "object" || Array.isArray(schema)) return schema;
  const result = { ...schema };
  for (const field of ["properties", "$defs", "definitions"]) {
    if (result[field] === null) {
      delete result[field];
    } else if (
      result[field] &&
      typeof result[field] === "object" &&
      !Array.isArray(result[field])
    ) {
      result[field] = Object.fromEntries(
        Object.entries(result[field]).map(([k, v]) => [k, sanitizeSchema(v)]),
      );
    }
  }
  if (result.items === null) delete result.items;
  return result;
};

export const schemaToForm = (schema: JSONSchema): FormSchema => {
  schema = sanitizeSchema(schema);
  const transformToForm = (currentSchema: JSONSchema): any => {
    const newSchema: any = { ...currentSchema };

    if (newSchema.$ref) {
      newSchema.type = "ref";
    }

    // Reverse enum
    if (Array.isArray(newSchema.enum) && newSchema.enum.length > 0) {
      newSchema.enumEnabled = true;
      newSchema.enumInput = newSchema.enum.map((v: any) => String(v));
    }

    // Reverse exclusiveMinimum
    if (newSchema.exclusiveMinimum != null) {
      if (typeof newSchema.exclusiveMinimum === "boolean") {
        // draft-07 style: boolean flag + minimum holds the value
        if (newSchema.exclusiveMinimum === true && newSchema.minimum != null) {
          newSchema.exclusiveMin = newSchema.minimum;
          delete newSchema.minimum;
        }
      } else {
        // modern style: number value
        newSchema.exclusiveMin = newSchema.exclusiveMinimum;
      }
      delete newSchema.exclusiveMinimum;
    }

    // Reverse exclusiveMaximum
    if (newSchema.exclusiveMaximum != null) {
      if (typeof newSchema.exclusiveMaximum === "boolean") {
        if (newSchema.exclusiveMaximum === true && newSchema.maximum != null) {
          newSchema.exclusiveMax = newSchema.maximum;
          delete newSchema.maximum;
        }
      } else {
        newSchema.exclusiveMax = newSchema.exclusiveMaximum;
      }
      delete newSchema.exclusiveMaximum;
    }

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

  const { properties, required, $defs, definitions: legacyDefs, ...rootData } = schema as any;
  const defsToUse = $defs ?? legacyDefs;

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
  if (propertiesArray.length === 0 && (rootData.type === "object" || !rootData.type)) {
    propertiesArray.push({ id: nanoid(6), key: "", isRequired: false, schema: { type: "string" } });
  }

  const definitionsArray: any[] = [];
  if (defsToUse) {
    Object.keys(defsToUse).forEach((key) => {
      definitionsArray.push({
        id: nanoid(6),
        key: key,
        schema: transformToForm(defsToUse[key]),
      });
    });
  }

  return {
    root: transformedRootData,
    properties: propertiesArray,
    definitions: definitionsArray,
  };
};
