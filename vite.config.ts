import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const NEXT_PUBLIC_KEYS = ['NEXT_PUBLIC_API_BASE', 'NEXT_PUBLIC_ANALYTICS_KEY'];

export default defineConfig(() => {
  const nextPublicDefines = NEXT_PUBLIC_KEYS.reduce<Record<string, string>>((acc, key) => {
    const value = process.env[key];
    if (value !== undefined) {
      acc[`import.meta.env.${key}`] = JSON.stringify(value);
    }
    return acc;
  }, {});

  return {
    plugins: [react()],
    define: {
      ...nextPublicDefines,
    },
  };
});
