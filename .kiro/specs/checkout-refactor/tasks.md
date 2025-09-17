# Plano de Implementação

- [x] 1. Criar hook useCheckoutFlow


  - Criar arquivo `src/hooks/useCheckoutFlow.ts`
  - Extrair estados: step, cliente, endereco, deliveryInfo
  - Implementar setters com mesma lógica atual
  - Criar testes unitários para o hook
  - Validar que estados funcionam identicamente
  - _Requisitos: 1.1, 1.2, 4.2_


- [ ] 2. Integrar useCheckoutFlow no CardapioPublico
  - Substituir declarações de estado por hook
  - Manter todas as referências aos estados inalteradas
  - Executar testes existentes para validar comportamento
  - Comparar comportamento antes/depois da mudança


  - _Requisitos: 1.3, 1.4, 4.1_

- [ ] 3. Criar hook useCheckoutHandlers
  - Criar arquivo `src/hooks/useCheckoutHandlers.ts`
  - Extrair funções: handleCheckout, handleCheckoutComplete, handlePaymentComplete, handleIdentificacaoComplete, handleTrocarConta

  - Manter todas as dependências e lógica exatamente iguais
  - Implementar interface TypeScript para type safety
  - _Requisitos: 2.1, 2.2_

- [ ] 4. Testar hooks isoladamente
  - Criar testes unitários para useCheckoutHandlers


  - Testar cada função com diferentes cenários
  - Validar que produzem mesmos resultados das funções originais
  - Verificar que dependências são respeitadas corretamente
  - _Requisitos: 2.3, 4.2, 4.3_



- [ ] 5. Integrar useCheckoutHandlers no CardapioPublico
  - Substituir declarações de funções por hook
  - Manter todas as chamadas de função inalteradas
  - Passar todas as dependências necessárias para o hook
  - Validar que comportamento permanece idêntico

  - _Requisitos: 2.4, 3.1, 3.2_

- [ ] 6. Executar testes de regressão completos
  - Executar todos os testes existentes do projeto
  - Verificar que 100% dos testes continuam passando
  - Testar fluxos completos de checkout manualmente


  - Comparar comportamento em diferentes cenários
  - _Requisitos: 4.1, 4.4, 5.3_

- [ ] 7. Criar testes de integração para hooks
  - Testar integração entre useCheckoutFlow e useCheckoutHandlers
  - Verificar que hooks funcionam corretamente juntos


  - Testar cenários de erro e edge cases
  - Validar que não há vazamentos de memória ou problemas de performance
  - _Requisitos: 4.2, 4.3_

- [ ] 8. Limpeza e documentação final
  - Remover código comentado ou duplicado
  - Organizar imports de forma consistente
  - Adicionar documentação JSDoc para os hooks
  - Verificar que não há warnings ou erros no console
  - Validar que código está seguindo padrões do projeto
  - _Requisitos: 3.3, 3.4, 5.4_

- [ ] 9. Validação final e testes de aceitação
  - Executar suite completa de testes automatizados
  - Testar manualmente todos os fluxos de checkout
  - Verificar que performance não foi impactada
  - Confirmar que experiência do usuário permanece idêntica
  - Documentar mudanças para equipe de desenvolvimento
  - _Requisitos: 5.1, 5.2, 5.4_