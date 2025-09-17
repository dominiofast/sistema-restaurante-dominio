#!/usr/bin/env pwsh

# Script para aplicar configuração automática do Agente IA
# Data: 2025-01-27

Write-Host "🤖 Aplicando configuração automática do Agente IA..." -ForegroundColor Cyan

# Verificar se estamos no diretório correto
if (-not (Test-Path "supabase")) {
    Write-Host "❌ Erro: Execute este script na raiz do projeto (onde está a pasta supabase)" -ForegroundColor Red
    exit 1
}

Write-Host "📝 Aplicando migrações..." -ForegroundColor Yellow

# Aplicar migrações
npx supabase db reset --local

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Migrações aplicadas com sucesso!" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "🤖 Sistema de Configuração Automática do Agente IA implementado!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 O que foi implementado:" -ForegroundColor Cyan
    Write-Host "• Serviço de configuração automática do Agente IA" -ForegroundColor White
    Write-Host "• Integração com o cardápio da empresa" -ForegroundColor White
    Write-Host "• Geração automática de knowledge base" -ForegroundColor White
    Write-Host "• Configuração da URL correta do cardápio" -ForegroundColor White
    Write-Host "• Tabela ai_agents_config no banco de dados" -ForegroundColor White
    Write-Host "• Interface de configuração na página do Agente IA" -ForegroundColor White
    Write-Host ""
    Write-Host "🎯 Como funciona:" -ForegroundColor Cyan
    Write-Host "1. Acesse: Configuração → Agente IA → aba Recursos" -ForegroundColor White
    Write-Host "2. Clique em 'Configurar Agente Automaticamente'" -ForegroundColor White
    Write-Host "3. O sistema vai:" -ForegroundColor White
    Write-Host "   • Buscar todos os produtos da empresa" -ForegroundColor Gray
    Write-Host "   • Configurar a URL correta: https://pedido.dominio.tech/[slug-empresa]" -ForegroundColor Gray
    Write-Host "   • Gerar conhecimento completo do cardápio" -ForegroundColor Gray
    Write-Host "   • Aplicar instruções de atendimento personalizadas" -ForegroundColor Gray
    Write-Host ""
    Write-Host "🚀 Benefícios:" -ForegroundColor Cyan
    Write-Host "• Agente conhecerá todos os produtos e preços" -ForegroundColor White
    Write-Host "• Fornecerá o link personalizado da empresa" -ForegroundColor White
    Write-Host "• Atendimento mais preciso e profissional" -ForegroundColor White
    Write-Host "• Configura automaticamente em segundos" -ForegroundColor White
    Write-Host ""
    Write-Host "📱 Resultado:" -ForegroundColor Cyan
    Write-Host "Antes: 'https://api.empresa.com/cardapio' (genérico)" -ForegroundColor Red
    Write-Host "Depois: 'https://pedido.dominio.tech/quadrata-pizzas' (personalizado)" -ForegroundColor Green
    Write-Host ""
    Write-Host "🔧 Como usar:" -ForegroundColor Yellow
    Write-Host "1. Cadastre os produtos da empresa no sistema" -ForegroundColor White
    Write-Host "2. Vá em Configuração → Agente IA → Recursos" -ForegroundColor White
    Write-Host "3. Clique no botão azul 'Configurar Agente Automaticamente'" -ForegroundColor White
    Write-Host "4. Confirme a ação no modal" -ForegroundColor White
    Write-Host "5. Pronto! O agente está configurado" -ForegroundColor White
    Write-Host ""
    Write-Host "⚡ Sistema ativo! Configure seus agentes automaticamente agora." -ForegroundColor Yellow
    
} else {
    Write-Host "❌ Erro ao aplicar migrações" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🎉 Configuração do Agente IA concluída!" -ForegroundColor Green
Write-Host "Agora você pode configurar os agentes automaticamente através da interface!" -ForegroundColor Yellow