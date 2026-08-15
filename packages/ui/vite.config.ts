import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

const entries = {
  index: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
  button: fileURLToPath(new URL('./src/entries/button.ts', import.meta.url)),
  input: fileURLToPath(new URL('./src/entries/input.ts', import.meta.url)),
  textarea: fileURLToPath(new URL('./src/entries/textarea.ts', import.meta.url)),
  checkbox: fileURLToPath(new URL('./src/entries/checkbox.ts', import.meta.url)),
  card: fileURLToPath(new URL('./src/entries/card.ts', import.meta.url)),
  skeleton: fileURLToPath(new URL('./src/entries/skeleton.ts', import.meta.url)),
  empty: fileURLToPath(new URL('./src/entries/empty.ts', import.meta.url)),
  icon: fileURLToPath(new URL('./src/entries/icon.ts', import.meta.url)),
  utils: fileURLToPath(new URL('./src/entries/utils.ts', import.meta.url)),
}

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
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    lib: {
      entry: entries,
      formats: ['es', 'cjs'],
      fileName: (format, entryName) => format === 'es' ? `${entryName}.js` : `${entryName}.cjs`,
      cssFileName: 'style',
    },
    rollupOptions: {
      external: ['vue', 'lucide-vue-next', 'reka-ui', 'class-variance-authority', 'clsx', 'tailwind-merge'],
    },
  },
})
