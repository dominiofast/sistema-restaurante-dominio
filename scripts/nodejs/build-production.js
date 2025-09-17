import { build } from 'vite';
import path from 'path';

try {
  console.log('🚀 Simulando build de produção...');
  
  // Simular ambiente de produção
  process.env.NODE_ENV = 'production';
  
  const result = await build({
    mode: 'production',
    logLevel: 'info',
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      minify: 'esbuild', // Usar o mesmo minificador do deploy
      target: 'es2020',
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
            icons: ['lucide-react'],
          }
        }
      },
      chunkSizeWarningLimit: 1000,
    },
    esbuild: {
      logOverride: { 'this-is-undefined-in-esm': 'silent' },
      target: 'es2020',
      platform: 'browser',
    }
  });
  
  console.log('✅ Build de produção concluído com sucesso');
} catch (error) {
  console.error('❌ Erro durante o build de produção:');
  console.error('Tipo do erro:', error.constructor.name);
  console.error('Mensagem:', error.message);
  if (error.stack) {
    console.error('Stack trace:', error.stack);
  }
  if (error.cause) {
    console.error('Causa:', error.cause);
  }
  process.exit(1);
}
