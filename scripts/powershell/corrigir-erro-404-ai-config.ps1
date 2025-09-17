# Script PowerShell para corrigir erro 404 da tabela ai_agent_config
# Execute este script para resolver o problema

Write-Host "" -ForegroundColor White
Write-Host "🔧 CORREÇÃO DO ERRO 404 - AI_AGENT_CONFIG" -ForegroundColor Yellow
Write-Host "===========================================" -ForegroundColor Yellow
Write-Host ""

Write-Host "❌ PROBLEMA IDENTIFICADO:" -ForegroundColor Red
Write-Host "A tabela 'ai_agent_config' pode não existir ou estar mal configurada" -ForegroundColor White
Write-Host "Isso causa erro 404 ao tentar acessar as configurações do agente IA" -ForegroundColor White
Write-Host ""

Write-Host "🎯 SOLUÇÃO:" -ForegroundColor Green
Write-Host "1. Criar/corrigir a tabela ai_agent_config com estrutura correta" -ForegroundColor White
Write-Host "2. Configurar políticas RLS adequadas" -ForegroundColor White
Write-Host "3. Migrar dados da tabela antiga (se existir)" -ForegroundColor White
Write-Host "4. Verificar se tudo está funcionando" -ForegroundColor White
Write-Host ""

Write-Host "📋 INSTRUÇÕES:" -ForegroundColor Cyan
Write-Host "1. O script SQL foi copiado para sua área de transferência" -ForegroundColor White
Write-Host "2. Abra o Supabase SQL Editor" -ForegroundColor White
Write-Host "3. Cole o script (Ctrl+V)" -ForegroundColor White
Write-Host "4. Clique em 'Run' ou pressione Ctrl+Enter" -ForegroundColor White
Write-Host "5. Aguarde a execução completa" -ForegroundColor White
Write-Host ""

# Copiar o script SQL para a área de transferência
Get-Content "corrigir-ai-agent-config.sql" | Set-Clipboard

Write-Host "✅ Script SQL copiado para área de transferência!" -ForegroundColor Green
Write-Host ""

Write-Host "🚀 APÓS EXECUTAR O SCRIPT:" -ForegroundColor Yellow
Write-Host "1. Faça refresh da página (F5)" -ForegroundColor White
Write-Host "2. Tente acessar: Configuracao -> Agente IA" -ForegroundColor White
Write-Host "3. O erro 404 deve estar resolvido" -ForegroundColor White
Write-Host ""

Write-Host "📊 O QUE O SCRIPT FAZ:" -ForegroundColor Cyan
Write-Host "✅ Cria a tabela ai_agent_config (se não existir)" -ForegroundColor White
Write-Host "✅ Configura índices para performance" -ForegroundColor White
Write-Host "✅ Aplica políticas RLS corretas" -ForegroundColor White
Write-Host "✅ Migra dados da tabela antiga (se existir)" -ForegroundColor White
Write-Host "✅ Verifica se tudo está funcionando" -ForegroundColor White
Write-Host ""

Write-Host "⚠️  IMPORTANTE:" -ForegroundColor Yellow
Write-Host "- Execute o script no SQL Editor do Supabase" -ForegroundColor White
Write-Host "- Aguarde todas as mensagens de confirmação" -ForegroundColor White
Write-Host "- Se houver erros, copie a mensagem e reporte" -ForegroundColor White
Write-Host ""

Write-Host "🎉 Após a correção, você poderá:" -ForegroundColor Green
Write-Host "✅ Acessar as configurações do agente IA" -ForegroundColor White
Write-Host "✅ Configurar mensagens de boas-vindas" -ForegroundColor White
Write-Host "✅ Personalizar o comportamento do agente" -ForegroundColor White
Write-Host "✅ Usar a configuração automática" -ForegroundColor White
Write-Host ""

Write-Host "📞 SUPORTE:" -ForegroundColor Cyan
Write-Host "Se o problema persistir, verifique:" -ForegroundColor White
Write-Host "1. Se você tem permissões adequadas no Supabase" -ForegroundColor White
Write-Host "2. Se a migração foi executada completamente" -ForegroundColor White
Write-Host "3. Se há mensagens de erro no console do navegador" -ForegroundColor White
Write-Host ""

Write-Host "🔧 Script pronto para execução!" -ForegroundColor Green
Write-Host "Cole no SQL Editor do Supabase e execute." -ForegroundColor Yellow