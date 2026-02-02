import { createContext, type ReactNode, useContext, useEffect, useState } from "react";
import { Header } from "./components/Header";
import type { Theme, ThemeContextType } from "./types";

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within App");
  }
  return context;
};

export const App: React.FC<{
  children: ReactNode;
}> = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>("light");

  const handleThemeChange = (newTheme: "light" | "dark") => {
    setTheme(newTheme);
  };

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <div className="bg-background text-foreground h-screen">
        <Header theme={theme} onThemeChange={handleThemeChange} />
        {children}
      </div>
    </ThemeContext.Provider>
  );
};
