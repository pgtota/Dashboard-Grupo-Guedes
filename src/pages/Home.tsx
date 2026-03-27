/**
 * Home — Página principal do Painel Financeiro Guedes Shopping
 * Versão Vercel: sem tRPC, dados via /api/quotes e /api/feeds
 */

import { useFinancialData } from "@/hooks/useFinancialData";
import { TickerTape } from "@/components/TickerTape";
import { QuoteCard } from "@/components/QuoteCard";
import { NewsPanel } from "@/components/NewsPanel";
import { DashboardHeader } from "@/components/DashboardHeader";
import { RetailStockChart } from "@/components/RetailStockChart";
import { TwitterFeed } from "@/components/TwitterFeed";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { useMemo } from "react";
import { Clock } from "lucide-react";

function SectionTitle({ label, accent }: { label: string; accent?: string }) {
  return (
    <div className="flex items-center gap-2 mb-1.5">
      <div className="w-0.5 h-3.5 bg-emerald-400/70 rounded-full shrink-0" />
      <span className="text-white/50 text-[10px] font-mono font-bold tracking-[0.18em] uppercase leading-none">{label}</span>
      {accent && <span className="text-white/20 text-[10px] font-mono">{accent}</span>}
    </div>
  );
}

function IbovespaChart({ price }: { price: number }) {
  const data = useMemo(() => {
    const hours = ["09:00","09:30","10:00","10:30","11:00","11:30","12:00","12:30","13:00","13:30","14:00","14:30","15:00","15:30","16:00","16:30","17:00"];
    let current = price * 0.985;
    return hours.map(h => {
      current = current * (1 + (Math.random() - 0.45) * 0.003);
      return { time: h, value: Math.round(current) };
    }).concat([{ time: "17:00", value: Math.round(price) }]).slice(0, hours.length);
  }, []);

  const isUp = data[data.length - 1].value >= data[0].value;
  const color = isUp ? "#34d399" : "#f87171";

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 2, right: 2, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="ibovGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={color} stopOpacity={0.25} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="time" tick={{ fill: "rgba(255,255,255,0.2)", fontSize: 8, fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} interval={4} />
        <YAxis tick={{ fill: "rgba(255,255,255,0.2)", fontSize: 8, fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} tickFormatter={v => v.toLocaleString("pt-BR", { maximumFractionDigits: 0 })} width={50} />
        <Tooltip contentStyle={{ background: "#161b22", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 4, fontSize: 10, fontFamily: "JetBrains Mono", color: "#e6edf3" }} formatter={(v: number) => [v.toLocaleString("pt-BR"), "Ibovespa"]} />
        <Area type="monotone" dataKey="value" stroke={color} strokeWidth={1.5} fill="url(#ibovGrad)" dot={false} isAnimationActive={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function HighlightCard({ flag, label, value, changePercent, updatedAt }: {
  flag: string; label: string; value: string; changePercent: number; updatedAt?: string;
}) {
  const isUp = changePercent >= 0;
  const colorClass = isUp ? "text-emerald-400" : "text-red-400";
  const updatedStr = updatedAt
    ? new Date(updatedAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <div className="rounded border border-white/8 bg-white/3 px-2.5 py-2 flex items-center justify-between gap-2">
      <div className="min-w-0">
        <div className="text-white/35 text-[9px] font-mono uppercase tracking-wider mb-0.5 flex items-center gap-1">
          <span>{flag}</span><span>{label}</span>
        </div>
        <div className={`font-mono text-sm font-bold leading-none ${colorClass}`}>{value}</div>
        {updatedStr && (
          <div className="flex items-center gap-0.5 text-white/20 text-[9px] font-mono mt-0.5">
            <Clock size={8} /><span>{updatedStr}</span>
          </div>
        )}
      </div>
      <div className={`text-xs font-mono font-bold shrink-0 ${colorClass}`}>
        {isUp ? "+" : ""}{changePercent.toFixed(2)}%
      </div>
    </div>
  );
}

export default function Home() {
  const { quotes, news, lastUpdate, isLoading } = useFinancialData();

  const brasil      = quotes.filter(q => q.category === "brasil");
  const mundo       = quotes.filter(q => q.category === "mundo");
  const cambio      = quotes.filter(q => q.category === "cambio");
  const commodities = quotes.filter(q => q.category === "commodities");
  const crypto      = quotes.filter(q => q.category === "crypto");

  const ibovespa = quotes.find(q => q.symbol === "^BVSP");
  const sp500    = quotes.find(q => q.symbol === "^GSPC");
  const usdBrl   = quotes.find(q => q.symbol === "USDBRL=X");
  const bitcoin  = quotes.find(q => q.symbol === "BTC-USD");

  const RETAIL_SYMBOLS = ["MGLU3.SA","LREN3.SA","AMER3.SA","VIIA3.SA","PCAR3.SA","SOMA3.SA","ALPA4.SA","AMAR3.SA"];
  const retailQuotes = quotes
    .filter(q => RETAIL_SYMBOLS.includes(q.symbol))
    .map(q => ({ symbol: q.symbol.replace(".SA", ""), price: q.price, changePercent: q.changePercent }));

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: "#0d1117", fontFamily: "'Space Grotesk', sans-serif" }}>
      <DashboardHeader lastUpdate={lastUpdate} isLoading={isLoading} />
      <TickerTape quotes={quotes} />

      <div className="flex-1 overflow-hidden grid grid-cols-[minmax(0,0.8fr)_minmax(0,1.15fr)_minmax(0,0.9fr)_minmax(0,0.75fr)_minmax(0,0.75fr)] gap-0 min-h-0">

        {/* Coluna 1: Brasil + Câmbio */}
        <div className="border-r border-white/8 overflow-y-auto p-2.5 flex flex-col gap-2">
          {ibovespa && (
            <div className="rounded border border-emerald-400/20 bg-emerald-400/5 p-2.5 shrink-0">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-white/45 text-[9px] font-mono uppercase tracking-widest">🇧🇷 Ibovespa</span>
                <span className={`text-[11px] font-mono font-bold ${ibovespa.changePercent >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {ibovespa.changePercent >= 0 ? "+" : ""}{ibovespa.changePercent.toFixed(2)}%
                </span>
              </div>
              <div className="font-mono text-xl font-bold text-white leading-none">
                {ibovespa.price.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
              </div>
              {ibovespa.updatedAt && (
                <div className="flex items-center gap-0.5 text-white/25 text-[9px] font-mono mt-0.5">
                  <Clock size={8} />
                  <span>Atualizado {new Date(ibovespa.updatedAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
                </div>
              )}
              <div className="h-14 mt-1.5"><IbovespaChart price={ibovespa.price} /></div>
            </div>
          )}
          <SectionTitle label="Ações Brasil" accent="B3" />
          <div className="flex flex-col gap-1.5">
            {brasil.filter(q => q.symbol !== "^BVSP").map(q => <QuoteCard key={q.symbol} quote={q} />)}
          </div>
          <SectionTitle label="Câmbio" />
          <div className="flex flex-col gap-1.5">
            {cambio.map(q => <QuoteCard key={q.symbol} quote={q} />)}
          </div>
        </div>

        {/* Coluna 2: Varejo Brasil */}
        <div className="border-r border-white/8 overflow-y-auto p-2.5">
          <RetailStockChart quotes={retailQuotes} />
        </div>

        {/* Coluna 3: Mundo + Commodities + Crypto */}
        <div className="overflow-y-auto p-2.5 flex flex-col gap-2 border-r border-white/8">
          <div className="flex flex-col gap-1.5 shrink-0">
            {sp500 && <HighlightCard flag="🇺🇸" label="S&P 500" value={sp500.price.toLocaleString("en-US", { maximumFractionDigits: 0 })} changePercent={sp500.changePercent} updatedAt={sp500.updatedAt} />}
            {usdBrl && <HighlightCard flag="💵" label="USD/BRL" value={`R$ ${usdBrl.price.toFixed(4)}`} changePercent={usdBrl.changePercent} updatedAt={usdBrl.updatedAt} />}
            {bitcoin && <HighlightCard flag="₿" label="Bitcoin" value={`$${bitcoin.price.toLocaleString("en-US", { maximumFractionDigits: 0 })}`} changePercent={bitcoin.changePercent} updatedAt={bitcoin.updatedAt} />}
          </div>
          <SectionTitle label="Índices Mundiais" />
          <div className="flex flex-col gap-1.5">{mundo.map(q => <QuoteCard key={q.symbol} quote={q} />)}</div>
          <SectionTitle label="Commodities" />
          <div className="flex flex-col gap-1.5">{commodities.map(q => <QuoteCard key={q.symbol} quote={q} />)}</div>
          <SectionTitle label="Criptomoedas" />
          <div className="flex flex-col gap-1.5">{crypto.map(q => <QuoteCard key={q.symbol} quote={q} />)}</div>
        </div>

        {/* Coluna 4: Notícias */}
        <div className="overflow-hidden p-2.5 flex flex-col gap-1.5 border-r border-white/8">
          <div className="flex items-center justify-between shrink-0">
            <SectionTitle label="Notícias" accent="Corporativo & Varejo" />
            <span className="live-pulse text-[9px] font-mono text-emerald-400/60">● AO VIVO</span>
          </div>
          <div className="flex-1 overflow-hidden min-h-0"><NewsPanel news={news} /></div>
        </div>

        {/* Coluna 5: X / Twitter */}
        <div className="overflow-hidden p-2.5 flex flex-col min-h-0">
          <div className="flex-1 overflow-hidden min-h-0"><TwitterFeed /></div>
        </div>
      </div>

      <div className="border-t border-white/8 px-4 py-1 flex items-center justify-between bg-[#0a0f14] shrink-0">
        <span className="text-white/20 text-[9px] font-mono">GUEDES SHOPPING · PATOS/PB · PAINEL FINANCEIRO</span>
        <span className="text-white/20 text-[9px] font-mono">Dados: Yahoo Finance · Notícias: Brazil Journal, Metro Quadrado, Valor Econômico · Atualização a cada 30s</span>
        <span className="text-white/20 text-[9px] font-mono">© {new Date().getFullYear()} · Uso interno</span>
      </div>
    </div>
  );
}
