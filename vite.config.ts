import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';

export default defineConfig({
  root: './frontend',
  plugins: [
    checker({ typescript: { tsconfigPath: './frontend/tsconfig.json' } }),
  ],
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
});
