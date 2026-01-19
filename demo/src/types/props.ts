import { Styles } from "@json-schema-editor/lib/constants";
import { RootType, Theme } from ".";

export interface IHeaderProps {
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
}

export interface EditorConfigProps {
  theme: string;
  rootType: RootType;
  selectedSchema: string;
  schemas: string[];
  styles: Partial<Styles>;
  onRootTypeChange: (rootType: RootType) => void;
  onSchemaChange: (schema: string) => void;
  onStylesChange: (styles: Partial<Styles>) => void;
}