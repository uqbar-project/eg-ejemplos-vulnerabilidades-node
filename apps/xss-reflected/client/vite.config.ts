// apps/xss-reflected/client/vite.config.ts
import { resolve } from 'path'

import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        // Aquí le decís: "el nombre de la página": "la ruta al archivo"
        main: resolve(__dirname, 'search.html'), 
      },
    },
  },
})