# 📊 Painel Financeiro — Guedes Shopping

Dashboard financeiro em tempo real com cotações da B3, índices mundiais, câmbio, commodities, criptomoedas e notícias corporativas.

---

## 🚀 Deploy Gratuito na Vercel (passo a passo)

### Opção A — Deploy pelo GitHub (recomendado)

1. **Crie uma conta gratuita** em [vercel.com](https://vercel.com) (pode usar login com Google)
2. **Crie um repositório** no [github.com](https://github.com):
   - Clique em "New repository"
   - Nome: `guedes-finance-dashboard`
   - Deixe como **Public** ou **Private** (ambos funcionam)
   - Clique em "Create repository"
3. **Faça upload dos arquivos** neste ZIP para o repositório:
   - Na página do repositório, clique em "uploading an existing file"
   - Arraste todos os arquivos e pastas deste ZIP
   - Clique em "Commit changes"
4. **Conecte à Vercel**:
   - No painel da Vercel, clique em "Add New Project"
   - Selecione o repositório `guedes-finance-dashboard`
   - Clique em "Deploy"
5. **Pronto!** Em ~2 minutos o dashboard estará online com URL gratuita (ex: `guedes-finance.vercel.app`)

### Opção B — Deploy pelo Vercel CLI

```bash
# Instalar o CLI da Vercel
npm install -g vercel

# Na pasta do projeto
cd guedes-finance-dashboard
vercel

# Seguir as instruções no terminal
```

---

## ⚙️ Configurações do Projeto

| Item | Valor |
|------|-------|
| Framework | Vite + React |
| Build Command | `vite build` |
| Output Directory | `dist` |
| Node.js Version | 18.x ou 20.x |

A Vercel detecta automaticamente o Vite — **não é necessário configurar nada manualmente**.

---

## 📡 Como funciona

O dashboard usa **Vercel Serverless Functions** (pasta `/api`) para buscar dados no servidor:

- `/api/quotes` → Busca cotações reais do Yahoo Finance (atualiza a cada 30s)
- `/api/feeds?handle=exame` → Busca notícias RSS das fontes financeiras (cache de 3 min)

Isso evita bloqueios de CORS que impediriam o browser de acessar esses sites diretamente.

---

## 📰 Fontes de dados

| Tipo | Fonte |
|------|-------|
| Cotações | Yahoo Finance (gratuito, sem chave de API) |
| Notícias | Exame, InfoMoney, Valor Econômico, Brazil Journal, Folha de S.Paulo |

---

## 🖥️ Uso no escritório

Para exibir em TV ou monitor grande:
1. Abra o dashboard no navegador
2. Pressione **F11** para tela cheia
3. O painel se atualiza automaticamente — não é necessário nenhuma interação

---

## 📁 Estrutura do projeto

```
├── api/
│   ├── quotes.ts       ← Serverless Function: cotações Yahoo Finance
│   └── feeds.ts        ← Serverless Function: feeds RSS de notícias
├── src/
│   ├── components/     ← Componentes de UI do dashboard
│   ├── hooks/          ← Hooks de dados (useFinancialData, useFeeds)
│   ├── pages/Home.tsx  ← Página principal do dashboard
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css       ← Tema Bloomberg Terminal
├── index.html
├── vite.config.ts
├── vercel.json         ← Configuração de rotas da Vercel
└── package.json
```

---

## 🆓 Limites do plano gratuito da Vercel

| Recurso | Limite gratuito |
|---------|----------------|
| Banda | 100 GB/mês |
| Serverless Functions | 100.000 invocações/mês |
| Domínio personalizado | ✅ Incluído |
| HTTPS | ✅ Automático |
| Tempo de atividade | ✅ 24/7 (sem hibernação) |

Para uso interno no escritório, esses limites são mais do que suficientes.
