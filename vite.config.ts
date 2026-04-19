import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';
import monkey from 'vite-plugin-monkey';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    monkey({
      entry: 'src/main.tsx',
      userscript: {
        author: "https://github.com/kot149",
        homepageURL: "https://github.com/kot149/gsheets-navigator",
        downloadURL: "https://github.com/kot149/gsheets-navigator/releases/latest/download/gsheets-navigator.user.js",
        match: [ 'https://docs.google.com/spreadsheets/d/*' ],
      },
    }),
  ],
});
