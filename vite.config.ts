import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

function normalizeBasePath(input?: string): string {
  const raw = input?.trim();

  if (!raw) {
    return '/';
  }

  let normalized = raw;

  if (!normalized.startsWith('/')) {
    normalized = `/${normalized}`;
  }

  if (!normalized.endsWith('/')) {
    normalized = `${normalized}/`;
  }

  return normalized.replace(/\/{2,}/g, '/');
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    base: mode === 'production' ? normalizeBasePath(env.BASE_PATH) : '/',
    plugins: [react()]
  };
});
