// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import "dotenv/config";

export default defineConfig(({ mode }) => ({
	base: (process.env.VITE_GITHUB_DEPLOY || process.env.NODE_ENV !== "production") ? "/math-club-western/" : "/",
	server: {
		host: "::",
		port: 8080,
	},
	plugins: [
		react(),
		mode === "development" && componentTagger(),
	].filter(Boolean),
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
}));