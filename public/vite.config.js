import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '', '');

  if (!env.API_BASE) {
    console.error('API_BASE environment variable is not set')
  }

  return {
    plugins: [react()],
    define: {
        CONFIG: JSON.stringify({
          API_BASE: env.API_BASE || 'http://localhost:3000',
      })
    },
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
  }
})