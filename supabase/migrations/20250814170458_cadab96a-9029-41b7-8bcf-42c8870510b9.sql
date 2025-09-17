-- Limpar URLs corrompidas na tabela ai_agent_assistants
UPDATE ai_agent_assistants 
SET cardapio_url = CASE 
  WHEN cardapio_url LIKE '%dominiopizzas%' THEN 'https://pedido.dominio.tech/dominiopizzas'
  WHEN cardapio_url LIKE '%pedido.dominio.tech/%' THEN 
    REPLACE(
      REPLACE(
        REPLACE(cardapio_url, ').%E2%80%8B', ''),
        '%E2%80%8B', ''
      ),
      ').'||CHR(226)||CHR(128)||CHR(139), ''
    )
  ELSE cardapio_url
END
WHERE cardapio_url LIKE '%E2%80%8B%' OR cardapio_url LIKE '%' || CHR(226) || CHR(128) || CHR(139) || '%' OR cardapio_url LIKE '%).%';