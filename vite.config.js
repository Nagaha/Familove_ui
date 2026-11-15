import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The API is proxied so the browser sees one origin. That keeps the HttpOnly
// refresh cookie and the CSRF cookie first-party, with no CORS involved.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
})
