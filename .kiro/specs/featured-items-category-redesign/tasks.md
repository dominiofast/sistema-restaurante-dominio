# Plano de Implementação

- [x] 1. Criar componente FeaturedProductCard especializado



  - Criar arquivo `src/components/cardapio/public/FeaturedProductCard.tsx`
  - Copiar estrutura base do ProductCard existente como ponto de partida
  - Implementar interface FeaturedProductCardProps
  - Criar testes unitários básicos para o novo componente


  - _Requisitos: 1.1, 3.1_

- [ ] 2. Implementar lógica de detecção da categoria "Destaque"
  - Criar hook `useFeaturedCategory` para detectar categoria atual
  - Implementar função para identificar se categoria é "Destaque" (por nome ou ID)

  - Adicionar suporte para variações do nome ("Destaque", "Destaques", "Promoções")
  - Criar testes para lógica de detecção de categoria
  - _Requisitos: 1.1, 1.4_

- [ ] 3. Implementar badge de desconto com design da referência
  - Criar componente `DiscountBadge` dentro do FeaturedProductCard
  - Implementar cálculo de porcentagem de desconto

  - Aplicar estilos visuais conforme referência fornecida
  - Adicionar validações para evitar badges com valores inválidos
  - Criar testes para cálculo de desconto e renderização do badge
  - _Requisitos: 2.1, 2.2, 2.4_

- [ ] 4. Aplicar visual diferenciado ao FeaturedProductCard
  - Implementar layout conforme referência visual fornecida
  - Aplicar estilos especiais (cores, sombras, bordas) para categoria "Destaque"
  - Manter responsividade e compatibilidade com diferentes tamanhos de tela
  - Garantir que todas as informações do produto continuem visíveis
  - Criar testes visuais para verificar aplicação correta dos estilos


  - _Requisitos: 3.1, 3.2, 3.3_



- [ ] 5. Implementar renderização condicional no componente pai
  - Modificar componente que renderiza a lista de produtos
  - Adicionar lógica para usar FeaturedProductCard quando categoria é "Destaque"
  - Manter ProductCard original para todas as outras categorias
  - Implementar fallback gracioso caso detecção de categoria falhe
  - Criar testes de integração para renderização condicional
  - _Requisitos: 1.1, 1.3, 3.4_

- [ ] 6. Garantir funcionalidade de clique e interação
  - Verificar que onProductClick funciona corretamente no FeaturedProductCard
  - Manter todas as funcionalidades existentes (adicionar ao carrinho, etc.)
  - Testar navegação e acessibilidade do novo componente
  - Implementar testes de interação do usuário
  - _Requisitos: 3.4_

- [ ] 7. Otimizar performance e acessibilidade
  - Implementar memoização do FeaturedProductCard se necessário
  - Adicionar labels apropriados para screen readers no badge de desconto
  - Verificar contraste de cores e legibilidade
  - Otimizar re-renders desnecessários na mudança de categoria
  - Criar testes de performance e acessibilidade
  - _Requisitos: 3.3_

- [ ] 8. Testar integração completa
  - Testar mudança entre categoria "Destaque" e outras categorias
  - Verificar que produtos com e sem desconto são exibidos corretamente
  - Testar com diferentes configurações de empresa e cores primárias
  - Validar que outras categorias permanecem inalteradas
  - Executar testes de regressão para garantir que nada foi quebrado
  - _Requisitos: 1.2, 1.3, 2.3, 3.1_