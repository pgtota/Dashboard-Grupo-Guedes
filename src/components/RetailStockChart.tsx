/**
 * RetailStockChart — Gráficos de desempenho das principais ações do varejo brasileiro
 * Design: Bloomberg Terminal Dark Theme
 * Ações: MGLU3, LREN3, AMER3, VIIA3, PCAR3, SOMA3, ALPA4, AMAR3
 */

import { useMemo, useState } from "react";
import {
  AreaChart, Area, LineChart, Line,
  XAxis, YAxis, ResponsiveContainer, Tooltip, ReferenceLine,
  BarChart, Bar, Cell,
} from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";

// Dados base das ações de varejo (preços reais aproximados de mercado)
const RETAIL_STOCKS = [
  { symbol: "MGLU3", name: "Magazine Luiza",  basePrice: 8.92,  color: "#34d399", sector: "E-commerce" },
  { symbol: "LREN3", name: "Lojas Renner",    basePrice: 12.78, color: "#60a5fa", sector: "Moda" },
  { symbol: "AMER3", name: "Americanas",       basePrice: 1.15,  color: "#f87171", sector: "Varejo" },
  { symbol: "VIIA3", name: "Grupo Casas Bahia",basePrice: 2.34,  color: "#fbbf24", sector: "Eletro" },
  { symbol: "PCAR3", name: "Grupo Pão de Açúcar", basePrice: 14.60, color: "#a78bfa", sector: "Alimentos" },
  { symbol: "SOMA3", name: "Grupo Soma",       basePrice: 7.82,  color: "#fb923c", sector: "Moda Premium" },
  { symbol: "ALPA4", name: "Alpargatas",       basePrice: 9.45,  color: "#38bdf8", sector: "Calçados" },
  { symbol: "AMAR3", name: "Marisa",           basePrice: 3.18,  color: "#e879f9", sector: "Moda" },
];

// Gera histórico intraday simulado (9h às 17h) com tendência baseada no preço atual
function generateIntradayHistory(basePrice: number, trend: number, volatility: number = 0.008) {
  const hours = [
    "09:00","09:30","10:00","10:30","11:00","11:30",
    "12:00","12:30","13:00","13:30","14:00","14:30",
    "15:00","15:30","16:00","16:30","17:00",
  ];
  let price = basePrice * (1 - trend * 0.5);
  return hours.map((time, i) => {
    const progress = i / (hours.length - 1);
    price = price * (1 + trend * 0.06 + (Math.random() - 0.5) * volatility);
    return { time, value: parseFloat(price.toFixed(2)) };
  });
}

// Gera histórico dos últimos 30 dias
function generate30DayHistory(basePrice: number, trend: number) {
  const days: { day: string; value: number }[] = [];
  let price = basePrice * (1 - trend * 0.8);
  for (let i = 30; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    if (d.getDay() === 0 || d.getDay() === 6) continue; // pula fins de semana
    price = price * (1 + trend * 0.04 + (Math.random() - 0.5) * 0.015);
    days.push({
      day: d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
      value: parseFloat(price.toFixed(2)),
    });
  }
  // Forçar último ponto = preço atual
  if (days.length > 0) days[days.length - 1].value = basePrice;
  return days;
}

// Tooltip customizado
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#161b22] border border-white/10 rounded px-2 py-1.5 text-[10px] font-mono">
      <div className="text-white/50 mb-0.5">{label}</div>
      <div className="text-white font-bold">R$ {payload[0]?.value?.toFixed(2)}</div>
    </div>
  );
}

// Card individual de ação com gráfico
function RetailCard({
  stock,
  currentPrice,
  changePercent,
  view,
}: {
  stock: typeof RETAIL_STOCKS[0];
  currentPrice: number;
  changePercent: number;
  view: "intraday" | "30d";
}) {
  const isUp = changePercent >= 0;
  const trend = changePercent / 100;

  const intradayData = useMemo(
    () => generateIntradayHistory(currentPrice, trend),
    [stock.symbol]
  );
  const monthData = useMemo(
    () => generate30DayHistory(currentPrice, trend),
    [stock.symbol]
  );

  const data = view === "intraday" ? intradayData : monthData;
  const dataKey = "value";
  const openPrice = data[0]?.value ?? currentPrice;
  const color = isUp ? "#34d399" : "#f87171";

  return (
    <div
      className="rounded-md border p-2.5 flex flex-col gap-1.5 transition-all duration-300 hover:border-opacity-60"
      style={{
        borderColor: `${stock.color}22`,
        background: `${stock.color}08`,
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-1">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ background: stock.color }}
            />
            <span className="font-mono text-[11px] font-bold text-white/80 truncate">
              {stock.symbol}
            </span>
          </div>
          <div className="text-white/35 text-[9px] font-body truncate mt-0.5 ml-3">
            {stock.name}
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="font-mono text-sm font-bold text-white leading-none">
            R$ {currentPrice.toFixed(2)}
          </div>
          <div
            className={`flex items-center justify-end gap-0.5 text-[10px] font-mono font-bold mt-0.5 ${
              isUp ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {isUp ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
            {isUp ? "+" : ""}
            {changePercent.toFixed(2)}%
          </div>
        </div>
      </div>

      {/* Gráfico */}
      <div className="h-14">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 2, right: 2, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id={`grad-retail-${stock.symbol}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <ReferenceLine
              y={openPrice}
              stroke="rgba(255,255,255,0.12)"
              strokeDasharray="3 3"
              strokeWidth={1}
            />
            <XAxis dataKey={view === "intraday" ? "time" : "day"} hide />
            <YAxis domain={["auto", "auto"]} hide />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={1.5}
              fill={`url(#grad-retail-${stock.symbol})`}
              dot={false}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Setor + variação absoluta */}
      <div className="flex items-center justify-between">
        <span
          className="text-[9px] font-mono px-1.5 py-0.5 rounded"
          style={{ color: stock.color, background: `${stock.color}15` }}
        >
          {stock.sector}
        </span>
        <span className={`text-[9px] font-mono ${isUp ? "text-emerald-400/60" : "text-red-400/60"}`}>
          {isUp ? "+" : ""}
          {((currentPrice - openPrice)).toFixed(2)} pts
        </span>
      </div>
    </div>
  );
}

// Gráfico de barras comparativo de variação %
function PerformanceBar({ stocks, prices, changes }: {
  stocks: typeof RETAIL_STOCKS;
  prices: Record<string, number>;
  changes: Record<string, number>;
}) {
  const data = stocks.map(s => ({
    name: s.symbol,
    value: parseFloat((changes[s.symbol] ?? 0).toFixed(2)),
    color: (changes[s.symbol] ?? 0) >= 0 ? "#34d399" : "#f87171",
  }));

  return (
    <div className="h-20">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }} barSize={14}>
          <XAxis
            dataKey="name"
            tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 8, fontFamily: "JetBrains Mono" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 8, fontFamily: "JetBrains Mono" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={v => `${v > 0 ? "+" : ""}${v}%`}
            width={32}
          />
          <ReferenceLine y={0} stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
          <Tooltip
            contentStyle={{
              background: "#161b22",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 4,
              fontSize: 10,
              fontFamily: "JetBrains Mono",
              color: "#e6edf3",
            }}
            formatter={(v: number) => [`${v > 0 ? "+" : ""}${v}%`, "Variação"]}
          />
          <Bar dataKey="value" radius={[2, 2, 0, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} fillOpacity={0.85} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

interface RetailStockChartProps {
  quotes: { symbol: string; price: number; changePercent: number }[];
}

export function RetailStockChart({ quotes }: RetailStockChartProps) {
  const [view, setView] = useState<"intraday" | "30d">("intraday");

  // Mapear preços e variações das quotes recebidas
  const prices: Record<string, number> = {};
  const changes: Record<string, number> = {};

  for (const q of quotes) {
    const sym = q.symbol.replace(".SA", "");
    prices[sym] = q.price;
    changes[sym] = q.changePercent;
  }

  // Para ações que não estão nas quotes (AMER3, VIIA3, PCAR3, SOMA3, ALPA4, AMAR3),
  // usar preços base com variação simulada
  for (const s of RETAIL_STOCKS) {
    if (!prices[s.symbol]) {
      prices[s.symbol] = s.basePrice * (1 + (Math.random() - 0.5) * 0.004);
      changes[s.symbol] = (Math.random() - 0.48) * 4;
    }
  }

  const bestStock = RETAIL_STOCKS.reduce((best, s) =>
    (changes[s.symbol] ?? 0) > (changes[best.symbol] ?? 0) ? s : best
  );
  const worstStock = RETAIL_STOCKS.reduce((worst, s) =>
    (changes[s.symbol] ?? 0) < (changes[worst.symbol] ?? 0) ? s : worst
  );

  return (
    <div className="flex flex-col gap-3">
      {/* Header da seção */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-0.5 h-4 bg-amber-400/70 rounded-full" />
          <span className="text-white/50 text-[10px] font-mono font-bold tracking-[0.2em] uppercase">
            Varejo Brasil
          </span>
          <span className="text-white/20 text-[10px] font-mono">B3 · 8 ações</span>
        </div>
        {/* Toggle de período */}
        <div className="flex items-center gap-0.5 bg-white/5 rounded p-0.5">
          <button
            onClick={() => setView("intraday")}
            className={`text-[9px] font-mono px-2 py-0.5 rounded transition-all ${
              view === "intraday"
                ? "bg-amber-400/20 text-amber-400 font-bold"
                : "text-white/30 hover:text-white/50"
            }`}
          >
            HOJE
          </button>
          <button
            onClick={() => setView("30d")}
            className={`text-[9px] font-mono px-2 py-0.5 rounded transition-all ${
              view === "30d"
                ? "bg-amber-400/20 text-amber-400 font-bold"
                : "text-white/30 hover:text-white/50"
            }`}
          >
            30D
          </button>
        </div>
      </div>

      {/* Destaques: melhor e pior do dia */}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded border border-emerald-400/20 bg-emerald-400/5 px-2.5 py-2 flex items-center justify-between">
          <div>
            <div className="text-[9px] font-mono text-white/30 uppercase tracking-wider">Melhor hoje</div>
            <div className="font-mono text-xs font-bold text-white">{bestStock.symbol}</div>
            <div className="text-[9px] text-white/40 font-body">{bestStock.name}</div>
          </div>
          <div className="text-emerald-400 font-mono text-sm font-bold">
            +{(changes[bestStock.symbol] ?? 0).toFixed(2)}%
          </div>
        </div>
        <div className="rounded border border-red-400/20 bg-red-400/5 px-2.5 py-2 flex items-center justify-between">
          <div>
            <div className="text-[9px] font-mono text-white/30 uppercase tracking-wider">Pior hoje</div>
            <div className="font-mono text-xs font-bold text-white">{worstStock.symbol}</div>
            <div className="text-[9px] text-white/40 font-body">{worstStock.name}</div>
          </div>
          <div className="text-red-400 font-mono text-sm font-bold">
            {(changes[worstStock.symbol] ?? 0).toFixed(2)}%
          </div>
        </div>
      </div>

      {/* Gráfico comparativo de barras */}
      <div className="rounded border border-white/8 bg-white/2 p-2">
        <div className="text-[9px] font-mono text-white/30 uppercase tracking-wider mb-1">
          Variação comparativa (%)
        </div>
        <PerformanceBar stocks={RETAIL_STOCKS} prices={prices} changes={changes} />
      </div>

      {/* Grid de cards individuais */}
      <div className="grid grid-cols-2 gap-2">
        {RETAIL_STOCKS.map(stock => (
          <RetailCard
            key={stock.symbol}
            stock={stock}
            currentPrice={prices[stock.symbol] ?? stock.basePrice}
            changePercent={changes[stock.symbol] ?? 0}
            view={view}
          />
        ))}
      </div>
    </div>
  );
}
