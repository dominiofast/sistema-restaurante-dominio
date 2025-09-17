#!/usr/bin/env node

/**
 * Script para verificar se os arquivos estão organizados corretamente
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

// Cores para output
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[36m',
    magenta: '\x1b[35m'
};

// Regras de organização
const rules = {
    '.sql': {
        shouldBeIn: ['database'],
        exclude: ['node_modules', 'supabase/migrations']
    },
    '.ps1': {
        shouldBeIn: ['scripts/powershell'],
        exclude: ['node_modules']
    },
    '.bat': {
        shouldBeIn: ['scripts/batch'],
        exclude: ['node_modules']
    },
    'test*.html': {
        shouldBeIn: ['test-files'],
        exclude: ['node_modules', 'public']
    }
};

// Arquivos permitidos na raiz
const allowedInRoot = [
    'package.json',
    'package-lock.json',
    'README.md',
    'LICENSE',
    '.gitignore',
    '.env',
    '.env.example',
    'vite.config.ts',
    'tailwind.config.ts',
    'tsconfig.json',
    'postcss.config.js',
    'eslint.config.js',
    'components.json',
    'vercel.json',
    'netlify.toml',
    'index.html',
    '.editorconfig',
    'ESTRUTURA-PROJETO.md',
    'GUIA-ORGANIZACAO.md'
];

let issues = [];
let stats = {
    totalFiles: 0,
    organized: 0,
    misplaced: 0,
    rootFiles: 0
};

// Função para verificar arquivos recursivamente
function checkDirectory(dir, relativePath = '') {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
        const fullPath = path.join(dir, file);
        const relPath = path.join(relativePath, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            // Ignora diretórios específicos
            if (!['node_modules', '.git', 'dist', '.vite-cache'].includes(file)) {
                checkDirectory(fullPath, relPath);
            }
        } else {
            stats.totalFiles++;
            checkFile(relPath, fullPath);
        }
    });
}

// Função para verificar se um arquivo está no lugar correto
function checkFile(relativePath, fullPath) {
    const fileName = path.basename(relativePath);
    const dirName = path.dirname(relativePath);
    const ext = path.extname(fileName);
    
    // Verifica arquivos na raiz
    if (dirName === '.') {
        if (!allowedInRoot.includes(fileName) && 
            !fileName.startsWith('.') && 
            !['ts', 'tsx', 'jsx'].includes(ext.slice(1))) {
            
            issues.push({
                type: 'root',
                file: fileName,
                suggestion: getSuggestion(fileName, ext)
            });
            stats.misplaced++;
            stats.rootFiles++;
        } else {
            stats.organized++;
        }
        return;
    }
    
    // Verifica arquivos SQL
    if (ext === '.sql') {
        if (!dirName.startsWith('database') && !dirName.includes('supabase\\migrations') && !dirName.includes('supabase/migrations')) {
            issues.push({
                type: 'misplaced',
                file: relativePath,
                current: dirName,
                suggestion: 'database/queries/'
            });
            stats.misplaced++;
        } else {
            stats.organized++;
        }
    }
    // Verifica scripts PowerShell
    else if (ext === '.ps1') {
        if (!dirName.includes('scripts/powershell') && dirName !== 'scripts') {
            issues.push({
                type: 'misplaced',
                file: relativePath,
                current: dirName,
                suggestion: 'scripts/powershell/'
            });
            stats.misplaced++;
        } else {
            stats.organized++;
        }
    }
    // Verifica scripts Batch
    else if (ext === '.bat') {
        if (!dirName.includes('scripts/batch')) {
            issues.push({
                type: 'misplaced',
                file: relativePath,
                current: dirName,
                suggestion: 'scripts/batch/'
            });
            stats.misplaced++;
        } else {
            stats.organized++;
        }
    }
    // Verifica arquivos de teste
    else if (fileName.startsWith('test') && ext === '.html') {
        if (!dirName.includes('test-files')) {
            issues.push({
                type: 'misplaced',
                file: relativePath,
                current: dirName,
                suggestion: 'test-files/'
            });
            stats.misplaced++;
        } else {
            stats.organized++;
        }
    } else {
        stats.organized++;
    }
}

// Função para sugerir localização
function getSuggestion(fileName, ext) {
    if (ext === '.sql') return 'database/queries/';
    if (ext === '.ps1') return 'scripts/powershell/';
    if (ext === '.bat') return 'scripts/batch/';
    if (ext === '.js' && !fileName.includes('config')) return 'scripts/nodejs/';
    if (fileName.startsWith('test') && ext === '.html') return 'test-files/';
    if (ext === '.md') return 'docs/';
    return 'appropriate folder';
}

// Executa a verificação
console.log(`${colors.blue}🔍 Verificando organização do projeto...${colors.reset}\n`);
process.chdir(projectRoot);
checkDirectory('.');

// Exibe relatório
console.log(`${colors.magenta}📊 Relatório de Organização${colors.reset}`);
console.log(`${colors.magenta}${'='.repeat(50)}${colors.reset}\n`);

console.log(`Total de arquivos: ${stats.totalFiles}`);
console.log(`${colors.green}✅ Organizados corretamente: ${stats.organized}${colors.reset}`);
console.log(`${colors.yellow}⚠️  Fora do lugar: ${stats.misplaced}${colors.reset}`);
console.log(`${colors.red}❌ Arquivos na raiz: ${stats.rootFiles}${colors.reset}\n`);

// Exibe problemas encontrados
if (issues.length > 0) {
    console.log(`${colors.yellow}📋 Problemas Encontrados:${colors.reset}\n`);
    
    // Agrupa por tipo
    const rootIssues = issues.filter(i => i.type === 'root');
    const misplacedIssues = issues.filter(i => i.type === 'misplaced');
    
    if (rootIssues.length > 0) {
        console.log(`${colors.red}Arquivos na raiz que deveriam estar organizados:${colors.reset}`);
        rootIssues.forEach(issue => {
            console.log(`  • ${issue.file} → mover para ${colors.green}${issue.suggestion}${colors.reset}`);
        });
        console.log();
    }
    
    if (misplacedIssues.length > 0) {
        console.log(`${colors.yellow}Arquivos em pastas incorretas:${colors.reset}`);
        misplacedIssues.forEach(issue => {
            console.log(`  • ${issue.file}`);
            console.log(`    Atual: ${colors.red}${issue.current}${colors.reset}`);
            console.log(`    Sugerido: ${colors.green}${issue.suggestion}${colors.reset}`);
        });
    }
    
    console.log(`\n${colors.blue}💡 Dica: Use 'npm run organize:fix' para corrigir automaticamente${colors.reset}`);
} else {
    console.log(`${colors.green}🎉 Parabéns! Todos os arquivos estão organizados corretamente!${colors.reset}`);
}

// Retorna código de saída apropriado
process.exit(issues.length > 0 ? 1 : 0);
