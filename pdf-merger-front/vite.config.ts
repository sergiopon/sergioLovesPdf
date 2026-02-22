import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
  },
  plugins: [
    react(),
    tailwindcss(), // Asegúrate de que este plugin esté aquí
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})