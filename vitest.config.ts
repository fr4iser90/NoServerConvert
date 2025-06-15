import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/web/__tests__/**/*.test.ts'],
    setupFiles: ['src/web/__tests__/setup.ts'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      include: ['src/web/**/*.{ts,vue}'],
      exclude: ['src/web/__tests__/**']
    }
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@shared': fileURLToPath(new URL('./src/shared', import.meta.url)),
      '@web': fileURLToPath(new URL('./src/web', import.meta.url)),
      '@ext': fileURLToPath(new URL('./src/extensions', import.meta.url))
    }
  }
}) 