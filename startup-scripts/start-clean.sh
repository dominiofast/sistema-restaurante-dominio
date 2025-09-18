#!/bin/bash
# Script para iniciar aplicação com backend Express e frontend Vite
echo "🧹 Limpando portas e iniciando aplicação..."

# Mata todos os processos Node.js
pkill -f node 2>/dev/null || true

# Aguarda um momento
sleep 2

# Build frontend primeiro
echo "🏗️ Building frontend..."
npm run build

# Inicia servidor Express com backend seguro
echo "🚀 Iniciando servidor backend+frontend na porta 5000..."
node server/index.js


