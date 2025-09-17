# Instruções para Trocar o Som da Campainha

## 🔔 Som Atual
O sistema atualmente usa o arquivo `public/bell.mp3` para o som da campainha.

## 📱 Para Trocar para Som de Telefone

### Opção 1: Baixar um Som de Telefone Gratuito

Você pode baixar sons de telefone gratuitos dos seguintes sites:

1. **Freesound.org**
   - Acesse: https://freesound.org/search/?q=phone+ring
   - Baixe um som de telefone (formato MP3)
   - Sons recomendados: "Classic Phone Ring", "Telephone Ring"

2. **Zapsplat.com** (requer cadastro gratuito)
   - Acesse: https://www.zapsplat.com/sound-effect-category/phone-rings/
   - Escolha um som de telefone clássico ou moderno

3. **Soundbible.com**
   - Acesse: https://soundbible.com/tags-phone.html
   - Sons disponíveis sem cadastro

### Opção 2: Usar Som de Telefone do Windows

Se você está no Windows, pode usar um dos sons do sistema:
- Navegue até: `C:\Windows\Media`
- Procure por arquivos como: `Ring01.wav`, `Ring02.wav`, etc.
- Converta para MP3 usando um conversor online

### Como Substituir o Som

1. **Baixe o novo som** em formato MP3
2. **Renomeie o arquivo** para `bell.mp3`
3. **Substitua o arquivo** em `public/bell.mp3`
4. **Teste** fazendo um novo pedido pelo cardápio público

### Características Recomendadas do Som

- **Duração**: Entre 1-3 segundos
- **Volume**: Moderado (será ajustado pelo sistema)
- **Formato**: MP3
- **Tamanho**: Menor que 500KB

### Sugestões de Sons de Telefone

1. **Telefone Clássico** - Som de telefone antigo com campainha mecânica
2. **Telefone Moderno** - Tom digital mais suave
3. **iPhone Ringtone** - Som familiar e reconhecível
4. **Android Phone** - Som padrão do Android

## 🎵 Implementação Atual

O som é tocado através do hook `useCampainhaRobusta` que:
- Toca o som a cada 3 segundos quando há pedidos em análise
- Volume configurado em 100% (1.0)
- Para automaticamente quando não há mais pedidos

## ✅ Alterações Visuais Implementadas

1. **Removido o alerta grande** que ocupava muito espaço na tela
2. **Adicionado indicador compacto** no card do pedido:
   - Ícone de sino pulsante no canto superior direito
   - Botão vermelho que permite parar o som
   - Borda vermelha pulsante no card
3. **Melhor integração visual** com o design existente

## 📌 Observações

- O novo som será aplicado imediatamente após a substituição do arquivo
- Não é necessário alterar nenhum código
- O sistema continuará funcionando exatamente da mesma forma
- Recomenda-se testar em diferentes volumes para garantir que seja audível mas não irritante 