/**
 * /api/feeds — Vercel Serverless Function
 * Busca e parseia feeds RSS das fontes financeiras no servidor.
 * Resolve CORS: o browser não pode chamar sites externos diretamente.
 * Uso: GET /api/feeds?handle=exame
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";

const FEED_SOURCES = [
  { handle: "exame",         label: "Exame",           avatar: "EX", color: "#8b5cf6", url: "https://exame.com/feed/" },
  { handle: "infomoney",     label: "InfoMoney",        avatar: "IM", color: "#f59e0b", url: "https://www.infomoney.com.br/feed/" },
  { handle: "valor",         label: "Valor Econômico",  avatar: "VE", color: "#3b82f6", url: "https://valor.globo.com/rss/ultimas-noticias/index.xml" },
  { handle: "braziljournal", label: "Brazil Journal",   avatar: "BJ", color: "#10b981", url: "https://braziljournal.com/feed" },
  { handle: "folha",         label: "Folha Mercado",    avatar: "FS", color: "#ef4444", url: "https://feeds.folha.uol.com.br/mercado/rss091.xml" },
];

interface FeedPost {
  title: string; summary: string; url: string;
  source: string; handle: string; avatar: string; color: string; publishedAt: string;
}

function parseRSS(xml: string, source: typeof FEED_SOURCES[0]): FeedPost[] {
  const posts: FeedPost[] = [];
  const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi;
  let m: RegExpExecArray | null;
  while ((m = itemRegex.exec(xml)) !== null && posts.length < 6) {
    const item = m[1];
    const titleM = item.match(/<title[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i);
    const title = (titleM?.[1] ?? "").replace(/<[^>]+>/g, "").trim();
    if (!title || title.length < 5) continue;
    const linkM = item.match(/<link[^>]*>(?:<!\[CDATA\[)?(https?:\/\/[^\s<\]]+)(?:\]\]>)?<\/link>/i)
      ?? item.match(/<guid[^>]*>(?:<!\[CDATA\[)?(https?:\/\/[^\s<\]]+)(?:\]\]>)?<\/guid>/i);
    const url = (linkM?.[1] ?? "").trim();
    const descM = item.match(/<description[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/i);
    const summary = (descM?.[1] ?? "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim().slice(0, 200);
    const dateM = item.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i);
    let publishedAt = new Date().toISOString();
    try { const d = new Date(dateM?.[1]?.trim() ?? ""); if (!isNaN(d.getTime())) publishedAt = d.toISOString(); } catch { /* noop */ }
    posts.push({ title, summary: summary !== title ? summary : "", url: url || source.url, source: source.label, handle: source.handle, avatar: source.avatar, color: source.color, publishedAt });
  }
  return posts;
}

// Cache em memória (persiste entre invocações quentes)
const feedCache = new Map<string, { posts: FeedPost[]; fetchedAt: number }>();
const CACHE_TTL = 3 * 60 * 1000;

async function fetchFeed(source: typeof FEED_SOURCES[0]): Promise<FeedPost[]> {
  const cached = feedCache.get(source.handle);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL) return cached.posts;
  try {
    const res = await fetch(source.url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; FinanceDashboard/1.0)", "Accept": "application/rss+xml, text/xml, */*" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return cached?.posts ?? [];
    const xml = await res.text();
    const posts = parseRSS(xml, source);
    if (posts.length > 0) feedCache.set(source.handle, { posts, fetchedAt: Date.now() });
    return posts.length > 0 ? posts : (cached?.posts ?? []);
  } catch {
    return cached?.posts ?? [];
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");
  res.setHeader("Cache-Control", "s-maxage=180, stale-while-revalidate=300");

  const { handle } = req.query;

  // Listar fontes disponíveis
  if (!handle || handle === "sources") {
    return res.json({ sources: FEED_SOURCES.map(s => ({ handle: s.handle, label: s.label, avatar: s.avatar, color: s.color })) });
  }

  const source = FEED_SOURCES.find(s => s.handle === String(handle));
  if (!source) return res.status(404).json({ error: "Fonte não encontrada" });

  const posts = await fetchFeed(source);
  return res.json({ posts, fetchedAt: new Date().toISOString() });
}
