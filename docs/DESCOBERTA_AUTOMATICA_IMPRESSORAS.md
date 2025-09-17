# 🔍 Descoberta Automática de Impressoras

## Visão Geral

O **Monitor de Impressão** agora possui um recurso de descoberta automática de impressoras! Isso elimina a necessidade de configurar manualmente os IPs das impressoras.

## Como Funciona

### 1. **Impressoras Windows** 📋
- Lista todas as impressoras instaladas no Windows
- Identifica impressoras USB e de rede
- Extrai automaticamente IPs de impressoras de rede

### 2. **Escaneamento de Rede** 🌐
- Varre IPs comuns onde impressoras são instaladas:
  - `192.168.x.100` até `192.168.x.110`
  - `192.168.x.200` até `192.168.x.210`
- Testa portas padrão: 9100, 515, 631, 80
- Identifica modelos automaticamente (Epson, Bematech, Elgin, etc.)

### 3. **Broadcast UDP** 📡
- Envia mensagem para toda a rede
- Impressoras compatíveis respondem automaticamente
- Método mais lento, mas encontra impressoras em qualquer IP

## Como Usar no App

### Interface Gráfica

1. Abra o **Monitor de Impressão**
2. Vá para a aba **"Impressoras"**
3. Clique no botão **"🔍 Descobrir Impressoras Automaticamente"**
4. Aguarde a descoberta (até 30 segundos)
5. Selecione a impressora encontrada
6. Escolha o tipo (Cozinha, Bar, Caixa, Delivery)

### Teste via Terminal

```bash
cd printer-app
node teste-descoberta.js
```

## Modelos Suportados

A descoberta automática identifica:
- **Epson**: TM-T20, TM-T88
- **Bematech**: MP-4200 TH
- **Elgin**: I9
- **Daruma**: Várias séries
- **Genéricas**: ESC/POS

## Portas Testadas

| Porta | Protocolo | Uso Comum |
|-------|-----------|-----------|
| 9100  | Raw/JetDirect | Mais comum para térmicas |
| 515   | LPR/LPD | Impressoras antigas |
| 631   | IPP | Internet Printing Protocol |
| 80    | HTTP | Algumas impressoras com web |

## Dicas de Configuração

### IPs Recomendados

Configure suas impressoras com IPs fixos:
- **Cozinha**: `192.168.1.100`
- **Bar**: `192.168.1.101`
- **Caixa**: `192.168.1.102`
- **Delivery**: `192.168.1.103`

### No Roteador

1. Reserve IPs para as impressoras (DHCP Reservation)
2. Use sempre a faixa `.100` a `.110` para impressoras
3. Mantenha impressoras no mesmo segmento de rede

## Solução de Problemas

### "Nenhuma impressora encontrada"

1. **Verifique se a impressora está ligada**
2. **Confirme que está na mesma rede**
3. **Teste o IP manualmente:**
   ```bash
   ping 192.168.1.100
   ```
4. **Firewall pode estar bloqueando**
   - Libere portas 9100, 515, 631

### "Modelo não identificado"

- Normal para impressoras genéricas
- Não afeta o funcionamento
- Configure manualmente se necessário

### Descoberta Lenta

- Escaneamento de rede pode levar até 30 segundos
- Use IPs fixos para descoberta instantânea
- Desative broadcast se não for necessário

## API para Desenvolvedores

### Descobrir Todas

```javascript
const descobridor = new DescobridorImpressoras();
const impressoras = await descobridor.descobrirTodas({
    windows: true,    // Listar Windows
    rede: true,       // Escanear rede
    broadcast: false  // Broadcast UDP
});
```

### Testar IP Específico

```javascript
const resultado = await descobridor.testarConexao('192.168.1.100', 9100);
if (resultado.sucesso) {
    console.log(`Modelo: ${resultado.modelo}`);
}
```

### Identificar Modelo

```javascript
const modelo = await descobridor.identificarModelo('192.168.1.100', 9100);
console.log(modelo); // "Bematech MP-4200"
```

## Vantagens

✅ **Configuração Rápida**: Encontre e configure em segundos  
✅ **Detecção Inteligente**: Identifica modelos automaticamente  
✅ **Multi-método**: Windows, rede e broadcast  
✅ **Interface Amigável**: Clique e use  
✅ **Sem Dependências**: Não precisa de QZ Tray ou drivers 