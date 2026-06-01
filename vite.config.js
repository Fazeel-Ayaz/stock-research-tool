import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/fh-api': {
        target: 'https://finnhub.io',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/fh-api/, ''),
      },
      // Yahoo Finance — for analyst price targets (free, no key needed)
      '/yf-api': {
        target: 'https://query2.finance.yahoo.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/yf-api/, ''),
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; research-tool/1.0)' },
      },
      '/notion-api': {
        target: 'https://api.notion.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/notion-api/, ''),
        headers: { 'Notion-Version': '2022-06-28' },
      },
    },
  },
})
