import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Forward API calls to the Express server so the client can call
      // same-origin paths in dev without dealing with CORS.
      "/chat": "http://localhost:3000",
      "/ingest": "http://localhost:3000",
    },
  },
})
