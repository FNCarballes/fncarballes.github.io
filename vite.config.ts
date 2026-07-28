import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Esto obliga a Vite a usar una única instancia de Three.js
    dedupe: ['three'],
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})