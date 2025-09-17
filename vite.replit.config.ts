import { defineConfig } from 'vite'
import react from "@vitejs/plugin-react-swc"
import path from "path"
import { componentTagger } from "lovable-tagger"

export default defineConfig({
  server: {
    host: "0.0.0.0",
    port: 5000,
    allowedHosts: true,
  },
  plugins: [
    react(),
    componentTagger(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: 'es2020',
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': [
            'react',
            'react-dom',
            'react-router-dom'
          ],
          'supabase': [
            '@supabase/supabase-js'
          ]
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  esbuild: {
    target: 'es2020',
    drop: [],
  },
  define: {
    __DEV__: process.env.NODE_ENV === 'development',
  },
})