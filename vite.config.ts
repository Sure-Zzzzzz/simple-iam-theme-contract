import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: {
        'components/Button': './src/components/Button.vue',
        'components/Pagination': './src/components/Pagination.vue',
        'components/Dialog': './src/components/Dialog.vue',
        'components/Drawer': './src/components/Drawer.vue',
        'components/PageHeader': './src/components/PageHeader.vue',
        'components/FormSelect': './src/components/FormSelect.vue'
      },
      formats: ['es']
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue'
        }
      }
    }
  }
});
