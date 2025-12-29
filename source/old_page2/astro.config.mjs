import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

import tailwindcss from '@tailwindcss/vite';

// Мы пока убрали tailwind отсюда, чтобы не было ошибки
export default defineConfig({
  integrations: [react()],

  vite: {
    plugins: [tailwindcss()]
  }
});