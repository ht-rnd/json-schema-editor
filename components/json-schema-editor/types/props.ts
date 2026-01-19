import type { FieldArrayWithId } from "react-hook-form";
import type { Styles } from "../lib/constants";

export interface JsonSchemaEditorProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  rootType?: "object" | "array";
  defaultValue?: any;
  onChange?: (schema: any) => void;
  readOnly?: boolean;
  showOutput?: boolean;
  theme?: string;
  styles?: Partial<Styles>;
}

export interface FieldProps extends React.HTMLAttributes<HTMLDivElement> {
  readOnly?: boolean;
  fieldPath: string;
  defs?: boolean;
  onRemove?: () => void;
  onOpenSettings?: (path: string) => void;
  onKeyChange?: (oldKey: string, newKey: string) => void;
  isRootLevel?: boolean;
  isSchemaDirect?: boolean;
  theme?: string;
}

export interface FieldRowProps extends React.HTMLAttributes<HTMLDivElement> {
  readOnly?: boolean;
  control: any;
  fieldPath: string;
  schemaPath: string;
  defs?: boolean;
  isRootLevel?: boolean;
  onRemove?: () => void;
  onOpenSettings?: (path: string) => void;
  onTypeChange?: (newType: string) => void;
  onKeyChange?: (oldKey: string, newKey: string) => void;
  theme?: string;
}

export interface FieldListProps extends React.HTMLAttributes<HTMLDivElement> {
  readOnly?: boolean;
  fields: FieldArrayWithId<any, "properties", "fieldId">[];
  onRemove?: (index: number) => void;
  onOpenSettings?: (path: string) => void;
  theme?: string;
}

export type BoolCombKeyword = "allOf" | "anyOf" | "oneOf" | "not";

export interface BoolCombFieldProps {
  basePath: string;
  readOnly?: boolean;
  keyword: BoolCombKeyword;
  isSchema: boolean;
}

export interface RootProps extends React.HTMLAttributes<HTMLDivElement> {
  readOnly?: boolean;
  rootType?: "object" | "array";
  onAddField?: () => void;
  onOpenSettings?: (path: string) => void;
  theme?: string;
}

export interface DefinitionsSettingsProps extends React.HTMLAttributes<HTMLDivElement> {
  readOnly?: boolean;
  onKeyChange?: (oldKey: string, newKey: string | null) => void;
  theme?: string;
}

export interface SettingsDialogProps extends React.HTMLAttributes<HTMLDivElement> {
  readOnly?: boolean;
  isOpen?: boolean;
  fieldPath?: string | null;
  onClose?: () => void;
  theme?: string;
}

export interface SettingsProps extends React.HTMLAttributes<HTMLFormElement> {
  basePath: string;
  readOnly?: boolean;
  theme?: string;
}

export interface DivSettingsProps extends React.HTMLAttributes<HTMLDivElement> {
  basePath: string;
  readOnly?: boolean;
  theme?: string;
}
