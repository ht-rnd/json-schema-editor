import { resolve } from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/json-schema-editor/",
  resolve: {
    alias: {
      "@ht-rnd/json-schema-editor": resolve(__dirname, "../src/lib"),
      "@json-schema-editor": resolve(__dirname, "../components/json-schema-editor"),
    },
  },
  build: {
    outDir: "dist",
  },
});
