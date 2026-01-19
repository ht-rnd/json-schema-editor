import { Features } from "../components/Features";
import { Link } from "@tanstack/react-router";

export function Home() {
  return (
    <div className="m-6 min-h-[calc(100vh-105px)] flex flex-col items-center justify-center">
      <h2 className="text-6xl font-bold text-primary text-center">
        Build JSON Schema Editors Your Way
      </h2>

      <p className="m-6 max-w-[48rem] text-lg text-muted-foreground text-center">
        A headless, fully customizable JSON Schema editor for React. Use the
        hook for complete control, or copy the pre-built shadcn-style
        components.
      </p>

      <div className="flex flex-wrap gap-3 justify-center mb-6">
        <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
          Draft 2020-12
        </span>
        <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
          React Hook Form
        </span>
        <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
          Zod Validation
        </span>
        <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
          AJV
        </span>
      </div>

      <Features />

      <button type="button" className="mt-6 px-3 py-2 border rounded-md bg-primary text-primary-foreground hover:bg-primary/80 transition-colors text-sm">
        <Link to="/editor">Get Started</Link>
      </button>
    </div>
  );
}
