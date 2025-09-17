# Plano de Implementação

- [x] 1. Criar nova rota de checkout


  - Adicionar rota `/:company_slug/checkout` no arquivo `PublicRoutes.tsx`
  - Configurar rota para renderizar componente de checkout dedicado
  - _Requisitos: 1.1, 2.1_


- [ ] 2. Criar componente CheckoutPage
  - Implementar componente `CheckoutPage.tsx` na pasta `src/pages/`
  - Integrar com componentes existentes `CheckoutModal` e `CartModal`
  - Implementar gerenciamento de estado do checkout (carrinho, entrega, pagamento)
  - Adicionar validação para carrinho vazio com redirecionamento
  - _Requisitos: 1.1, 3.1, 4.1_



- [ ] 3. Modificar navegação em ProdutoAdicionado
  - Alterar função `handleIrParaCarrinho()` no componente `ProdutoAdicionado.tsx`

  - Trocar navegação de `/${company_slug}` com state para `/${company_slug}/checkout`
  - Manter função `handleContinuarComprando()` inalterada
  - _Requisitos: 1.1, 2.2_

- [ ] 4. Corrigir navegação endereço → pagamento
  - Identificar componente responsável pela navegação na etapa de endereço
  - Corrigir lógica do botão "Avançar" para ir diretamente para formas de pagamento
  - Garantir que dados do endereço sejam preservados durante a transição
  - Eliminar comportamento inconsistente que requer segunda tentativa
  - _Requisitos: 4.1, 4.2, 4.3, 4.4_

- [ ] 5. Implementar validações e tratamento de erros
  - Adicionar verificação de carrinho vazio na nova página de checkout
  - Implementar redirecionamento para cardápio quando carrinho estiver vazio
  - Adicionar tratamento de erro para dados de cliente inválidos
  - Implementar fallbacks para cenários de erro de navegação
  - _Requisitos: 3.2, 5.2_

- [x] 6. Otimizar experiência do usuário
  - Implementar loading states durante transições
  - Adicionar breadcrumb ou indicador de progresso no checkout
  - Garantir que botão "voltar" do navegador funcione corretamente
  - Implementar preservação do estado do carrinho durante navegação
  - _Requisitos: 3.3, 5.3_

- [x] 7. Criar testes para o novo fluxo
  - Escrever testes unitários para componente `CheckoutPage`
  - Criar testes de integração para fluxo completo (produto → checkout)
  - Implementar testes para cenários de erro (carrinho vazio, dados inválidos)
  - Adicionar testes de navegação e gerenciamento de estado
  - Incluir testes específicos para navegação endereço → pagamento
  - _Requisitos: 1.2, 2.1, 3.1, 4.1_

- [ ] 8. Integrar e testar compatibilidade
  - Verificar compatibilidade com fluxos existentes (modal do carrinho)
  - Testar integração com componentes de autoatendimento
  - Validar funcionamento em diferentes dispositivos (mobile, tablet, desktop)
  - Garantir que URLs antigas ainda funcionem como fallback
  - Testar especificamente o fluxo endereço → pagamento em todos os cenários
  - _Requisitos: 2.3, 3.3, 5.1, 4.4_