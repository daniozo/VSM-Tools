import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import electron from 'vite-plugin-electron';
import { resolve } from 'path';

// Configuration conditionnelle basée sur une variable d'environnement
const isElectronEnabled = process.env.ELECTRON_BUILD === 'true';

// Configuration principale
const config = {
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  },
  server: {
    port: 3000
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
};

// Ajout conditionnel du plugin Electron
if (isElectronEnabled) {
  config.plugins.push(
    electron({
      entry: 'src/main/main.ts',
      vite: {
        build: {
          outDir: 'electron/build',
          rollupOptions: {
            external: ['electron']
          }
        }
      }
    })
  );
}

export default defineConfig(config);