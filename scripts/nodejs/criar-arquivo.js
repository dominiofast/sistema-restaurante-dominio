#!/usr/bin/env node

/**
 * Script para criar novos arquivos nas pastas corretas
 * Uso: node scripts/nodejs/criar-arquivo.js --type sql --name meu-arquivo --category cashback
 */

const fs = require('fs');
const path = require('path');

// Parse argumentos da linha de comando
const args = process.argv.slice(2);
const params = {};

for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace('--', '');
    const value = args[i + 1];
    params[key] = value;
}

// Validação de parâmetros
if (!params.type || !params.name) {
    console.error('❌ Uso: node criar-arquivo.js --type [sql|js|ps1|bat|html|md] --name nome-arquivo [--category categoria]');
    process.exit(1);
}

// Configuração de caminhos
const paths = {
    sql: {
        cashback: 'database/cashback',
        fiscal: 'database/fiscal',
        horarios: 'database/horarios',
        whatsapp: 'database/whatsapp',
        migrations: 'database/migrations',
        general: 'database/queries'
    },
    ps1: 'scripts/powershell',
    js: 'scripts/nodejs',
    bat: 'scripts/batch',
    html: 'test-files',
    md: 'docs'
};

// Templates para cada tipo
const templates = {
    sql: (name, category) => `-- =============================================
-- Arquivo: ${name}
-- Data: ${new Date().toLocaleString('pt-BR')}
-- Categoria: ${category || 'general'}
-- Descrição: [Adicione uma descrição aqui]
-- =============================================

-- Seu código SQL aqui
`,
    js: (name) => `/**
 * Arquivo: ${name}
 * Data: ${new Date().toLocaleDateString('pt-BR')}
 * Descrição: [Adicione uma descrição aqui]
 */

// Seu código JavaScript aqui
`,
    ps1: (name) => `<#
.SYNOPSIS
    ${name}
.DESCRIPTION
    [Adicione uma descrição aqui]
.PARAMETER
    [Adicione parâmetros se necessário]
.EXAMPLE
    .\\${name}
.NOTES
    Data: ${new Date().toLocaleDateString('pt-BR')}
#>

# Seu código PowerShell aqui
`,
    bat: (name) => `@echo off
REM =============================================
REM Arquivo: ${name}
REM Data: ${new Date().toLocaleDateString('pt-BR')}
REM Descrição: [Adicione uma descrição aqui]
REM =============================================

REM Seu código batch aqui
`,
    html: (name) => `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${name}</title>
</head>
<body>
    <h1>${name}</h1>
    <!-- Seu código HTML aqui -->
</body>
</html>`,
    md: (name) => `# ${name}

> Data: ${new Date().toLocaleDateString('pt-BR')}

## Descrição

[Adicione uma descrição aqui]

## Conteúdo

[Adicione o conteúdo aqui]
`
};

// Determina o caminho do arquivo
let targetPath;
if (params.type === 'sql') {
    const category = params.category || 'general';
    targetPath = paths.sql[category] || paths.sql.general;
} else {
    targetPath = paths[params.type];
}

if (!targetPath) {
    console.error(`❌ Tipo de arquivo inválido: ${params.type}`);
    process.exit(1);
}

// Adiciona extensão se necessário
let fileName = params.name;
if (!fileName.endsWith(`.${params.type}`)) {
    fileName += `.${params.type}`;
}

// Caminho completo
const fullPath = path.join(targetPath, fileName);

// Cria o diretório se não existir
const dir = path.dirname(fullPath);
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Diretório criado: ${dir}`);
}

// Verifica se o arquivo já existe
if (fs.existsSync(fullPath)) {
    console.warn(`⚠️  Arquivo já existe: ${fullPath}`);
    console.log('Use --force para sobrescrever');
    if (!params.force) {
        process.exit(1);
    }
}

// Cria o arquivo com template
const template = templates[params.type];
const content = template ? template(fileName, params.category) : '';

fs.writeFileSync(fullPath, content, 'utf8');
console.log(`✅ Arquivo criado com sucesso: ${fullPath}`);
console.log(`📝 Template ${params.type} aplicado`);
console.log(`\n🎯 Para abrir o arquivo, use: code "${fullPath}"`);
