import type * as React from "react";

export interface SettingsProps extends React.HTMLAttributes<HTMLFormElement> {
  basePath: string;
  readOnly?: boolean;
}

export interface DivSettingsProps extends React.HTMLAttributes<HTMLDivElement> {
  basePath: string;
  readOnly?: boolean;
}

export interface DefinitionItem {
  id: string;
  key: string;
  schema: any;
}