# 🍕 Configuração de Sabores de Pizza - Múltiplas Quantidades

## ✅ Funcionalidade Implementada

Agora é possível permitir que clientes selecionem múltiplas quantidades do mesmo sabor em pizzas!

### Exemplo: Pizza Grande com 3 Sabores
- **2x Calabresa** + **1x Mussarela** = 3 sabores total
- **1x Margherita** + **2x Pepperoni** = 3 sabores total

## 🔧 Como Configurar

### 1. Configuração da Categoria de Sabores

Para permitir múltiplas quantidades de sabores, configure a categoria assim:

```json
{
  "name": "Sabores Pizzas",
  "description": "Escolha até 3 sabores para sua pizza",
  "selection_type": "quantity",  // ← IMPORTANTE: usar "quantity"
  "is_required": true,
  "min_selection": 1,
  "max_selection": 3,  // ← IMPORTANTE: definir limite máximo
  "adicionais": [
    {
      "name": "Calabresa",
      "description": "Calabresa, cebola e azeitona",
      "price": 0.00
    },
    {
      "name": "Mussarela", 
      "description": "Mussarela e tomate",
      "price": 0.00
    },
    {
      "name": "Margherita",
      "description": "Mussarela, tomate e manjericão",
      "price": 2.00
    }
  ]
}
```

### 2. Tipos de Seleção Disponíveis

| Tipo | Comportamento | Uso Recomendado |
|------|---------------|-----------------|
| `single` | Radio button - apenas 1 opção | Tamanho da pizza |
| `multiple` | Checkbox - várias opções | Ingredientes extras |
| `quantity` | Botões +/- com limite | **Sabores de pizza** ✅ |

### 3. Interface do Cliente

Com `selection_type: "quantity"` e `max_selection: 3`, o cliente verá:

```
Sabores Pizzas                    2 de 3 sabores
┌─────────────────────────────────────────────┐
│ Calabresa                           [-] 2 [+]│
│ Calabresa, cebola e azeitona                │
├─────────────────────────────────────────────┤
│ Mussarela                           [-] 1 [+]│
│ Mussarela e tomate                          │
├─────────────────────────────────────────────┤
│ Margherita                          [-] 0 [+]│
│ Mussarela, tomate e manjericão   +R$ 2,00   │
└─────────────────────────────────────────────┘
```

### 4. Funcionalidades Implementadas

✅ **Contador de sabores**: "2 de 3 sabores"
✅ **Limite máximo**: Botão "+" desabilitado quando limite atingido
✅ **Validação**: Não permite ultrapassar max_selection
✅ **Interface intuitiva**: Botões +/- sempre visíveis
✅ **Status visual**: Badge "Completo" quando limite atingido

## 🎯 Resultado

Agora os clientes podem:
- Escolher **2x Calabresa + 1x Mussarela** 
- Escolher **1x Margherita + 1x Pepperoni + 1x Portuguesa**
- Ver em tempo real quantos sabores já selecionaram
- Não conseguir ultrapassar o limite máximo

## 📝 Para Implementar

1. **No painel admin**: Editar categoria de sabores
2. **Alterar**: `selection_type` de `"single"` para `"quantity"`
3. **Definir**: `max_selection` conforme tamanho da pizza
4. **Salvar**: As mudanças já funcionarão automaticamente

## 🔄 Configurações por Tamanho

Sugestão de limites por tamanho:
- **Pizza Pequena**: `max_selection: 2`
- **Pizza Média**: `max_selection: 2` 
- **Pizza Grande**: `max_selection: 3`
- **Pizza Família**: `max_selection: 4`
