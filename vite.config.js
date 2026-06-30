import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/wav-to-mp3-converter/",
  plugins: [react()],
});
