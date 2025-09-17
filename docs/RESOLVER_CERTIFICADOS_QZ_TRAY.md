# Como Resolver Problemas de Certificados do QZ Tray

## 🚨 Problema Identificado

O erro "Failed to get certificate: undefined" indica que o QZ Tray não consegue obter certificados SSL válidos para estabelecer uma conexão segura.

## ✅ Soluções Implementadas

### 1. Configuração Simplificada para Desenvolvimento

Implementamos uma configuração que permite usar o QZ Tray em desenvolvimento local sem certificados SSL complexos:

```typescript
// Configuração automática em src/utils/qzDevConfig.ts
window.qz.security.setCertificatePromise(() => {
  return Promise.resolve(''); // Certificado vazio para desenvolvimento
});

window.qz.security.setSignaturePromise((toSign: string) => {
  return Promise.resolve(btoa(toSign)); // Assinatura base64 simples
});
```

### 2. Hook Atualizado

O hook `useQZTrayPrint` foi atualizado para:
- Usar a configuração de desenvolvimento automaticamente
- Fornecer diagnósticos detalhados em caso de erro
- Mostrar toasts informativos sobre o status da conexão

### 3. Diagnóstico Automático

Criamos funções de diagnóstico que verificam:
- Se o QZ Tray está disponível
- Status da conexão
- Impressoras disponíveis
- Erros específicos

## 🔧 Como Usar

### Teste Rápido

1. **Abra o console do navegador** (F12)
2. **Execute o diagnóstico**:
   ```javascript
   // Importar e testar
   import { diagnoseQZ, testPrint } from './src/utils/qzDevConfig';
   
   // Diagnóstico completo
   const diagnosis = await diagnoseQZ();
   console.log('Diagnóstico:', diagnosis);
   
   // Teste de impressão
   const success = await testPrint();
   console.log('Teste de impressão:', success ? 'Sucesso' : 'Falhou');
   ```

### Uso no Sistema

O sistema agora usa automaticamente a configuração de desenvolvimento. Quando você clicar nos botões de impressão:

1. **Conexão automática** - O sistema tenta conectar automaticamente
2. **Configuração transparente** - Certificados são configurados automaticamente
3. **Feedback visual** - Toasts mostram o status da operação
4. **Logs detalhados** - Console mostra informações de debug

## 🐛 Resolução de Problemas

### Problema: "QZ Tray não está disponível"

**Solução:**
1. Verifique se o QZ Tray está instalado
2. Certifique-se de que está rodando (ícone na bandeja do sistema)
3. Execute o script de diagnóstico: `scripts/diagnostico-qz-tray.ps1`

### Problema: "Falha na conexão"

**Solução:**
1. Reinicie o QZ Tray
2. Verifique se as portas 8181/8182 estão abertas
3. Desabilite temporariamente o firewall/antivírus
4. Use conexão HTTP (porta 8182) em vez de HTTPS

### Problema: "Impressão vai para pasta Documentos"

**Causa:** O QZ Tray está configurado para salvar em arquivo em vez de imprimir.

**Solução:**
1. **Verificar impressora padrão:**
   ```javascript
   const printers = await window.qz.printers.find();
   console.log('Impressoras:', printers);
   ```

2. **Especificar impressora correta:**
   ```javascript
   const config = window.qz.configs.create('Nome_da_Impressora_Real');
   ```

3. **Verificar se a impressora está online:**
   - Vá em Configurações > Impressoras
   - Certifique-se de que a impressora está "Pronta"
   - Faça um teste de impressão do Windows

### Problema: "Certificados inválidos"

**Solução:** A nova configuração resolve isso automaticamente, mas se persistir:

1. **Limpar cache do navegador**
2. **Reiniciar QZ Tray**
3. **Usar modo de desenvolvimento:**
   ```javascript
   // Forçar modo desenvolvimento
   localStorage.setItem('qz-dev-mode', 'true');
   ```

## 📋 Checklist de Verificação

- [ ] QZ Tray instalado e rodando
- [ ] Impressora instalada e funcionando no Windows
- [ ] Portas 8181/8182 abertas
- [ ] Firewall/antivírus não bloqueando
- [ ] Navegador permitindo conexões locais
- [ ] Console sem erros de JavaScript

## 🚀 Próximos Passos

### Para Produção

Quando for usar em produção, você precisará:

1. **Gerar certificados SSL reais:**
   ```bash
   openssl req -x509 -newkey rsa:4096 -keyout private.key -out certificate.crt -days 365
   ```

2. **Configurar domínio na whitelist do QZ Tray**

3. **Implementar assinatura digital segura**

4. **Usar HTTPS no servidor web**

### Para Desenvolvimento

A configuração atual já está otimizada para desenvolvimento local e deve funcionar imediatamente.

## 📞 Suporte

Se os problemas persistirem:

1. **Execute o diagnóstico:** `scripts/diagnostico-qz-tray.ps1`
2. **Verifique os logs** no console do navegador
3. **Teste com impressora diferente**
4. **Consulte a documentação oficial:** https://qz.io/wiki/

## ✅ Resumo das Melhorias

- ✅ **Configuração automática** de certificados para desenvolvimento
- ✅ **Diagnóstico inteligente** de problemas
- ✅ **Feedback visual** com toasts
- ✅ **Logs detalhados** para debug
- ✅ **Tratamento de erros** melhorado
- ✅ **Documentação completa** de resolução de problemas

Com essas melhorias, o QZ Tray deve funcionar corretamente em desenvolvimento local sem a necessidade de configurações complexas de certificados SSL.