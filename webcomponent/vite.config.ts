import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  css: {
    postcss: {
      plugins: [require('tailwindcss')(), require('autoprefixer')()],
    },
  },
  build: {
    lib: {
      entry: 'src/web-component.ts',
      name: 'hope-restored-info',
      fileName: (format) =>
        format == 'umd' ? 'hope-restored.js' : `hope-restored.${format}.js`,
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
