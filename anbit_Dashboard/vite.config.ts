import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3001,
        host: '0.0.0.0',
        cors: true,
        proxy: {
          '/api': {
            target: 'http://localhost:5057',
            changeOrigin: true,
            secure: false,
          },
        },
      },
      plugins: [
        react(),
        {
          name: 'cors-wallet-data',
          configureServer(server) {
            server.middlewares.use((req, res, next) => {
              if (req.url === '/wallet-data.json' || req.url?.startsWith('/wallet-data')) {
                res.setHeader('Access-Control-Allow-Origin', '*');
              }
              next();
            });
          },
        },
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
