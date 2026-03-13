import Ajv from "ajv";
import Ajv2019 from "ajv/dist/2019";
import Ajv2020 from "ajv/dist/2020";
import addFormats from "ajv-formats";
import type { JSONSchema } from "./types";

export interface SchemaError {
  instancePath: string;
  message?: string;
}

const ajvDraft7 = addFormats(new Ajv({ strict: false }));
const ajvDraft2019 = addFormats(new Ajv2019());
const ajvDraft2020 = addFormats(new Ajv2020());

const DRAFT_MAP = [
  {
    patterns: ["draft-07", "draft-06", "draft-04"],
    ajv: ajvDraft7,
    metaUri: "http://json-schema.org/draft-07/schema",
  },
  {
    patterns: ["draft/2019-09"],
    ajv: ajvDraft2019,
    metaUri: "https://json-schema.org/draft/2019-09/schema",
  },
  {
    patterns: ["draft/2020-12"],
    ajv: ajvDraft2020,
    metaUri: "https://json-schema.org/draft/2020-12/schema",
  },
];

const DEFAULT_AJV = ajvDraft2020;
const DEFAULT_META_URI = "https://json-schema.org/draft/2020-12/schema";

function getAjvForSchema(schema: JSONSchema) {
  const uri = (schema.$schema as string) ?? "";
  for (const entry of DRAFT_MAP) {
    if (entry.patterns.some((p) => uri.includes(p))) {
      return { ajv: entry.ajv, metaUri: entry.metaUri };
    }
  }
  return { ajv: DEFAULT_AJV, metaUri: DEFAULT_META_URI };
}

export function validateCrossFieldConstraints(schema: any, path = ""): SchemaError[] {
  const errors: SchemaError[] = [];

  if (schema === null || typeof schema !== "object") return errors;

  const num = (v: unknown): number | undefined => (typeof v === "number" ? v : undefined);

  const minimum = num(schema.minimum);
  const maximum = num(schema.maximum);
  const exclusiveMinimum = schema.exclusiveMinimum;
  const exclusiveMaximum = schema.exclusiveMaximum;
  const minLength = num(schema.minLength);
  const maxLength = num(schema.maxLength);
  const minItems = num(schema.minItems);
  const maxItems = num(schema.maxItems);
  const minContains = num(schema.minContains);
  const maxContains = num(schema.maxContains);
  const minProperties = num(schema.minProperties);
  const maxProperties = num(schema.maxProperties);

  // maximum vs minimum
  if (minimum !== undefined && maximum !== undefined) {
    const strict =
      (typeof exclusiveMinimum === "boolean" && exclusiveMinimum) ||
      (typeof exclusiveMaximum === "boolean" && exclusiveMaximum);
    if (strict ? maximum <= minimum : maximum < minimum) {
      errors.push({
        instancePath: `${path}/maximum`,
        message: `maximum (${maximum}) must be >= minimum (${minimum})`,
      });
    }
  }

  // numeric exclusiveMinimum / exclusiveMaximum combinations
  if (typeof exclusiveMinimum === "number") {
    if (maximum !== undefined && maximum <= exclusiveMinimum) {
      errors.push({
        instancePath: `${path}/maximum`,
        message: `maximum (${maximum}) must be > exclusiveMinimum (${exclusiveMinimum})`,
      });
    }
    if (minimum !== undefined && exclusiveMinimum === minimum) {
      errors.push({
        instancePath: `${path}/exclusiveMinimum`,
        message: `exclusiveMinimum (${exclusiveMinimum}) must not equal minimum (${minimum})`,
      });
    }
  }
  if (typeof exclusiveMaximum === "number") {
    if (minimum !== undefined && exclusiveMaximum <= minimum) {
      errors.push({
        instancePath: `${path}/exclusiveMaximum`,
        message: `exclusiveMaximum (${exclusiveMaximum}) must be > minimum (${minimum})`,
      });
    }
    if (typeof exclusiveMinimum === "number" && exclusiveMaximum <= exclusiveMinimum) {
      errors.push({
        instancePath: `${path}/exclusiveMaximum`,
        message: `exclusiveMaximum (${exclusiveMaximum}) must be > exclusiveMinimum (${exclusiveMinimum})`,
      });
    }
    if (maximum !== undefined && exclusiveMaximum === maximum) {
      errors.push({
        instancePath: `${path}/exclusiveMaximum`,
        message: `exclusiveMaximum (${exclusiveMaximum}) must not equal maximum (${maximum})`,
      });
    }
  }

  if (minLength !== undefined && maxLength !== undefined && maxLength < minLength) {
    errors.push({
      instancePath: `${path}/maxLength`,
      message: `maxLength (${maxLength}) must be >= minLength (${minLength})`,
    });
  }

  if (minItems !== undefined && maxItems !== undefined && maxItems < minItems) {
    errors.push({
      instancePath: `${path}/maxItems`,
      message: `maxItems (${maxItems}) must be >= minItems (${minItems})`,
    });
  }

  if (minContains !== undefined && maxContains !== undefined && maxContains < minContains) {
    errors.push({
      instancePath: `${path}/maxContains`,
      message: `maxContains (${maxContains}) must be >= minContains (${minContains})`,
    });
  }

  if (minProperties !== undefined && maxProperties !== undefined && maxProperties < minProperties) {
    errors.push({
      instancePath: `${path}/maxProperties`,
      message: `maxProperties (${maxProperties}) must be >= minProperties (${minProperties})`,
    });
  }

  // Recurse into properties (object map)
  if (
    schema.properties &&
    typeof schema.properties === "object" &&
    !Array.isArray(schema.properties)
  ) {
    for (const key of Object.keys(schema.properties)) {
      errors.push(
        ...validateCrossFieldConstraints(schema.properties[key], `${path}/properties/${key}`),
      );
    }
  }

  // Recurse into items (non-array only)
  if (schema.items && typeof schema.items === "object" && !Array.isArray(schema.items)) {
    errors.push(...validateCrossFieldConstraints(schema.items, `${path}/items`));
  }

  // Recurse into $defs
  if (schema.$defs && typeof schema.$defs === "object") {
    for (const key of Object.keys(schema.$defs)) {
      errors.push(...validateCrossFieldConstraints(schema.$defs[key], `${path}/$defs/${key}`));
    }
  }

  // Recurse into definitions (draft-04/06/07)
  if (schema.definitions && typeof schema.definitions === "object") {
    for (const key of Object.keys(schema.definitions)) {
      errors.push(
        ...validateCrossFieldConstraints(schema.definitions[key], `${path}/definitions/${key}`),
      );
    }
  }

  return errors;
}

export function validateSchema(schema: JSONSchema): SchemaError[] | null {
  const { ajv, metaUri } = getAjvForSchema(schema);
  const isValid = ajv.validate(metaUri, schema);
  const ajvErrors: SchemaError[] = isValid ? [] : ((ajv.errors ?? []) as SchemaError[]);
  const crossFieldErrors = validateCrossFieldConstraints(schema);
  const combined = [...ajvErrors, ...crossFieldErrors];
  return combined.length > 0 ? combined : null;
}
