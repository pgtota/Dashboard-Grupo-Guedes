/**
 * /api/quotes — Vercel Serverless Function
 * Busca cotações reais do Yahoo Finance e retorna JSON.
 * Usa a API pública do Yahoo Finance (sem chave necessária).
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";

const SYMBOLS = [
  "^BVSP","PETR4.SA","VALE3.SA","ITUB4.SA","BBDC4.SA",
  "MGLU3.SA","LREN3.SA","AMER3.SA","VIIA3.SA","PCAR3.SA","SOMA3.SA","ALPA4.SA","AMAR3.SA",
  "^GSPC","^DJI","^IXIC","^FTSE","^GDAXI","^N225",
  "USDBRL=X","EURBRL=X","GBPBRL=X",
  "GC=F","CL=F","SI=F",
  "BTC-USD","ETH-USD",
];

const SYMBOL_META: Record<string, { name: string; category: string; flag: string; currency: string }> = {
  "^BVSP":    { name: "Ibovespa",       category: "brasil",      flag: "🇧🇷", currency: "BRL" },
  "PETR4.SA": { name: "Petrobras",      category: "brasil",      flag: "🇧🇷", currency: "BRL" },
  "VALE3.SA": { name: "Vale",           category: "brasil",      flag: "🇧🇷", currency: "BRL" },
  "ITUB4.SA": { name: "Itaú Unibanco",  category: "brasil",      flag: "🇧🇷", currency: "BRL" },
  "BBDC4.SA": { name: "Bradesco",       category: "brasil",      flag: "🇧🇷", currency: "BRL" },
  "MGLU3.SA": { name: "Magazine Luiza", category: "brasil",      flag: "🇧🇷", currency: "BRL" },
  "LREN3.SA": { name: "Lojas Renner",   category: "brasil",      flag: "🇧🇷", currency: "BRL" },
  "AMER3.SA": { name: "Americanas",     category: "brasil",      flag: "🇧🇷", currency: "BRL" },
  "VIIA3.SA": { name: "Casas Bahia",    category: "brasil",      flag: "🇧🇷", currency: "BRL" },
  "PCAR3.SA": { name: "Pão de Açúcar",  category: "brasil",      flag: "🇧🇷", currency: "BRL" },
  "SOMA3.SA": { name: "Grupo Soma",     category: "brasil",      flag: "🇧🇷", currency: "BRL" },
  "ALPA4.SA": { name: "Alpargatas",     category: "brasil",      flag: "🇧🇷", currency: "BRL" },
  "AMAR3.SA": { name: "Marisa",         category: "brasil",      flag: "🇧🇷", currency: "BRL" },
  "^GSPC":    { name: "S&P 500",        category: "mundo",       flag: "🇺🇸", currency: "USD" },
  "^DJI":     { name: "Dow Jones",      category: "mundo",       flag: "🇺🇸", currency: "USD" },
  "^IXIC":    { name: "Nasdaq",         category: "mundo",       flag: "🇺🇸", currency: "USD" },
  "^FTSE":    { name: "FTSE 100",       category: "mundo",       flag: "🇬🇧", currency: "GBP" },
  "^GDAXI":   { name: "DAX",            category: "mundo",       flag: "🇩🇪", currency: "EUR" },
  "^N225":    { name: "Nikkei 225",     category: "mundo",       flag: "🇯🇵", currency: "JPY" },
  "USDBRL=X": { name: "USD/BRL",        category: "cambio",      flag: "💵", currency: "BRL" },
  "EURBRL=X": { name: "EUR/BRL",        category: "cambio",      flag: "💶", currency: "BRL" },
  "GBPBRL=X": { name: "GBP/BRL",        category: "cambio",      flag: "💷", currency: "BRL" },
  "GC=F":     { name: "Ouro",           category: "commodities", flag: "🥇", currency: "USD" },
  "CL=F":     { name: "Petróleo WTI",   category: "commodities", flag: "🛢️", currency: "USD" },
  "SI=F":     { name: "Prata",          category: "commodities", flag: "🥈", currency: "USD" },
  "BTC-USD":  { name: "Bitcoin",        category: "crypto",      flag: "₿",  currency: "USD" },
  "ETH-USD":  { name: "Ethereum",       category: "crypto",      flag: "Ξ",  currency: "USD" },
};

async function fetchQuote(symbol: string) {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; FinanceDashboard/1.0)",
        "Accept": "application/json",
      },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const data = await res.json() as any;
    if (!data?.chart?.result?.[0]) return null;

    const meta = data.chart.result[0].meta;
    const price: number = meta.regularMarketPrice ?? 0;
    const prev: number = meta.chartPreviousClose ?? meta.previousClose ?? price;
    const change = price - prev;
    const changePercent = prev !== 0 ? (change / prev) * 100 : 0;
    const marketTime: number | undefined = meta.regularMarketTime;
    const updatedAt = marketTime ? new Date(marketTime * 1000).toISOString() : new Date().toISOString();
    const info = SYMBOL_META[symbol] ?? { name: symbol, category: "brasil", flag: "", currency: "BRL" };

    return { symbol, name: info.name, price, change, changePercent, currency: info.currency, category: info.category, flag: info.flag, updatedAt };
  } catch {
    return null;
  }
}

// Cache em memória (persiste entre invocações quentes da Serverless Function)
let cachedQuotes: any[] = [];
let lastFetchTime = 0;
const CACHE_TTL = 30_000;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS para o frontend
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");
  res.setHeader("Cache-Control", "s-maxage=30, stale-while-revalidate=60");

  const now = Date.now();
  if (cachedQuotes.length > 0 && now - lastFetchTime < CACHE_TTL) {
    return res.json({ quotes: cachedQuotes, updatedAt: new Date().toISOString() });
  }

  const BATCH_SIZE = 6;
  const results: any[] = [];
  for (let i = 0; i < SYMBOLS.length; i += BATCH_SIZE) {
    const batch = SYMBOLS.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.allSettled(batch.map(fetchQuote));
    for (const r of batchResults) {
      if (r.status === "fulfilled" && r.value) results.push(r.value);
    }
  }

  if (results.length > 0) {
    cachedQuotes = results;
    lastFetchTime = now;
  }

  return res.json({ quotes: cachedQuotes, updatedAt: new Date().toISOString() });
}
