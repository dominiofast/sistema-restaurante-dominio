import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

async function testVercelBuild() {
  console.log('🧪 Simulando build do Vercel...\n');

  try {
    // 1. Limpar node_modules e dist (simular ambiente limpo)
    console.log('🧹 Limpando ambiente...');
    if (fs.existsSync('./node_modules')) {
      console.log('Removendo node_modules...');
      await execAsync('rmdir /s /q node_modules', { shell: true });
    }
    if (fs.existsSync('./dist')) {
      console.log('Removendo dist...');
      await execAsync('rmdir /s /q dist', { shell: true });
    }
    console.log('✅ Ambiente limpo\n');

    // 2. Instalar dependências (simular npm install do Vercel)
    console.log('📦 Instalando dependências...');
    process.env.NODE_ENV = 'production';
    await execAsync('npm install --production=false');
    console.log('✅ Dependências instaladas\n');

    // 3. Build (simular build do Vercel)
    console.log('🏗️ Executando build...');
    const buildResult = await execAsync('npm run build');
    console.log('Build stdout:', buildResult.stdout);
    if (buildResult.stderr) {
      console.log('Build stderr:', buildResult.stderr);
    }
    console.log('✅ Build concluído\n');

    // 4. Verificar resultado
    console.log('📁 Verificando resultado...');
    const distExists = fs.existsSync('./dist');
    const indexExists = fs.existsSync('./dist/index.html');
    
    if (distExists && indexExists) {
      console.log('✅ Build bem-sucedido! Arquivos criados:');
      const files = fs.readdirSync('./dist');
      files.forEach(file => {
        const stats = fs.statSync(path.join('./dist', file));
        if (stats.isDirectory()) {
          console.log(`   📁 ${file}/`);
        } else {
          const sizeKB = Math.round(stats.size / 1024);
          console.log(`   📄 ${file} (${sizeKB}KB)`);
        }
      });
    } else {
      console.log('❌ Build falhou - arquivos não criados');
    }

    console.log('\n🎉 Teste de build do Vercel concluído com sucesso!');

  } catch (error) {
    console.error('❌ Erro durante o teste de build:');
    console.error('Comando:', error.cmd);
    console.error('Código de saída:', error.code);
    if (error.stdout) console.error('Stdout:', error.stdout);
    if (error.stderr) console.error('Stderr:', error.stderr);
    process.exit(1);
  }
}

testVercelBuild();
