/**
 * NewsPanel — Painel de notícias com scroll automático
 * Design: Bloomberg Terminal Dark Theme
 */

import { NewsItem } from "@/hooks/useFinancialData";
import { Clock, ExternalLink, Building2 } from "lucide-react";

interface NewsPanelProps {
  news: NewsItem[];
}

const CATEGORY_COLORS: Record<NewsItem["category"], string> = {
  corporativo: "text-blue-400 bg-blue-400/10 border-blue-400/30",
  varejo: "text-amber-400 bg-amber-400/10 border-amber-400/30",
  economia: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30",
  mercados: "text-purple-400 bg-purple-400/10 border-purple-400/30",
  imoveis: "text-cyan-400 bg-cyan-400/10 border-cyan-400/30",
};

const CATEGORY_LABELS: Record<NewsItem["category"], string> = {
  corporativo: "CORPORATIVO",
  varejo: "VAREJO",
  economia: "ECONOMIA",
  mercados: "MERCADOS",
  imoveis: "IMÓVEIS",
};

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "agora";
  if (diffMin < 60) return `${diffMin}min atrás`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h atrás`;
  return `${Math.floor(diffH / 24)}d atrás`;
}

function NewsCard({ item }: { item: NewsItem }) {
  const catClass = CATEGORY_COLORS[item.category];
  const hasRealUrl = item.url && item.url !== "#";
  const Wrapper = hasRealUrl ? "a" : "div";
  const wrapperProps = hasRealUrl
    ? { href: item.url, target: "_blank", rel: "noopener noreferrer" }
    : {};

  return (
    <Wrapper
      {...(wrapperProps as any)}
      className="border-b border-white/5 pb-3 mb-3 last:border-0 last:mb-0 group cursor-pointer hover:bg-white/2 rounded px-1 transition-colors block"
    >
      <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
        <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${catClass}`}>
          {CATEGORY_LABELS[item.category]}
        </span>
        <span className="text-white/30 text-[10px] font-mono flex items-center gap-1">
          <Clock size={9} />
          {timeAgo(item.publishedAt)}
        </span>
        <span className="text-white/25 text-[10px] font-mono ml-auto flex items-center gap-1">
          {item.source}
          {hasRealUrl && <ExternalLink size={8} className="opacity-50 group-hover:opacity-100 transition-opacity" />}
        </span>
      </div>
      <p className="text-white/85 text-xs font-semibold leading-snug mb-1 group-hover:text-white transition-colors">
        {item.title}
      </p>
      <p className="text-white/40 text-[11px] font-body leading-relaxed line-clamp-2">
        {item.summary}
      </p>
    </Wrapper>
  );
}

export function NewsPanel({ news }: NewsPanelProps) {
  if (news.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-white/30 text-sm font-body">
        Carregando notícias...
      </div>
    );
  }

  // Duplicar para scroll contínuo
  const doubled = [...news, ...news];

  return (
    <div className="h-full overflow-hidden relative">
      <div className="news-scroll">
        {doubled.map((item, i) => (
          <NewsCard key={`${item.title}-${i}`} item={item} />
        ))}
      </div>
      {/* Fade gradient at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#0d1117] to-transparent pointer-events-none" />
    </div>
  );
}
