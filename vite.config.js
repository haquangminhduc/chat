import { defineConfig } from 'vite';

export default defineConfig({
  // Asset tương đối để chạy đúng ở cả root domain và /chat.minhducAI/.
  base: './',
  build: {
    target: 'es2022'
  }
});
