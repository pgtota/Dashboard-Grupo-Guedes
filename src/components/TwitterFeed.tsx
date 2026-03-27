/**
 * TwitterFeed — Coluna de notícias financeiras com visual de timeline do X
 * Usa /api/feeds (Vercel Serverless Function) para evitar CORS.
 */

import { useState, useEffect } from "react";
import { Twitter, RefreshCw, ExternalLink, Clock } from "lucide-react";
import { useFeedPosts, DEFAULT_SOURCES } from "@/hooks/useFeeds";

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60)    return `${diff}s`;
  if (diff < 3600)  return `${Math.floor(diff / 60)}min`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

function XPostCard({ post }: { post: { title: string; summary: string; url: string; source: string; handle: string; avatar: string; color: string; publishedAt: string } }) {
  return (
    <a href={post.url} target="_blank" rel="noopener noreferrer"
      className="block rounded border border-white/8 bg-white/2 p-2.5 hover:bg-white/5 hover:border-white/15 transition-all duration-200 group"
    >
      <div className="flex items-start gap-2 mb-1.5">
        <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-mono font-bold shrink-0 text-white leading-none"
          style={{ background: post.color }}>
          {post.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-white/80 text-[11px] font-bold font-body leading-none">{post.source}</span>
            <span className="text-white/30 text-[9px] font-mono">@{post.handle}</span>
          </div>
          <div className="flex items-center gap-0.5 text-white/25 text-[9px] font-mono mt-0.5">
            <Clock size={7} /><span>{timeAgo(post.publishedAt)}</span>
          </div>
        </div>
        <ExternalLink size={9} className="text-white/15 group-hover:text-white/40 transition-colors shrink-0 mt-0.5" />
      </div>
      <p className="text-white/75 text-[11px] font-body leading-relaxed line-clamp-2 mb-1">{post.title}</p>
      {post.summary && post.summary !== post.title && (
        <p className="text-white/35 text-[10px] font-body leading-relaxed line-clamp-2">{post.summary}</p>
      )}
    </a>
  );
}

function SourceFeed({ handle, color }: { handle: string; color: string }) {
  const { posts, isLoading, fetchedAt, refetch } = useFeedPosts(handle);
  const lastFetchStr = fetchedAt
    ? fetchedAt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <div className="flex flex-col gap-2 flex-1 min-h-0">
      <div className="flex items-center justify-between shrink-0">
        <span className="text-white/20 text-[9px] font-mono">{posts.length > 0 ? `${posts.length} notícias` : "Carregando..."}</span>
        <div className="flex items-center gap-1.5">
          {lastFetchStr && <span className="text-white/20 text-[9px] font-mono">{lastFetchStr}</span>}
          <button onClick={refetch} className="text-white/20 hover:text-white/50 transition-colors" title="Atualizar">
            <RefreshCw size={9} className={isLoading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-1.5 overflow-y-auto flex-1 min-h-0 pr-0.5">
        {isLoading && posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-8">
            <RefreshCw size={14} className="animate-spin" style={{ color }} />
            <span className="text-white/20 text-[10px] font-mono">Buscando notícias...</span>
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-8">
            <Twitter size={18} className="text-white/10" />
            <span className="text-white/20 text-[10px] font-mono">Sem posts disponíveis</span>
            <button onClick={refetch} className="text-[9px] font-mono hover:opacity-80 mt-1" style={{ color }}>Tentar novamente</button>
          </div>
        ) : (
          posts.map((post, i) => <XPostCard key={i} post={post} />)
        )}
      </div>
    </div>
  );
}

export function TwitterFeed() {
  const [activeIdx, setActiveIdx] = useState(0);
  const sources = DEFAULT_SOURCES;
  const active = sources[activeIdx];

  useEffect(() => {
    const rotation = setInterval(() => setActiveIdx(prev => (prev + 1) % sources.length), 2 * 60 * 1000);
    return () => clearInterval(rotation);
  }, [sources.length]);

  return (
    <div className="h-full flex flex-col gap-2 min-h-0">
      <div className="flex items-center gap-2 shrink-0">
        <div className="w-0.5 h-3.5 bg-sky-400/70 rounded-full" />
        <Twitter size={10} className="text-sky-400" />
        <span className="text-white/50 text-[10px] font-mono font-bold tracking-[0.18em] uppercase">X · Notícias</span>
      </div>
      <div className="flex flex-wrap gap-1 shrink-0">
        {sources.map((src, i) => (
          <button key={src.handle} onClick={() => setActiveIdx(i)}
            className="text-[9px] font-mono px-1.5 py-0.5 rounded border transition-all"
            style={i === activeIdx
              ? { borderColor: `${src.color}60`, color: src.color, background: `${src.color}15` }
              : { borderColor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.3)" }}>
            {src.avatar}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <div className="w-1.5 h-1.5 rounded-full" style={{ background: active.color }} />
        <span className="text-white/50 text-[10px] font-body">{active.label}</span>
      </div>
      <SourceFeed key={active.handle} handle={active.handle} color={active.color} />
      <div className="flex items-center justify-center gap-1.5 shrink-0 pt-0.5">
        {sources.map((_, i) => (
          <button key={i} onClick={() => setActiveIdx(i)}
            className="w-1.5 h-1.5 rounded-full transition-all"
            style={i === activeIdx ? { background: active.color } : { background: "rgba(255,255,255,0.12)" }} />
        ))}
      </div>
      <p className="text-center text-white/15 text-[9px] font-mono shrink-0">Rotação automática · atualiza a cada 3 min</p>
    </div>
  );
}
