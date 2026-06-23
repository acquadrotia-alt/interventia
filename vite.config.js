import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Percorsi relativi: così funziona sia su dominio Cloudflare che in sottocartella
  base: "./",
});
