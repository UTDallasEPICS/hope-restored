import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

export default defineConfig({
  resolve: { alias: [{ find: "~", replacement: resolve(__dirname, ".") }] },
  plugins: [vue()],
  server: {
    port: 4000,
  },
  css: {
    postcss: {
      plugins: [
        tailwindcss,
        autoprefixer
      ]
    }
  },
  base: "./",
});
