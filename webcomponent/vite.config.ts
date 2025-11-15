import { fileURLToPath, URL } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
// @ts-ignore
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
    // Load .env variables based on the current mode (development, production, etc.)
    const env = loadEnv(mode, process.cwd(), '');
    const devUrl = new URL(env.VITE_EXTERNAL_VIEWER_URL || 'http://localhost:5173');
    const host = devUrl.hostname;
    const port = Number(devUrl.port) || 5173;
    return {
        plugins: [
            vue(),
            tailwindcss()
        ],
        server: {
            host,
            port,
            open: true // optional: auto-open in browser
        },
        build: {
            lib: {
            entry: 'src/web-component.ts',
            name: 'hope-restored-info',
            fileName: (format) =>
            format === 'umd' ? 'hope-restored.js' : `hope-restored.${format}.js`,
        },
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      },
    },
  };
});

