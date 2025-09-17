# Requirements Document

## Introduction

Esta funcionalidade modifica apenas a categoria "Destaque" do cardápio digital para exibir os itens com um visual diferenciado que inclui badge de desconto, seguindo uma referência visual específica, sem alterar o comportamento das outras categorias.

## Requirements

### Requirement 1

**User Story:** Como cliente, eu quero ver os cards da categoria "Destaque" com um visual especial baseado na referência fornecida, para que eu possa identificar facilmente as promoções.

#### Acceptance Criteria

1. WHEN estou na categoria "Destaque" THEN os cards SHALL ter o visual da referência fornecida
2. WHEN estou na categoria "Destaque" THEN os cards SHALL manter todas as funcionalidades existentes
3. WHEN navego para outras categorias THEN elas SHALL permanecer inalteradas
4. WHEN volto para "Destaque" THEN o visual especial SHALL ser aplicado novamente

### Requirement 2

**User Story:** Como cliente, eu quero ver um badge de desconto nos cards da categoria "Destaque", para que eu possa identificar rapidamente o valor da promoção.

#### Acceptance Criteria

1. WHEN um item na categoria "Destaque" tem desconto THEN o card SHALL exibir um badge com a porcentagem de desconto
2. WHEN o badge de desconto é exibido THEN ele SHALL seguir o design da referência visual fornecida
3. WHEN um item na categoria "Destaque" não tem desconto THEN o badge SHALL não aparecer
4. WHEN o desconto é calculado THEN ele SHALL mostrar a diferença entre preço original e preço promocional

### Requirement 3

**User Story:** Como cliente, eu quero que os cards da categoria "Destaque" sigam exatamente o visual da referência, para que tenham uma aparência atrativa e profissional.

#### Acceptance Criteria

1. WHEN estou na categoria "Destaque" THEN os cards SHALL seguir exatamente o layout da referência visual
2. WHEN os cards são renderizados THEN eles SHALL manter todas as informações do produto (nome, descrição, preço)
3. WHEN os cards são exibidos THEN eles SHALL ser responsivos e funcionais em diferentes dispositivos
4. WHEN clico em um card da categoria "Destaque" THEN ele SHALL manter a funcionalidade de adicionar ao carrinho