# Requirements Document

## Introduction

Esta funcionalidade visa simplificar a interface da página de clientes, unificando a visualização de todos os clientes em uma única página sem separação por status, e alterando o título para ser mais descritivo da funcionalidade.

## Requirements

### Requirement 1

**User Story:** Como um usuário do sistema, eu quero ver todos os clientes em uma única página sem separação por abas, para que eu possa ter uma visão completa e simplificada de todos os meus clientes.

#### Acceptance Criteria

1. WHEN o usuário acessa a página de clientes THEN o sistema SHALL exibir todos os clientes (ativos, inativos e em potencial) em uma única lista
2. WHEN o usuário visualiza a página THEN o sistema SHALL NOT exibir abas separadas para diferentes status de clientes
3. WHEN o usuário visualiza a lista THEN o sistema SHALL manter todas as funcionalidades existentes (pesquisa, ações, etc.)

### Requirement 2

**User Story:** Como um usuário do sistema, eu quero que o título da página seja "Cadastro do Cliente" ao invés de "Meus Clientes", para que reflita melhor a funcionalidade de gerenciamento de clientes.

#### Acceptance Criteria

1. WHEN o usuário acessa a página de clientes THEN o sistema SHALL exibir o título "Cadastro do Cliente"
2. WHEN o usuário visualiza o título THEN o sistema SHALL NOT exibir "Meus Clientes"
3. WHEN o título é alterado THEN o sistema SHALL manter a contagem total de clientes visível

### Requirement 3

**User Story:** Como um usuário do sistema, eu quero que a funcionalidade de pesquisa continue funcionando para todos os clientes, para que eu possa encontrar rapidamente qualquer cliente independente do seu status.

#### Acceptance Criteria

1. WHEN o usuário utiliza a pesquisa THEN o sistema SHALL buscar em todos os clientes (ativos, inativos e em potencial)
2. WHEN o usuário pesquisa THEN o sistema SHALL manter a mesma funcionalidade de busca por nome ou telefone
3. WHEN os resultados são exibidos THEN o sistema SHALL destacar os termos pesquisados

### Requirement 4

**User Story:** Como um usuário do sistema, eu quero que todas as ações disponíveis (editar, excluir, adicionar cashback) continuem funcionando, para que eu não perca nenhuma funcionalidade existente.

#### Acceptance Criteria

1. WHEN o usuário clica nas ações de um cliente THEN o sistema SHALL manter todas as funcionalidades existentes
2. WHEN o usuário adiciona cashback THEN o sistema SHALL continuar funcionando normalmente
3. WHEN o usuário edita ou exclui um cliente THEN o sistema SHALL manter o comportamento atual