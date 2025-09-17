import { build } from 'vite';

try {
  console.log('🚀 Iniciando build com debug...');
  
  const result = await build({
    configFile: 'vite.config.ts',
    logLevel: 'verbose',
    build: {
      minify: false, // Desabilita minificação para ver erros mais claramente
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: undefined
        }
      }
    }
  });
  
  console.log('✅ Build concluído com sucesso');
} catch (error) {
  console.error('❌ Erro durante o build:');
  console.error(error);
  process.exit(1);
}
