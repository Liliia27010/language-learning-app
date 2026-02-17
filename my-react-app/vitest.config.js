import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./src/testing/setupTests.js'],
    browser: {
      enabled: true,
      name: 'chromium',
      provider: 'playwright',
      headless: false,
    },
  },
});