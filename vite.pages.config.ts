import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  root: path.resolve("pages-src"),
  base: "/universe-31/",
  plugins: [react()],
  publicDir: false,
  build: { outDir: path.resolve("pages-dist"), emptyOutDir: true },
});
