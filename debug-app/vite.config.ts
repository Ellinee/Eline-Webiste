import { fileURLToPath, URL } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  base: "/debug/",
  publicDir: false,
  css: { postcss: { plugins: [] } },
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)), "@debug-contract": fileURLToPath(new URL("../debug/contract.ts", import.meta.url)) } },
  build: { outDir: "../.debug-dist", emptyOutDir: true, assetsDir: "assets", sourcemap: false },
});
