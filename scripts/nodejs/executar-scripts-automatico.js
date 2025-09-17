const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function executarScript(arquivo, descricao) {
    console.log(`\n🚀 Executando: ${descricao}`);
    console.log(`📁 Arquivo: ${arquivo}`);
    
    try {
        // Ler o arquivo SQL
        const sql = fs.readFileSync(arquivo, 'utf8');
        
        // Executar via API
        const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
        
        if (error) {
            console.log(`❌ Erro: ${error.message}`);
            return false;
        }
        
        console.log(`✅ Sucesso: ${descricao}`);
        return true;
    } catch (err) {
        console.log(`❌ Erro ao executar ${arquivo}: ${err.message}`);
        return false;
    }
}

async function main() {
    console.log('🚀 EXECUTANDO SCRIPTS DE IA AUTOMATICAMENTE');
    console.log('==========================================');
    
    const scripts = [
        {
            arquivo: 'APLICAR-TEMPLATE-TODAS-EMPRESAS-FINAL.sql',
            descricao: 'Aplicar Template com Horários'
        },
        {
            arquivo: 'INTEGRAR-HORARIOS-REAIS-LOJAS.sql',
            descricao: 'Integrar Horários Reais das Lojas'
        },
        {
            arquivo: 'CRIAR-TABELA-HISTORICO-PROMPTS.sql',
            descricao: 'Criar Tabela de Histórico'
        },
        {
            arquivo: 'CORRIGIR-ERRO-UPSERT-PROMPTS.sql',
            descricao: 'Corrigir Erro de Upsert'
        }
    ];
    
    let sucessos = 0;
    
    for (const script of scripts) {
        const sucesso = await executarScript(script.arquivo, script.descricao);
        if (sucesso) sucessos++;
        
        // Aguardar 2 segundos entre scripts
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.log('\n🎉 RESULTADO FINAL');
    console.log('==================');
    console.log(`✅ Scripts executados com sucesso: ${sucessos}/${scripts.length}`);
    
    if (sucessos === scripts.length) {
        console.log('🎯 TODOS OS SCRIPTS FORAM EXECUTADOS COM SUCESSO!');
        console.log('🚀 O sistema agora pode responder sobre horários de funcionamento!');
    } else {
        console.log('⚠️ Alguns scripts falharam. Verifique os erros acima.');
    }
}

// Verificar se as variáveis de ambiente estão configuradas
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.log('❌ ERRO: Configure as variáveis de ambiente:');
    console.log('SUPABASE_URL=sua-url-do-supabase');
    console.log('SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role');
    console.log('\n💡 Dica: Crie um arquivo .env com essas informações');
    process.exit(1);
}

main().catch(console.error);
