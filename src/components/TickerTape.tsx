/**
 * TickerTape — Faixa de cotações em movimento horizontal
 * Design: Bloomberg Terminal Dark Theme
 */

import { QuoteData } from "@/hooks/useFinancialData";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface TickerTapeProps {
  quotes: QuoteData[];
}

function formatPrice(price: number, currency: string): string {
  if (currency === "BRL") {
    if (price > 1000) return price.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    return price.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  if (price > 10000) return price.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  if (price > 100) return price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return price.toLocaleString("en-US", { minimumFractionDigits: 4, maximumFractionDigits: 4 });
}

function TickerItem({ quote }: { quote: QuoteData }) {
  const isUp = quote.changePercent > 0;
  const isDown = quote.changePercent < 0;

  return (
    <div className="flex items-center gap-2 px-4 border-r border-white/10 shrink-0">
      <span className="text-white/40 text-xs">{quote.flag}</span>
      <span className="font-mono text-xs font-semibold text-white/80 tracking-wide">{quote.name}</span>
      <span className={`font-mono text-xs font-bold ${isUp ? "text-emerald-400" : isDown ? "text-red-400" : "text-amber-400"}`}>
        {formatPrice(quote.price, quote.currency)}
      </span>
      <span className={`flex items-center gap-0.5 font-mono text-xs ${isUp ? "text-emerald-400" : isDown ? "text-red-400" : "text-amber-400"}`}>
        {isUp ? <TrendingUp size={10} /> : isDown ? <TrendingDown size={10} /> : <Minus size={10} />}
        {isUp ? "+" : ""}{quote.changePercent.toFixed(2)}%
      </span>
    </div>
  );
}

export function TickerTape({ quotes }: TickerTapeProps) {
  if (quotes.length === 0) return null;

  // Duplicar para loop contínuo
  const doubled = [...quotes, ...quotes];

  return (
    <div className="overflow-hidden bg-[#0a0f14] border-b border-white/10 h-8 flex items-center">
      <div className="ticker-scroll flex items-center h-full">
        {doubled.map((quote, i) => (
          <TickerItem key={`${quote.symbol}-${i}`} quote={quote} />
        ))}
      </div>
    </div>
  );
}
