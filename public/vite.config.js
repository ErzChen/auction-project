import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: 'pages/main.html',
        auth: 'pages/auth.html',
        listing: 'pages/listing.html',
        resetPassword: 'pages/reset-password.html',
      }
    }
  }
})