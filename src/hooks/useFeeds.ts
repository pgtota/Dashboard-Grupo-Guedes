/**
 * useFeeds — Hook para buscar posts de feeds RSS via /api/feeds
 */

import { useState, useEffect, useCallback } from "react";

export interface FeedPost {
  title: string;
  summary: string;
  url: string;
  source: string;
  handle: string;
  avatar: string;
  color: string;
  publishedAt: string;
}

export interface FeedSource {
  handle: string;
  label: string;
  avatar: string;
  color: string;
}

export const DEFAULT_SOURCES: FeedSource[] = [
  { handle: "exame",         label: "Exame",           avatar: "EX", color: "#8b5cf6" },
  { handle: "infomoney",     label: "InfoMoney",        avatar: "IM", color: "#f59e0b" },
  { handle: "valor",         label: "Valor Econômico",  avatar: "VE", color: "#3b82f6" },
  { handle: "braziljournal", label: "Brazil Journal",   avatar: "BJ", color: "#10b981" },
  { handle: "folha",         label: "Folha Mercado",    avatar: "FS", color: "#ef4444" },
];

export function useFeedPosts(handle: string) {
  const [posts, setPosts]         = useState<FeedPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchedAt, setFetchedAt] = useState<Date | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/feeds?handle=${handle}`, { signal: AbortSignal.timeout(10000) });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.posts) && data.posts.length > 0) {
          setPosts(data.posts);
          setFetchedAt(new Date());
        }
      }
    } catch { /* noop */ }
    setIsLoading(false);
  }, [handle]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 3 * 60_000);
    return () => clearInterval(interval);
  }, [load]);

  return { posts, isLoading, fetchedAt, refetch: load };
}
