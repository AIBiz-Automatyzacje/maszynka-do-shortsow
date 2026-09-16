import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  root: "dashboard",
  plugins: [react()],
  server: { port: 5757, strictPort: true, open: false },
  build: { outDir: "../dist-dashboard", emptyOutDir: true },
});
