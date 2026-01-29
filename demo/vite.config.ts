import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  base: "/json-schema-editor",
  server: {
    open: "/json-schema-editor",
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, ".."),
      "@ht-rnd/json-schema-editor": resolve(__dirname, "../src/lib"),
      react: resolve(__dirname, "node_modules/react"),
      "react-dom": resolve(__dirname, "node_modules/react-dom"),
    },
  },
  build: {
    outDir: "dist",
  },
});
