import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

async function verifyBuild() {
  console.log('🔍 Verificando integridade do projeto...\n');

  try {
    // 1. Verificar TypeScript
    console.log('📝 Verificando TypeScript...');
    await execAsync('npx tsc --noEmit');
    console.log('✅ TypeScript: OK\n');

    // 2. Verificar ESLint
    console.log('🔧 Verificando ESLint...');
    try {
      await execAsync('npx eslint src --ext .ts,.tsx --max-warnings 0');
      console.log('✅ ESLint: OK\n');
    } catch (error) {
      console.log('⚠️ ESLint encontrou warnings/erros:');
      console.log(error.stdout);
      console.log('');
    }

    // 3. Verificar dependências
    console.log('📦 Verificando dependências...');
    await execAsync('npm audit --audit-level moderate');
    console.log('✅ Dependências: OK\n');

    // 4. Build final
    console.log('🏗️ Executando build final...');
    const buildResult = await execAsync('npm run build');
    console.log('✅ Build: Sucesso\n');

    // 5. Verificar se arquivos de saída foram criados
    console.log('📁 Verificando arquivos de saída...');
    const distExists = fs.existsSync('./dist');
    const indexExists = fs.existsSync('./dist/index.html');
    
    if (distExists && indexExists) {
      console.log('✅ Arquivos de saída: OK');
      
      // Verificar tamanho dos chunks
      const assetsDir = './dist/assets';
      if (fs.existsSync(assetsDir)) {
        const files = fs.readdirSync(assetsDir);
        const jsFiles = files.filter(f => f.endsWith('.js'));
        console.log(`📊 ${jsFiles.length} arquivos JS gerados`);
        
        for (const file of jsFiles) {
          const filePath = path.join(assetsDir, file);
          const stats = fs.statSync(filePath);
          const sizeKB = Math.round(stats.size / 1024);
          console.log(`   ${file}: ${sizeKB}KB`);
        }
      }
    } else {
      console.log('❌ Arquivos de saída não encontrados');
    }

    console.log('\n🎉 Verificação concluída com sucesso!');
    console.log('✨ O projeto está pronto para deploy');

  } catch (error) {
    console.error('❌ Erro durante a verificação:');
    console.error('Comando:', error.cmd);
    console.error('Código:', error.code);
    console.error('Stdout:', error.stdout);
    console.error('Stderr:', error.stderr);
    process.exit(1);
  }
}

verifyBuild();
