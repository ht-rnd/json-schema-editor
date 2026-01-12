import { Theme } from ".";

export interface IHeaderProps {
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
}
