import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    // Mirrors `paths` in tsconfig.app.json. The bundler alias is independent of
    // tsconfig, so both must declare `@` or `@/…` imports resolve in the editor
    // but fail at build time.
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
