import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import VitePluginStyleInject from './VitePluginStyleInject'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), VitePluginStyleInject(),],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/package/index.js'),
      name: 'imagePreview',
      fileName: (format) => `image-preview.${format}.js`
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: {
          vue: 'vue'
        },
        manualChunks: undefined
      }
    }
  }
})
