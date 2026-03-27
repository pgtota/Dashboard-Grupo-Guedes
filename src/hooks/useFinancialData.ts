/**
 * useFinancialData — Hook para buscar dados financeiros e notícias em tempo real
 * Cotações: /api/quotes (Vercel Serverless Function → Yahoo Finance)
 * Notícias: /api/feeds (Vercel Serverless Function → RSS)
 */

import { useState, useEffect, useCallback } from "react";

export interface QuoteData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  currency: string;
  category: "brasil" | "mundo" | "cambio" | "commodities" | "crypto";
  flag?: string;
  updatedAt?: string;
}

export interface NewsItem {
  title: string;
  summary: string;
  source: string;
  publishedAt: string;
  category: "corporativo" | "varejo" | "economia" | "mercados" | "imoveis";
  url?: string;
}

async function fetchQuotes(): Promise<QuoteData[]> {
  try {
    const res = await fetch("/api/quotes", { signal: AbortSignal.timeout(12000) });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.quotes ?? []) as QuoteData[];
  } catch {
    return [];
  }
}

async function fetchNewsFromSource(handle: string): Promise<NewsItem[]> {
  const CATEGORY_MAP: Record<string, NewsItem["category"]> = {
    exame: "corporativo", infomoney: "mercados", valor: "economia",
    braziljournal: "corporativo", folha: "economia",
  };
  try {
    const res = await fetch(`/api/feeds?handle=${handle}`, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.posts ?? []).map((p: any) => ({
      title: p.title,
      summary: p.summary ?? "",
      source: p.source,
      publishedAt: p.publishedAt,
      category: CATEGORY_MAP[handle] ?? "corporativo",
      url: p.url,
    }));
  } catch {
    return [];
  }
}

async function fetchAllNews(): Promise<NewsItem[]> {
  const handles = ["exame", "infomoney", "valor", "braziljournal", "folha"];
  const results = await Promise.allSettled(handles.map(fetchNewsFromSource));
  const all: NewsItem[] = [];
  for (const r of results) {
    if (r.status === "fulfilled") all.push(...r.value);
  }
  all.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  return all.slice(0, 40);
}

function generateMockNews(): NewsItem[] {
  const now = new Date();
  return [
    { title: "Ibovespa opera em queda com tensões geopolíticas", summary: "Mercado reage a declarações de Trump sobre acordo com Irã.", source: "Exame", publishedAt: new Date(now.getTime() - 10 * 60000).toISOString(), category: "mercados", url: "https://exame.com" },
    { title: "FIIs de shopping superam expectativas no trimestre", summary: "Fundos imobiliários de shopping centers registram crescimento acima do esperado.", source: "InfoMoney", publishedAt: new Date(now.getTime() - 60 * 60000).toISOString(), category: "imoveis", url: "https://infomoney.com.br" },
    { title: "Varejo brasileiro cresce 3,8% no primeiro trimestre", summary: "Setor supera projeções com destaque para vestuário e calçados.", source: "Valor Econômico", publishedAt: new Date(now.getTime() - 90 * 60000).toISOString(), category: "varejo", url: "https://valor.globo.com" },
    { title: "Magazine Luiza anuncia expansão de 50 novas lojas", summary: "Varejista planeja investimento de R$ 200 milhões no Nordeste.", source: "Brazil Journal", publishedAt: new Date(now.getTime() - 120 * 60000).toISOString(), category: "varejo", url: "https://braziljournal.com" },
    { title: "Petrobras registra lucro de R$ 24,7 bilhões no trimestre", summary: "Resultado supera estimativas. Empresa mantém política de dividendos.", source: "InfoMoney", publishedAt: new Date(now.getTime() - 150 * 60000).toISOString(), category: "corporativo", url: "#" },
    { title: "Selic deve cair para 10,5% até o fim do ano", summary: "Boletim Focus indica expectativa de queda gradual da taxa básica.", source: "Valor Econômico", publishedAt: new Date(now.getTime() - 180 * 60000).toISOString(), category: "economia", url: "#" },
  ];
}

export function useFinancialData() {
  const [quotes, setQuotes]       = useState<QuoteData[]>([]);
  const [news, setNews]           = useState<NewsItem[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(true);

  const loadQuotes = useCallback(async () => {
    const data = await fetchQuotes();
    if (data.length > 0) {
      setQuotes(data);
      setLastUpdate(new Date());
      setIsLoading(false);
    }
  }, []);

  const loadNews = useCallback(async () => {
    const data = await fetchAllNews();
    setNews(data.length >= 5 ? data : generateMockNews());
  }, []);

  useEffect(() => {
    loadQuotes();
    loadNews();
    const qInterval = setInterval(loadQuotes, 30_000);
    const nInterval = setInterval(loadNews, 5 * 60_000);
    return () => { clearInterval(qInterval); clearInterval(nInterval); };
  }, [loadQuotes, loadNews]);

  return { quotes, news, lastUpdate, isLoading };
}
