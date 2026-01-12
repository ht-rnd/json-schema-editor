import { useState, ReactNode } from "react";
import { Header } from "./components/Header";
import { Theme } from "./interfaces";

export const App: React.FC<{
  children: ReactNode;
}> = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>("light");

  const handleThemeChange = (newTheme: "light" | "dark") => {
    setTheme(newTheme);
  };

  return (
    <div className={`${theme} bg-background text-foreground h-screen`}>
      <Header theme={theme} onThemeChange={handleThemeChange} />
      {children}
    </div>
  );
};
