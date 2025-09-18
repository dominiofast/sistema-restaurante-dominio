# ✅ Checklist: Vercel + Neon PostgreSQL

## 🎯 Seu projeto já está no Vercel, agora vamos garantir que está conectado ao Neon!

### 📋 O que você precisa configurar no painel do Vercel:

## 1. 🔑 Variáveis de Ambiente no Vercel

Acesse seu projeto no painel do Vercel:
- Vá em **Settings** → **Environment Variables**
- Adicione estas variáveis:

```env
DATABASE_URL=postgresql://neondb_owner:npg_zgJibF05ZSqC@ep-solitary-mud-acn84ca4-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

NODE_ENV=production

VITE_ENVIRONMENT=production
```

## 2. 🔧 Build Configuration

No Vercel, certifique-se de que está configurado:
- **Framework Preset:** Vite
- **Build Command:** `npm run build`  
- **Output Directory:** `dist`
- **Install Command:** `npm install`

## 3. 🎛️ Functions Configuration

Se você está usando as APIs em `/api/`, certifique-se de que:
- As funções Node.js estão habilitadas
- Runtime: **Node.js 18.x**

## 4. ✅ Testes Rápidos

### Teste 1: Verificar Build
```bash
npm run build
```

### Teste 2: Verificar se o servidor funciona local
```bash
npm start
```

### Teste 3: Testar conexão com Neon
```bash
node -e "
const { Pool } = require('@neondatabase/serverless');
const pool = new Pool({connectionString: process.env.DATABASE_URL});
pool.query('SELECT NOW()').then(r => console.log('✅ Neon conectado:', r.rows[0])).catch(console.error);
"
```

## 🚀 Deploy Automático

Com isso configurado, todo push para a branch `main` vai:
1. ✅ Fazer build da aplicação
2. ✅ Usar as variáveis do Neon configuradas
3. ✅ Deploy automático no Vercel
4. ✅ Aplicação funcionando com banco Neon

## 🔍 Como Verificar se está Funcionando

1. **No Vercel Dashboard:**
   - Vá em **Functions** → **Edge Functions** 
   - Veja se não há erros de conexão

2. **No seu site publicado:**
   - Teste login com: `contato@dominio.tech` / `123456`
   - Veja se carrega dados do banco

3. **Logs do Vercel:**
   - Verifique se não há erros de DATABASE_URL

## 💡 Dicas Importantes

- **SSL obrigatório:** O Neon exige `sslmode=require` (já configurado)
- **Pool de conexões:** O `@neondatabase/serverless` é otimizado para serverless
- **Variáveis de ambiente:** Sempre configure no painel do Vercel, nunca hardcode

## 🎯 Resultado Esperado

Com essa configuração, você terá:
- ✅ Frontend no Vercel
- ✅ APIs Node.js no Vercel Functions  
- ✅ Banco PostgreSQL no Neon
- ✅ Deploy automático a cada push
- ✅ Escalabilidade automática

---

## ❓ Precisa de Ajuda?

Se algo não estiver funcionando:
1. Verifique as variáveis de ambiente no painel Vercel
2. Olhe os logs de build e runtime no Vercel  
3. Teste a conexão localmente primeiro

**Seu sistema está pronto para produção!** 🚀
