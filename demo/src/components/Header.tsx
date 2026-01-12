import { Moon, Sun, Github, Package, Layers } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { IHeaderProps } from "src/interfaces/props";

export function Header({ theme, onThemeChange }: IHeaderProps) {
  return (
    <div className="border-b border-input sticky top-0 p-4 px-16 flex items-center justify-between bg-background z-[1000]">
      <Link to="/" className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
          <Layers className="w-6 h-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-xl font-bold">JSON Schema Editor</h1>
          <p className="text-sm text-muted-foreground">
            Headless • React • TypeScript
          </p>
        </div>
      </Link>

      <div className="flex items-center gap-1">
        <a
          href="https://www.npmjs.com/package/@ht-rnd/json-schema-editor"
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-2 rounded-md hover:bg-accent transition-colors text-sm"
        >
          <Package className="w-5 h-5" />
        </a>

        <a
          href="https://github.com/ht-rnd/json-schema-editor"
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-2 rounded-md hover:bg-accent transition-colors text-sm"
        >
          <Github className="w-5 h-5" />
        </a>

        <button
          onClick={() => onThemeChange(theme === "light" ? "dark" : "light")}
          className="p-2 rounded-md hover:bg-accent transition-colors"
          aria-label="Toggle theme"
        >
          {theme === "light" ? (
            <Moon className="w-5 h-5" />
          ) : (
            <Sun className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
}
