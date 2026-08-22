import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // 相对路径：GitHub Pages 子路径、本地 preview、任意静态目录都能打开
  base: "./",
  plugins: [react()],
  optimizeDeps: {
    exclude: ["@ffmpeg/ffmpeg", "@ffmpeg/util"],
  },
  worker: {
    format: "es",
  },
});
