# 📚 Guia de Organização de Arquivos

## 🎯 Como Garantir que Novos Arquivos Sejam Criados nas Pastas Corretas

### 1️⃣ **Usando Scripts de Criação Automática**

#### PowerShell (Windows)
```powershell
# Criar arquivo SQL de cashback
.\scripts\criar-arquivo.ps1 -Type sql -Name "novo-calculo-cashback" -Category cashback

# Criar script PowerShell
.\scripts\criar-arquivo.ps1 -Type ps1 -Name "backup-database"

# Criar arquivo de teste HTML
.\scripts\criar-arquivo.ps1 -Type html -Name "test-payment-flow"
```

#### Node.js (Multiplataforma)
```bash
# Criar arquivo SQL
node scripts/nodejs/criar-arquivo.js --type sql --name novo-relatorio --category fiscal

# Criar script JavaScript
node scripts/nodejs/criar-arquivo.js --type js --name processar-dados

# Criar documentação
node scripts/nodejs/criar-arquivo.js --type md --name API-DOCS
```

### 2️⃣ **Configurações do VS Code**

O arquivo `.vscode/settings.json` já está configurado para:
- Sugerir pastas corretas ao salvar arquivos
- Aplicar templates automáticos
- Organizar arquivos por tipo

### 3️⃣ **Regras de Organização**

| Tipo de Arquivo | Pasta Destino | Exemplo |
|----------------|---------------|---------|
| `.sql` (cashback) | `database/cashback/` | calcular-cashback.sql |
| `.sql` (fiscal) | `database/fiscal/` | nfe-config.sql |
| `.sql` (geral) | `database/queries/` | relatorio-vendas.sql |
| `.ps1` | `scripts/powershell/` | deploy-script.ps1 |
| `.js` (scripts) | `scripts/nodejs/` | processar-dados.js |
| `.bat` | `scripts/batch/` | start-server.bat |
| `test*.html` | `test-files/` | test-checkout.html |
| `.md` | `docs/` | API-GUIDE.md |

### 4️⃣ **Atalhos Rápidos**

Crie aliases no seu terminal para facilitar:

#### PowerShell
```powershell
# Adicione ao seu perfil do PowerShell
function New-SqlFile {
    param($name, $category = "general")
    .\scripts\criar-arquivo.ps1 -Type sql -Name $name -Category $category
}

function New-Script {
    param($name, $type = "js")
    .\scripts\criar-arquivo.ps1 -Type $type -Name $name
}
```

#### Bash/Zsh
```bash
# Adicione ao seu .bashrc ou .zshrc
alias newsql='node scripts/nodejs/criar-arquivo.js --type sql'
alias newjs='node scripts/nodejs/criar-arquivo.js --type js'
alias newdoc='node scripts/nodejs/criar-arquivo.js --type md'
```

### 5️⃣ **Templates Automáticos**

Todos os scripts de criação incluem templates com:
- Cabeçalho padrão
- Data de criação
- Espaço para descrição
- Estrutura básica do código

### 6️⃣ **Validação e Linting**

Para garantir que arquivos existentes estejam no lugar certo:

```powershell
# Script para verificar arquivos fora do lugar
Get-ChildItem -Path . -Include *.sql,*.ps1,*.bat,*.js -File | Where-Object {
    $_.DirectoryName -eq (Get-Location).Path
} | ForEach-Object {
    Write-Host "⚠️ Arquivo na raiz: $($_.Name)" -ForegroundColor Yellow
}
```

### 7️⃣ **Git Hooks (Opcional)**

Crie um pre-commit hook para validar localização:

```bash
#!/bin/sh
# .git/hooks/pre-commit

# Verifica se há arquivos SQL na raiz
sql_files=$(git diff --cached --name-only | grep '^[^/]*\.sql$')
if [ ! -z "$sql_files" ]; then
    echo "❌ Arquivos SQL detectados na raiz. Mova para database/"
    echo "$sql_files"
    exit 1
fi
```

### 8️⃣ **Integração com CI/CD**

No seu pipeline (GitHub Actions, etc.):

```yaml
- name: Verificar Organização
  run: |
    # Verifica se arquivos estão nas pastas corretas
    if ls *.sql 2>/dev/null; then
      echo "::error::Arquivos SQL encontrados na raiz"
      exit 1
    fi
```

## 📋 Checklist de Boas Práticas

- [ ] Sempre use os scripts de criação para novos arquivos
- [ ] Configure seu editor com as settings fornecidas
- [ ] Revise periodicamente arquivos na raiz
- [ ] Documente o propósito de cada arquivo criado
- [ ] Use nomes descritivos e consistentes
- [ ] Mantenha a estrutura de pastas limpa
- [ ] Atualize este guia quando criar novas categorias

## 🔄 Manutenção Regular

Execute mensalmente:

```powershell
# Relatório de organização
Write-Host "📊 Relatório de Organização" -ForegroundColor Cyan
Write-Host "SQL em database: $((Get-ChildItem -Path database -Filter *.sql -Recurse).Count)"
Write-Host "Scripts em scripts: $((Get-ChildItem -Path scripts -Filter *.ps1,*.js,*.bat -Recurse).Count)"
Write-Host "Testes em test-files: $((Get-ChildItem -Path test-files -Filter *.html).Count)"
Write-Host "Arquivos na raiz: $((Get-ChildItem -Path . -File | Where-Object { $_.Extension -in '.sql','.ps1','.js','.bat' }).Count)"
```

---

**Lembre-se**: Uma estrutura organizada facilita a manutenção, colaboração e escalabilidade do projeto! 🚀
