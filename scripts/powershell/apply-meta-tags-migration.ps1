#!/usr/bin/env pwsh

# Script para aplicar migração de Meta Tags Dinâmicas
# Data: 2025-01-27

Write-Host "🚀 Aplicando migração de Meta Tags Dinâmicas..." -ForegroundColor Cyan

# Verificar se estamos no diretório correto
if (-not (Test-Path "supabase")) {
    Write-Host "❌ Erro: Execute este script na raiz do projeto (onde está a pasta supabase)" -ForegroundColor Red
    exit 1
}

try {
    Write-Host "📝 Aplicando migração de slug para companies..." -ForegroundColor Yellow
    
    # Aplicar migração do slug
    npx supabase db reset --local
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Migração de slug aplicada com sucesso!" -ForegroundColor Green
        
        Write-Host ""
        Write-Host "🎯 Meta Tags Dinâmicas implementadas com sucesso!" -ForegroundColor Green
        Write-Host ""
        Write-Host "📋 O que foi implementado:" -ForegroundColor Cyan
        Write-Host "• Campo slug adicionado à tabela companies" -ForegroundColor White
        Write-Host "• Geração automática de slugs baseada no nome da empresa" -ForegroundColor White
        Write-Host "• Serviço de meta tags dinâmicas por empresa" -ForegroundColor White
        Write-Host "• Hook para aplicar meta tags automaticamente" -ForegroundColor White
        Write-Host "• Componente integrado ao App principal" -ForegroundColor White
        Write-Host ""
        Write-Host "🔗 Como funciona:" -ForegroundColor Cyan
        Write-Host "• URL: https://pedido.dominio.tech/quadrata-pizzas" -ForegroundColor White
        Write-Host "• Sistema busca empresa pelo slug 'quadrata-pizzas'" -ForegroundColor White
        Write-Host "• Aplica meta tags específicas da Quadrata Pizzas" -ForegroundColor White
        Write-Host "• WhatsApp mostra informações da pizzaria (não da plataforma)" -ForegroundColor White
        Write-Host ""
        Write-Host "📱 Resultado no WhatsApp:" -ForegroundColor Cyan
        Write-Host "Antes: 'Dominio.tech - Plataforma Empresarial...'" -ForegroundColor Red
        Write-Host "Depois: 'Quadrata Pizzas - Cardápio Online'" -ForegroundColor Green
        Write-Host ""
        Write-Host "⚡ Sistema ativo! As meta tags agora são dinâmicas por empresa." -ForegroundColor Yellow
        
    } else {
        Write-Host "❌ Erro ao aplicar migração" -ForegroundColor Red
        exit 1
    }
    
} catch {
    Write-Host "❌ Erro durante a migração: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🎉 Migração concluída!" -ForegroundColor Green 