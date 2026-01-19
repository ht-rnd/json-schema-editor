export type Theme = "light" | "dark";
export type RootType = "object" | "array";

export type ThemeContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};
