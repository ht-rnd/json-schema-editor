import { useState, ReactNode, createContext, useContext } from "react";
import { Header } from "./components/Header";
import { Theme, ThemeContextType } from "./types";

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

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <div className={`${theme} bg-background text-foreground h-screen`}>
        <Header theme={theme} onThemeChange={handleThemeChange} />
        {children}
      </div>
    </ThemeContext.Provider>
  );
};
