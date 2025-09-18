import fs from 'fs/promises';
import path from 'path';

const LOG_PREFIX = '🔧 [FixSyntax]';

// Padrões comuns de erros de sintaxe para corrigir
const fixPatterns = [
  // 1. Strings não terminadas
  {
    pattern: /if \(key\.startsWith\('\s*$/gm,
    replacement: "if (key.startsWith('supabase.') || key.startsWith('sb-')) {",
    description: "Corrigir strings não terminadas em startsWith"
  },
  
  // 2. Catch ou finally ausentes  
  {
    pattern: /(\s*try\s*\{[^}]*\}\s*)(?!\s*catch|\s*finally)/gm,
    replacement: "$1 catch (error) { console.error('Error:', error); }",
    description: "Adicionar catch ausente em try blocks"
  },
  
  // 3. Ponto e vírgula ausente após const declarations
  {
    pattern: /const\s+(\w+)\s*=\s*([^;]*)\s*$/gm,
    replacement: "const $1 = $2;",
    description: "Adicionar ponto e vírgula ausente"
  },
  
  // 4. Initializer ausente em const declarations
  {
    pattern: /const\s+(\w+)\s*;/gm,
    replacement: "const $1 = null;",
    description: "Adicionar initializer ausente em const"
  },
  
  // 5. Statements incompletos com await
  {
    pattern: /await\s*$/gm,
    replacement: "await Promise.resolve();",
    description: "Corrigir await statements incompletos"
  },
  
  // 6. Chaves não balanceadas - remover chaves órfãs
  {
    pattern: /^\s*\}\s*$/gm,
    replacement: "",
    description: "Remover chaves órfãs",
    validate: (content, line) => {
      // Só remover se não há abertura correspondente próxima
      const lines = content.split('\n');
      const currentLineIndex = lines.indexOf(line);
      let openBraces = 0;
      
      // Contar chaves antes desta linha
      for (let i = Math.max(0, currentLineIndex - 10); i < currentLineIndex; i++) {
        const openCount = (lines[i].match(/\{/g) || []).length;
        const closeCount = (lines[i].match(/\}/g) || []).length;
        openBraces += openCount - closeCount;
      }
      
      return openBraces <= 0; // Só remover se não há chaves abertas
    }
  },
  
  // 7. Destructuring incompleto
  {
    pattern: /const\s*\{\s*([^}]*)\s*\}\s*=\s*\n/gm,
    replacement: "const { $1 } = null as any;\n",
    description: "Corrigir destructuring incompleto"
  },
  
  // 8. Expressões de atribuição inválidas
  {
    pattern: /const\s+([^=]+)\s*=\s*=\s*/gm,
    replacement: "const $1 = ",
    description: "Corrigir atribuições duplas"
  },
  
  // 9. Reserved words em contexto inválido
  {
    pattern: /(\W)let(\s+[^=\s]*)\s*=\s*$/gm,
    replacement: "$1const$2 = null;",
    description: "Corrigir uso de reserved word 'let'"
  },
  
  // 10. Padrão específico de comentários malformados
  {
    pattern: /\/\*\s*\.\w+\(\)\s*REMOVIDO\s*\*\//gm,
    replacement: "",
    description: "Remover comentários malformados REMOVIDO"
  }
];

// Lista de arquivos com problemas conhecidos baseado nos logs
const knownProblematicFiles = [
  'src/pages/SuperAdminIFoodGlobalConfig.tsx',
  'src/pages/SuperAdminIFoodIntegrations.tsx', 
  'src/pages/IFoodIntegrationsLojista.tsx',
  'src/pages/NotasEntrada.tsx',
  'src/pages/PaginaVagasConfig.tsx',
  'src/components/admin/CompanyAdminManager.tsx',
  'src/pages/CompanyUsersManager.tsx',
  'src/pages/AcceptInvitation.tsx',
  'src/pages/AdminAgents.tsx',
  'src/pages/PromptsManagement.tsx',
  'src/pages/WhatsAppAIIntegration.tsx',
  'src/pages/ImportCardapioSupabase.tsx',
  'src/pages/marketing/CampanhasSalvas.tsx',
  'src/pages/HorariosFuncionamentoSimples.tsx',
  'src/pages/PrintNodeIntegrationPage.tsx',
  'src/pages/TesteAgentePedidos.tsx',
  'src/pages/admin/UserManagement.tsx',
  'src/pages/ProgramasPage.tsx'
];

async function getAllTypeScriptFiles(dir) {
  const files = [];
  
  async function scan(directory) {
    try {
      const entries = await fs.readdir(directory, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(directory, entry.name);
        
        if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
          await scan(fullPath);
        } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts'))) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      console.error(`${LOG_PREFIX} Erro ao escanear diretório ${directory}:`, error.message);
    }
  }
  
  await scan(dir);
  return files;
}

async function fixSyntaxErrors(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    let modifiedContent = content;
    let changesMade = 0;
    
    for (const fix of fixPatterns) {
      const originalContent = modifiedContent;
      
      if (fix.validate) {
        // Para padrões que precisam de validação customizada
        const lines = modifiedContent.split('\n');
        const modifiedLines = lines.map(line => {
          if (fix.pattern.test(line) && fix.validate(modifiedContent, line)) {
            changesMade++;
            return line.replace(fix.pattern, fix.replacement);
          }
          return line;
        });
        modifiedContent = modifiedLines.join('\n');
      } else {
        // Para padrões simples
        modifiedContent = modifiedContent.replace(fix.pattern, (...args) => {
          changesMade++;
          return fix.replacement.replace(/\$(\d+)/g, (match, num) => args[parseInt(num)]);
        });
      }
      
      if (modifiedContent !== originalContent) {
        console.log(`${LOG_PREFIX} ${path.basename(filePath)}: ${fix.description}`);
      }
    }
    
    // Só escrever se houve mudanças
    if (changesMade > 0) {
      await fs.writeFile(filePath, modifiedContent, 'utf8');
      console.log(`${LOG_PREFIX} ✅ ${path.basename(filePath)}: ${changesMade} correções aplicadas`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`${LOG_PREFIX} ❌ Erro ao processar ${filePath}:`, error.message);
    return false;
  }
}

async function main() {
  console.log(`${LOG_PREFIX} 🚀 Iniciando correção automática de erros de sintaxe...`);
  
  try {
    // Primeiro, corrigir arquivos conhecidos com problemas
    console.log(`${LOG_PREFIX} 📋 Corrigindo arquivos com problemas conhecidos...`);
    let totalFixed = 0;
    
    for (const filePath of knownProblematicFiles) {
      try {
        await fs.access(filePath);
        const fixed = await fixSyntaxErrors(filePath);
        if (fixed) totalFixed++;
      } catch (error) {
        console.log(`${LOG_PREFIX} ⚠️ Arquivo não encontrado: ${filePath}`);
      }
    }
    
    // Depois, escanear todos os arquivos TypeScript/React
    console.log(`${LOG_PREFIX} 🔍 Escaneando todos os arquivos .ts/.tsx...`);
    const allFiles = await getAllTypeScriptFiles('src');
    
    for (const filePath of allFiles) {
      if (!knownProblematicFiles.includes(filePath)) {
        const fixed = await fixSyntaxErrors(filePath);
        if (fixed) totalFixed++;
      }
    }
    
    console.log(`${LOG_PREFIX} ✅ Processamento concluído!`);
    console.log(`${LOG_PREFIX} 📊 Total de arquivos corrigidos: ${totalFixed}`);
    console.log(`${LOG_PREFIX} 📁 Total de arquivos verificados: ${allFiles.length + knownProblematicFiles.length}`);
    
  } catch (error) {
    console.error(`${LOG_PREFIX} ❌ Erro fatal:`, error);
    process.exit(1);
  }
}

// Executar o script
main().catch(console.error);