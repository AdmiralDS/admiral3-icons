import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';

const rootPath = resolve(__dirname);
const srcPath = resolve(rootPath, 'src');
const entryPath = resolve(srcPath, 'index.ts');
const flagsEntryPath = resolve(srcPath, 'flags.ts');

export default defineConfig({
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        dimensions: false,
        svgProps: {
          focusable: '{false}',
        },
      },
    }),
  ],
  publicDir: false,
  resolve: {
    alias: [
      { find: '#src', replacement: srcPath },
      { find: /^@admiral-ds\/admiral3-icons$/, replacement: entryPath },
      { find: /^@admiral-ds\/admiral3-icons\/flags$/, replacement: flagsEntryPath },
    ],
  },
  build: {
    copyPublicDir: false,
    lib: {
      entry: {
        index: resolve(srcPath, 'index.ts'),
        flags: resolve(srcPath, 'flags.ts'),
      },
      formats: ['es'],
      fileName: (_format, entryName) => `${entryName}.js`,
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
    },
  },
});
