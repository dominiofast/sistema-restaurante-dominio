# 🔧 QZ Tray - Guia de Solução de Problemas

## 🚨 Problemas Comuns e Soluções

### 1. **Demora na Conexão**

**Sintomas:**
- Conexão demora mais de 30 segundos
- Interface trava durante a conexão
- Timeout na conexão WebSocket

**Soluções Implementadas:**
- ✅ Timeout otimizado (15s para WebSocket, 5s para configuração)
- ✅ Retry reduzido de 3 para 2 tentativas
- ✅ Indicador de progresso detalhado
- ✅ Configuração de assinatura simplificada

**Como Resolver:**
1. Use o botão "Reconectar" para reconexão rápida
2. Verifique se o QZ Tray está rodando (ícone na bandeja)
3. Reinicie o QZ Tray se necessário
4. Verifique os logs na aba "Logs" para detalhes

### 2. **Erro ao Carregar Impressoras**

**Sintomas:**
- "Erro ao carregar impressoras" aparece
- Lista de impressoras vazia
- Timeout ao buscar impressoras

**Soluções Implementadas:**
- ✅ Timeout de 10s para busca de impressoras
- ✅ Timeout de 3s para detalhes de cada impressora
- ✅ Limite de 20 impressoras para evitar sobrecarga
- ✅ Fallback para informações básicas se detalhes falharem
- ✅ Carregamento paralelo otimizado

**Como Resolver:**
1. Use o botão "Recarregar" para tentar novamente
2. Verifique se as impressoras estão ligadas e conectadas
3. Execute o diagnóstico na aba "Diagnóstico"
4. Verifique os logs para erros específicos

### 3. **Problemas de Certificado/Assinatura**

**Sintomas:**
- Erro de assinatura digital
- Falha na configuração de certificados
- Conexão recusada por problemas de segurança

**Soluções Implementadas:**
- ✅ Configuração automática para desenvolvimento
- ✅ Assinatura simplificada e rápida
- ✅ Fallback automático em caso de erro
- ✅ Diagnóstico de problemas de assinatura

**Como Resolver:**
1. A configuração de desenvolvimento é automática
2. Para produção, configure certificados SSL reais
3. Use o diagnóstico para verificar problemas

## 🛠️ Ferramentas de Diagnóstico

### **Aba Diagnóstico**
- Executa verificação completa do sistema
- Testa conectividade e configuração
- Fornece relatório detalhado de problemas
- Sugere soluções específicas

### **Aba Logs**
- Mostra logs em tempo real
- Categoriza mensagens (info, warning, error, success)
- Inclui detalhes técnicos para debugging
- Auto-scroll para logs mais recentes

### **Botões de Ação Rápida**
- **Conectar**: Conexão inicial
- **Reconectar**: Desconecta e reconecta rapidamente
- **Recarregar**: Recarrega apenas as impressoras
- **Desconectar**: Desconexão limpa

## ⚡ Otimizações Implementadas

### **Performance**
- Timeouts otimizados para cada operação
- Carregamento paralelo de dados
- Limite de impressoras para evitar sobrecarga
- Configuração de assinatura simplificada

### **Confiabilidade**
- Retry automático com limite
- Fallbacks para operações que falham
- Tratamento robusto de erros
- Logs detalhados para debugging

### **Usabilidade**
- Indicadores de progresso em tempo real
- Botões de ação rápida
- Mensagens de erro claras
- Interface responsiva durante operações

## 📋 Checklist de Troubleshooting

### **Antes de Conectar**
- [ ] QZ Tray está instalado?
- [ ] QZ Tray está rodando (ícone na bandeja)?
- [ ] Porta 8181 está livre?
- [ ] Firewall não está bloqueando?

### **Durante Problemas de Conexão**
- [ ] Verificar logs na aba "Logs"
- [ ] Executar diagnóstico completo
- [ ] Tentar reconexão rápida
- [ ] Reiniciar QZ Tray se necessário

### **Para Problemas de Impressoras**
- [ ] Impressoras estão ligadas?
- [ ] Drivers estão instalados?
- [ ] Usar botão "Recarregar"
- [ ] Verificar logs para erros específicos

## 🔍 Códigos de Erro Comuns

| Erro | Causa | Solução |
|------|-------|----------|
| `Timeout na conexão WebSocket` | QZ Tray não responde | Reiniciar QZ Tray |
| `Timeout ao buscar impressoras` | Muitas impressoras ou drivers lentos | Usar botão "Recarregar" |
| `QZ Tray não está disponível` | Biblioteca não carregada | Recarregar página |
| `Erro ao obter versão` | Conexão instável | Reconectar |
| `Timeout na configuração` | Problema de assinatura | Automático (fallback) |

## 📞 Suporte Adicional

### **Recursos Oficiais**
- [Documentação QZ Tray](https://qz.io/wiki/)
- [GitHub Issues](https://github.com/qzind/tray/issues)
- [Fórum da Comunidade](https://community.qz.io/)

### **Logs e Debugging**
- Use a aba "Logs" para informações detalhadas
- Execute o diagnóstico para relatório completo
- Verifique o console do navegador (F12) para erros JavaScript

---

**Resumo:** As otimizações implementadas resolvem os principais problemas de demora na conexão e erro ao carregar impressoras, com timeouts inteligentes, fallbacks automáticos e ferramentas de diagnóstico robustas.