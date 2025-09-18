#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcDir = path.join(__dirname, '../src');
const dryRun = process.argv.includes('--dry-run');

console.log(dryRun ? '🔍 DRY RUN MODE - Nenhum arquivo será modificado' : '🛠️  MODO DE CORREÇÃO - Arquivos serão modificados');

function findTSXFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      files.push(...findTSXFiles(fullPath));
    } else if (item.match(/\.(ts|tsx)$/)) {
      files.push(fullPath);
    }
  }
  
  return files;
}

function fixSupabaseComments(content, filePath) {
  let fixed = content;
  let hasChanges = false;

  // 1. Remove markers and trailing semicolons
  const removidoPattern = /\/\*.*?REMOVIDO.*?\*\/\s*;?.*$/gm;
  if (removidoPattern.test(fixed)) {
    fixed = fixed.replace(removidoPattern, '');
    hasChanges = true;
    console.log(`  ✓ Removido comentários REMOVIDO`);
  }

  // 2. Replace "/* supabase REMOVIDO */ null" patterns
  const supabaseNullPattern = /\/\*\s*supabase\s+REMOVIDO\s*\*\/\s*null/g;
  if (supabaseNullPattern.test(fixed)) {
    fixed = fixed.replace(supabaseNullPattern, 'null as any');
    hasChanges = true;
    console.log(`  ✓ Substituído padrões supabase null`);
  }

  // 3. Fix destructuring assignments to safe defaults
  const destructuringPattern = /const\s*\{\s*data:\s*(\w+),\s*error:\s*(\w+)\s*\}\s*=\s*[^;]+;/g;
  const matches = fixed.match(destructuringPattern);
  if (matches) {
    for (const match of matches) {
      const result = match.match(/const\s*\{\s*data:\s*(\w+),\s*error:\s*(\w+)\s*\}/);
      if (result) {
        const [, dataVar, errorVar] = result;
        const replacement = `const ${dataVar} = null as any; const ${errorVar} = null as any;`;
        fixed = fixed.replace(match, replacement);
        hasChanges = true;
        console.log(`  ✓ Corrigido destructuring: ${dataVar}, ${errorVar}`);
      }
    }
  }

  // 4. Remove orphaned .then() chains after commented setSession calls
  const orphanThenPattern = /^\s*\}\)\.then\(\s*\(\s*\{\s*[^}]*\}\s*\)\s*=>\s*\{[\s\S]*?\}\s*\);?$/gm;
  if (orphanThenPattern.test(fixed)) {
    fixed = fixed.replace(orphanThenPattern, '// /* .then() REMOVIDO */');
    hasChanges = true;
    console.log(`  ✓ Removido .then() órfãos`);
  }

  // 5. Remove artifact lines
  const artifactPattern = /^\s*\/\/\s*\);?$/gm;
  if (artifactPattern.test(fixed)) {
    fixed = fixed.replace(artifactPattern, '');
    hasChanges = true;
    console.log(`  ✓ Removido artefatos de comentários`);
  }

  // 6. Fix dangling object literals and method calls
  const danglingPattern = /^\s*\w+:\s*[\w\s'",]+,?\s*$/gm;
  const lines = fixed.split('\n');
  const fixedLines = [];
  let inDanglingBlock = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const prevLine = i > 0 ? lines[i - 1] : '';
    
    // Check if this line looks like a dangling object property
    if (danglingPattern.test(line) && (prevLine.includes('//') || prevLine.includes('REMOVIDO'))) {
      fixedLines.push(`// ${line.trim()}`);
      hasChanges = true;
    } else {
      fixedLines.push(line);
    }
  }
  
  if (hasChanges) {
    fixed = fixedLines.join('\n');
  }

  return { content: fixed, hasChanges };
}

function processFile(filePath) {
  const relativePath = path.relative(process.cwd(), filePath);
  const content = fs.readFileSync(filePath, 'utf8');
  
  const result = fixSupabaseComments(content, filePath);
  
  if (result.hasChanges) {
    console.log(`📝 ${relativePath}:`);
    
    if (!dryRun) {
      // Backup original file
      const backupPath = filePath + '.backup';
      fs.writeFileSync(backupPath, content);
      
      // Write fixed content
      fs.writeFileSync(filePath, result.content);
      console.log(`  💾 Arquivo corrigido (backup: ${path.basename(backupPath)})`);
    } else {
      console.log(`  🔍 [DRY RUN] Arquivo seria corrigido`);
    }
  }
  
  return result.hasChanges;
}

function main() {
  console.log('🚀 Iniciando correção de comentários Supabase...\n');
  
  const files = findTSXFiles(srcDir);
  console.log(`📁 Encontrados ${files.length} arquivos TS/TSX\n`);
  
  let changedFiles = 0;
  
  for (const file of files) {
    try {
      const changed = processFile(file);
      if (changed) changedFiles++;
    } catch (error) {
      console.error(`❌ Erro processando ${file}:`, error.message);
    }
  }
  
  console.log(`\n✅ Concluído! ${changedFiles} arquivos ${dryRun ? 'seriam modificados' : 'modificados'}`);
  
  if (!dryRun && changedFiles > 0) {
    console.log('\n💡 Execute "npm run build" para verificar se os erros foram corrigidos');
    console.log('💡 Arquivos de backup (.backup) foram criados para reverter se necessário');
  }
}

main();