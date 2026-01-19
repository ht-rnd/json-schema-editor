import react from "@vitejs/plugin-react";
import { resolve } from "path";
import dts from "vite-plugin-dts";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
      rollupTypes: true,
      outDir: "dist/types",
      include: ["src/lib"],
      exclude: ["src/App.tsx", "src/main.tsx", "components/**/*"],
    }),
  ],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    css: true,
    reporters: ["verbose"],
    coverage: {
      provider: "istanbul",
      reporter: ["text", "json", "html"],
      include: ["src/lib/core/**/*.ts"],
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
      "@ht-rnd/json-schema-editor": resolve(__dirname, "src/lib"),
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, "src/lib/index.ts"),
      name: "json-schema-editor",
      formats: ["es", "umd"],
      fileName: (format) => `lib/main.${format}.js`,
    },
    outDir: "dist",
    rollupOptions: {
      external: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
      ],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          "react/jsx-runtime": "React",
          "react/jsx-dev-runtime": "React",
        },
      },
    },
  },
});
