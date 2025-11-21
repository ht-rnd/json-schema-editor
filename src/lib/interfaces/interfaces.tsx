import { FieldArrayWithId } from "react-hook-form";
import { JSONSchema } from "../hooks/useSchemaForm";

export interface Styles {
  output: {
    position: "top" | "bottom" | "left" | "right";
    showJson: boolean;
    width: "sm" | "md" | "lg" | "full";
    height: "sm" | "md" | "lg" | "full";
  };
  form: {
    width: "sm" | "md" | "lg" | "full";
    height: "sm" | "md" | "lg" | "full";
  };
  settings: {
    width: "sm" | "md" | "lg" | "full";
  };
  spacing: "sm" | "md" | "lg";
}

export interface SettingsDialogProps {
  theme: "dark" | "light";
  readOnly: boolean;
  className: string;
  isOpen: boolean;
  fieldPath?: string | null;
  onClose: () => void;
}

export interface SettingsProps {
  theme: "dark" | "light";
  readOnly: boolean;
  basePath: string;
}

export interface SchemaSettingsProps {
  theme: "dark" | "light";
  basePath: string;
  readOnly?: boolean;
}

export interface FieldRowProps {
  theme: "dark" | "light";
  readOnly?: boolean;
  defs?: boolean;
  control: any;
  fieldPath: string;
  isRootLevel: boolean;
  onRemove: () => void;
  onOpenSettings?: (path: string) => void;
  onTypeChange: (newType: string) => void;
  onKeyChange?: (oldKey: string, newKey: string) => void;
}

export interface FieldProps {
  theme: "dark" | "light";
  readOnly?: boolean;
  fieldPath: string;
  defs?: boolean;
  onRemove: () => void;
  onOpenSettings?: (path: string) => void;
  onKeyChange?: (oldKey: string, newKey: string) => void;
  isRootLevel?: boolean;
}

export interface FieldListProps {
  theme: "dark" | "light";
  readOnly?: boolean;
  fields: FieldArrayWithId<any, "properties", "fieldId">[];
  onRemove: (index: number) => void;
  onOpenSettings?: (path: string) => void;
}

export interface RootProps {
  theme: "dark" | "light";
  readOnly?: boolean;
  rootType: "object" | "array";
  onAddField: () => void;
  onOpenSettings?: (path: string) => void;
}

export interface JsonSchemaEditorProps {
  rootType: "object" | "array";
  readOnly: boolean;
  theme: "dark" | "light";
  styles?: Styles;
  onChange?: (schema: JSONSchema) => void;
  defaultValue?: JSONSchema;
}
