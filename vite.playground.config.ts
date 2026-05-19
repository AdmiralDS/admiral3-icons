import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';

const rootPath = resolve(__dirname, 'playground');
const srcPath = resolve(__dirname, 'src');
const distPath = resolve(__dirname, 'dist');
const entryPath = resolve(distPath, 'index.js');
const flagsEntryPath = resolve(distPath, 'flags.js');

export default defineConfig({
  root: rootPath,
  plugins: [react(), svgr()],
  publicDir: false,
  resolve: {
    alias: [
      { find: '#src', replacement: srcPath },
      { find: /^@admiral-ds\/admiral3-icons$/, replacement: entryPath },
      { find: /^@admiral-ds\/admiral3-icons\/flags$/, replacement: flagsEntryPath },
    ],
  },
  build: {
    outDir: resolve(__dirname, 'dist-playground'),
    emptyOutDir: true,
  },
});
