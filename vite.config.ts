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
			exclude: ["src/App.tsx", "src/main.tsx"],
		}),
	],
	test: {
		globals: true,
		environment: "jsdom",
		setupFiles: "./src/test/setup.ts",
		css: true,
		reporters: ["verbose", "junit"],
		coverage: {
			provider: "istanbul",
			reporter: ["text", "json", "html", "cobertura"],
			include: ["src/lib/components/features", "src/lib/utils"],
		},
	},
	resolve: {
		alias: {
			"@": resolve(__dirname, "src"),
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
