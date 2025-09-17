#!/bin/bash
# Script para iniciar Vite + Proxy para Replit
echo "🚀 Iniciando Vite na porta 8080 e proxy na porta 5000..."

# Mata qualquer processo usando as portas 8080 e 5000
fuser -k 8080/tcp 2>/dev/null || true
fuser -k 5000/tcp 2>/dev/null || true

# Aguarda um momento para as portas serem liberadas
sleep 2

# Inicia o Vite em background
npm run dev &

# Aguarda um pouco para o Vite iniciar
sleep 5

# Inicia o proxy na porta 5000
echo "🔄 Iniciando proxy na porta 5000..."
node proxy-server.js