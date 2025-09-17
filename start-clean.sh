#!/bin/bash
# Script para iniciar limpo na porta 5000
echo "🧹 Limpando portas e iniciando aplicação..."

# Mata todos os processos Node.js
pkill -f node 2>/dev/null || true

# Aguarda um momento
sleep 2

# Inicia o Vite na porta 5000 com configuração para Replit
echo "🚀 Iniciando Vite na porta 5000 com config para Replit..."
npx vite --config vite.replit.config.ts --host 0.0.0.0 --port 5000


