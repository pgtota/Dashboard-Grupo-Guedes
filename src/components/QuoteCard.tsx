/**
 * QuoteCard — Card de cotação individual com mini-sparkline e horário de atualização
 * Design: Bloomberg Terminal Dark Theme
 */

import { QuoteData } from "@/hooks/useFinancialData";
import { TrendingUp, TrendingDown, Minus, Clock } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AreaChart, Area, ResponsiveContainer } from "recharts";

interface QuoteCardProps {
  quote: QuoteData;
  size?: "sm" | "md" | "lg";
}

function formatPrice(price: number, currency: string): string {
  if (price > 10000) return price.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  if (price > 1000)  return price.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (price > 10)    return price.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return price.toLocaleString("pt-BR", { minimumFractionDigits: 4, maximumFractionDigits: 4 });
}

function getCurrencySymbol(currency: string): string {
  const map: Record<string, string> = {
    BRL: "R$", USD: "US$", EUR: "€", GBP: "£", JPY: "¥",
  };
  return map[currency] ?? currency;
}

export function QuoteCard({ quote }: QuoteCardProps) {
  const isUp   = quote.changePercent > 0;
  const isDown = quote.changePercent < 0;
  const color      = isUp ? "#34d399" : isDown ? "#f87171" : "#fbbf24";
  const colorClass = isUp ? "text-emerald-400" : isDown ? "text-red-400" : "text-amber-400";
  const bgClass    = isUp ? "bg-emerald-400/5"  : isDown ? "bg-red-400/5"  : "bg-amber-400/5";
  const borderClass= isUp ? "border-emerald-400/20" : isDown ? "border-red-400/20" : "border-amber-400/20";

  // Sparkline history
  const [history, setHistory] = useState<{ v: number }[]>(() => {
    const base = quote.price;
    return Array.from({ length: 20 }, (_, i) => ({
      v: base * (1 + Math.sin(i * 0.5) * 0.01 + (Math.random() - 0.5) * 0.005),
    }));
  });

  useEffect(() => {
    setHistory(prev => [...prev.slice(1), { v: quote.price }]);
  }, [quote.price]);

  // Flash animation on price change
  const prevPrice = useRef<number>(quote.price);
  const [flashClass, setFlashClass] = useState("");
  useEffect(() => {
    if (prevPrice.current !== quote.price) {
      const cls = quote.price > prevPrice.current ? "flash-up" : "flash-down";
      setFlashClass(cls);
      const t = setTimeout(() => setFlashClass(""), 600);
      prevPrice.current = quote.price;
      return () => clearTimeout(t);
    }
  }, [quote.price]);

  // Horário da última atualização
  const updatedAtStr = quote.updatedAt
    ? new Date(quote.updatedAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <div className={`relative rounded border ${borderClass} ${bgClass} px-2.5 py-2 flex flex-col gap-1 overflow-hidden transition-all duration-300 ${flashClass}`}>
      {/* Linha 1: nome + variação % */}
      <div className="flex items-center justify-between gap-1 min-w-0">
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <span className="text-sm leading-none shrink-0">{quote.flag}</span>
          <span className="text-[11px] font-semibold text-white/65 uppercase tracking-wide font-body truncate">
            {quote.name}
          </span>
        </div>
        <span className={`flex items-center gap-0.5 text-[11px] font-mono font-bold shrink-0 ${colorClass}`}>
          {isUp ? <TrendingUp size={10} /> : isDown ? <TrendingDown size={10} /> : <Minus size={10} />}
          {isUp ? "+" : ""}{quote.changePercent.toFixed(2)}%
        </span>
      </div>

      {/* Linha 2: preço + sparkline */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-baseline gap-1 min-w-0">
          <span className="text-[10px] text-white/30 font-mono shrink-0">
            {getCurrencySymbol(quote.currency)}
          </span>
          <span className={`font-mono font-bold text-base leading-none ${colorClass} truncate`}>
            {formatPrice(quote.price, quote.currency)}
          </span>
        </div>
        {/* Mini sparkline */}
        <div className="w-16 h-7 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id={`grad-${quote.symbol.replace(/[^a-zA-Z0-9]/g, "_")}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="v"
                stroke={color}
                strokeWidth={1.5}
                fill={`url(#grad-${quote.symbol.replace(/[^a-zA-Z0-9]/g, "_")})`}
                dot={false}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Linha 3: variação absoluta + timestamp */}
      <div className="flex items-center justify-between gap-1">
        <span className={`text-[10px] font-mono ${colorClass} opacity-65`}>
          {isUp ? "+" : ""}{Math.abs(quote.change) > 0.01 ? quote.change.toFixed(2) : quote.change.toFixed(4)}
        </span>
        {updatedAtStr && (
          <span className="flex items-center gap-0.5 text-white/20 text-[9px] font-mono">
            <Clock size={8} />
            {updatedAtStr}
          </span>
        )}
      </div>
    </div>
  );
}
