import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // 允许外部访问
    port: 5173,
    strictPort: true,
    // 允许所有来源访问（开发环境）
    cors: true,
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
