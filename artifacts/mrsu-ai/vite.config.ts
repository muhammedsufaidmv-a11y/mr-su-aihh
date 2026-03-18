import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  base: "/",
  define: {
    "import.meta.env.VITE_GEMINI_API_KEY": JSON.stringify(process.env.GEMINI_API_KEY || ""),
  },
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": path.resolve(import.meta.dirname, "src") },
  },
  build: { outDir: "dist" }
});
