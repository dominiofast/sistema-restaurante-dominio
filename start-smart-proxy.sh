#!/bin/bash
# Script inteligente para iniciar Vite + Proxy para Replit
echo "🚀 Iniciando Vite e proxy inteligente..."

# Mata qualquer processo usando as portas 8080, 8081, 8082 e 5000
fuser -k 8080/tcp 2>/dev/null || true
fuser -k 8081/tcp 2>/dev/null || true
fuser -k 8082/tcp 2>/dev/null || true
fuser -k 5000/tcp 2>/dev/null || true

# Aguarda um momento para as portas serem liberadas
sleep 3

# Inicia o Vite em background e captura a saída
npm run dev > vite.log 2>&1 &
VITE_PID=$!

# Aguarda o Vite iniciar
sleep 5

# Detecta qual porta o Vite está usando
VITE_PORT=$(grep -o "Local:.*http://localhost:[0-9]*" vite.log | grep -o "[0-9]*" | tail -1)

if [ -z "$VITE_PORT" ]; then
    echo "❌ Não foi possível detectar a porta do Vite"
    kill $VITE_PID 2>/dev/null
    exit 1
fi

echo "✅ Vite detectado na porta $VITE_PORT"

# Atualiza o proxy-server.js para usar a porta correta
sed -i "s/target: 'http:\/\/localhost:8080'/target: 'http:\/\/localhost:$VITE_PORT'/" proxy-server.js
sed -i "s/setHeader('host', 'localhost:8080')/setHeader('host', 'localhost:$VITE_PORT')/" proxy-server.js

# Inicia o proxy na porta 5000
echo "🔄 Iniciando proxy na porta 5000 (redirecionando para $VITE_PORT)..."
node proxy-server.js
