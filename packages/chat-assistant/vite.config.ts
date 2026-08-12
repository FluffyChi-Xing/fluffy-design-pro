import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    dts({
      entryRoot: 'src',
      insertTypesEntry: true,
      rollupTypes: true,
    }),
  ],
  build: {
    lib: {
      entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
      formats: ['es', 'cjs'],
      fileName: (format) => format === 'es' ? 'index.js' : 'index.cjs',
      cssFileName: 'style',
    },
    rollupOptions: {
      external: ['vue', 'lucide-vue-next', 'markstream-vue'],
      output: {
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
})
