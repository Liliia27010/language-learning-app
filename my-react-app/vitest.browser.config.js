import { defineConfig } from 'vitest/config'
import { preview } from '@vitest/browser-preview'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    globals: true,
    browser: {
      enabled: true,
      provider: preview(),
      instances: [
        { name: 'chromium', browser: 'chromium' },
      ],
    },
  },
})
