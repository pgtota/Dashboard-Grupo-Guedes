/**
 * DashboardHeader — Cabeçalho do painel com relógio e indicadores
 * Design: Bloomberg Terminal Dark Theme
 */

import { useState, useEffect } from "react";
import { Activity, RefreshCw } from "lucide-react";

interface DashboardHeaderProps {
  lastUpdate: Date;
  isLoading: boolean;
}

function Clock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const timeStr = time.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const dateStr = time.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex flex-col items-end">
      <span className="font-mono text-2xl font-bold text-white tracking-widest leading-none">{timeStr}</span>
      <span className="text-white/40 text-xs font-body capitalize">{dateStr}</span>
    </div>
  );
}

export function DashboardHeader({ lastUpdate, isLoading }: DashboardHeaderProps) {
  const updateStr = lastUpdate.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <header
      className="relative flex items-center justify-between px-6 py-3 border-b border-white/10 overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #0d1117 0%, #0f1923 50%, #0d1117 100%)",
      }}
    >
      {/* Background hero image */}
      <div
        className="absolute inset-0 opacity-15"
        style={{
          backgroundImage: `url(https://d2xsxph8kpxj0f.cloudfront.net/310519663448668899/hHnxUWmZSSJyuUE2SQqZby/dashboard-hero-4pV8XzFjopKzxyiEKKXntK.webp)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Left: Logo + Title */}
      <div className="relative flex items-center gap-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <div className="w-1 h-6 bg-emerald-400 rounded-full glow-green" />
            <span className="text-white font-bold text-lg tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              GUEDES SHOPPING
            </span>
          </div>
          <span className="text-white/40 text-xs font-body ml-3 tracking-widest uppercase">
            Painel Financeiro · Patos/PB
          </span>
        </div>
      </div>

      {/* Center: Market status */}
      <div className="relative flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="live-pulse w-2 h-2 rounded-full bg-emerald-400 inline-block" />
          <span className="text-emerald-400 text-xs font-mono font-bold tracking-widest">AO VIVO</span>
        </div>
        <div className="flex items-center gap-1.5 text-white/30 text-xs font-mono">
          <RefreshCw size={11} className={isLoading ? "animate-spin" : ""} />
          <span>Atualizado {updateStr}</span>
        </div>
      </div>

      {/* Right: Clock */}
      <div className="relative">
        <Clock />
      </div>
    </header>
  );
}
