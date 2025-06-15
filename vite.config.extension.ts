import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  root: 'src/extensions',
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src/extensions', import.meta.url)),
      '@shared': fileURLToPath(new URL('./src/shared', import.meta.url))
    }
  },
  optimizeDeps: {
    exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util', 'pdfjs-dist']
  },
  build: {
    outDir: 'dist/extensions',
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'src/extensions/popup.html'),
        background: resolve(__dirname, 'src/extensions/background.ts'),
        content: resolve(__dirname, 'src/extensions/content.ts')
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]',
        manualChunks: {
          pdfjs: ['pdfjs-dist']
        }
      }
    }
  },
  publicDir: 'public',
  server: {
    fs: {
      allow: ['..']
    }
  }
})
