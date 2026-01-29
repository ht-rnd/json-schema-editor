import type { RootType, Theme } from ".";

export interface IHeaderProps {
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
}

export interface EditorConfigProps {
  rootType: RootType;
  selectedSchema: string;
  schemas: string[];
  showOutput: boolean;
  onRootTypeChange: (rootType: RootType) => void;
  onSchemaChange: (schema: string) => void;
  onShowOutputChange: (showOutput: boolean) => void;
}
