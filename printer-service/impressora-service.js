// Serviço Local de Impressão - Node.js
// Instalar: npm install express cors net body-parser node-windows

const express = require('express');
const cors = require('cors');
const net = require('net');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3333;

// Configurações
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.text());

// Comandos ESC/POS
const ESC = '\x1B';
const GS = '\x1D';

// Cache de conexões
const printerConnections = new Map();

// Rota de teste
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'Impressora Service',
    version: '1.0.0',
    uptime: process.uptime()
  });
});

// Listar impressoras Windows (alternativa)
app.get('/impressoras/windows', (req, res) => {
  const { exec } = require('child_process');
  
  exec('wmic printer get name,default', (error, stdout) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    
    const lines = stdout.split('\n').filter(line => line.trim());
    const printers = lines.slice(1).map(line => {
      const parts = line.trim().split(/\s{2,}/);
      return {
        nome: parts[1] || parts[0],
        padrao: parts[0] === 'TRUE'
      };
    }).filter(p => p.nome);
    
    res.json({ impressoras: printers });
  });
});

// Imprimir via rede
app.post('/imprimir/rede', async (req, res) => {
  const { ip, porta = 9100, conteudo } = req.body;
  
  try {
    // Conectar à impressora
    const client = new net.Socket();
    
    await new Promise((resolve, reject) => {
      client.connect(porta, ip, () => {
        console.log(`Conectado à impressora ${ip}:${porta}`);
        resolve();
      });
      
      client.on('error', reject);
      
      // Timeout de 5 segundos
      setTimeout(() => reject(new Error('Timeout de conexão')), 5000);
    });
    
    // Enviar dados
    await new Promise((resolve, reject) => {
      client.write(conteudo, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    // Fechar conexão
    client.end();
    
    res.json({ 
      sucesso: true, 
      mensagem: 'Impressão enviada com sucesso' 
    });
    
  } catch (error) {
    console.error('Erro ao imprimir:', error);
    res.status(500).json({ 
      sucesso: false, 
      erro: error.message 
    });
  }
});

// Formatar cupom
app.post('/formatar/cupom', (req, res) => {
  const { pedido } = req.body;
  let conteudo = '';
  
  // Reset
  conteudo += ESC + '@';
  
  // Cabeçalho
  conteudo += ESC + 'a' + '\x01'; // Centralizar
  conteudo += ESC + '!' + '\x30'; // Grande
  conteudo += pedido.empresa.nome + '\n';
  conteudo += ESC + '!' + '\x00'; // Normal
  conteudo += pedido.empresa.endereco + '\n';
  conteudo += pedido.empresa.telefone + '\n';
  conteudo += '=====================================\n';
  
  // Pedido
  conteudo += ESC + 'a' + '\x00'; // Esquerda
  conteudo += '\nPEDIDO #' + pedido.numero + '\n';
  conteudo += 'Data: ' + new Date().toLocaleString('pt-BR') + '\n\n';
  
  // Itens
  let total = 0;
  pedido.itens.forEach(item => {
    const subtotal = item.quantidade * item.preco;
    total += subtotal;
    conteudo += `${item.quantidade}x ${item.nome.padEnd(25)} ${subtotal.toFixed(2)}\n`;
  });
  
  conteudo += '-------------------------------------\n';
  conteudo += ESC + 'E' + '\x01'; // Negrito
  conteudo += `TOTAL: R$ ${total.toFixed(2)}\n`;
  conteudo += ESC + 'E' + '\x00';
  
  // Cortar
  conteudo += '\n\n\n\n';
  conteudo += GS + 'V' + '\x41' + '\x00';
  
  res.json({ conteudo });
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
    ╔════════════════════════════════════╗
    ║   SERVIÇO DE IMPRESSÃO INICIADO    ║
    ╠════════════════════════════════════╣
    ║   Porta: ${PORT}                      ║
    ║   URL: http://localhost:${PORT}       ║
    ╚════════════════════════════════════╝
  `);
});

// Para instalar como serviço Windows:
// npm install -g node-windows
// Criar install-service.js:
/*
const Service = require('node-windows').Service;

const svc = new Service({
  name: 'Impressora Service',
  description: 'Serviço local de impressão térmica',
  script: 'C:\\impressora-service\\impressora-service.js'
});

svc.on('install', () => {
  svc.start();
});

svc.install();
*/ 