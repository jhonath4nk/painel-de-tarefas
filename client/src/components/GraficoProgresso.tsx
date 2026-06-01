import React from "react";
import { Objetivo } from "@/lib/types";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";

interface GraficoProgressoProps {
  objetivos: Objetivo[];
}

export default function GraficoProgresso({ objetivos }: GraficoProgressoProps) {
  // Calcular progresso para cada objetivo
  const obterProgressoMeta = (meta: any) => {
    if (meta.submetas.length === 0) return 0;
    const concluidas = meta.submetas.filter((s: any) => s.concluida).length;
    return Math.round((concluidas / meta.submetas.length) * 100);
  };

  const obterProgressoObjetivo = (objetivo: Objetivo) => {
    if (objetivo.metas.length === 0) return 0;
    const totalProgressoMetas = objetivo.metas.reduce((acc, meta) => acc + obterProgressoMeta(meta), 0);
    return Math.round(totalProgressoMetas / objetivo.metas.length);
  };

  const dadosGrafico = objetivos.map(obj => ({
    nome: obj.nome.length > 25 ? obj.nome.substring(0, 22) + "..." : obj.nome,
    nomeCompleto: obj.nome,
    progresso: obterProgressoObjetivo(obj)
  }));

  // Cores de gradiente neon baseadas no progresso
  const obterCorBarra = (progresso: number) => {
    if (progresso === 100) return "oklch(0.72 0.15 145)"; // Verde esmeralda neon
    if (progresso < 30) return "oklch(0.62 0.18 25)"; // Vermelho neon calmo
    return "oklch(0.78 0.16 195)"; // Ciano neon
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-popover border border-border p-3 rounded-xl shadow-xl backdrop-blur-md">
          <p className="text-xs font-semibold text-foreground max-w-xs">{data.nomeCompleto}</p>
          <p className="text-sm font-bold text-primary mt-1">
            Progresso: <span className="font-hud">{data.progresso}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card backdrop-blur-md border border-border rounded-2xl p-5 soft-shadow glow-cyan-hover">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-foreground tracking-tight uppercase">
            Visão Geral de Performance
          </h3>
          <p className="text-xs text-muted-foreground">Progresso consolidado por objetivo estratégico</p>
        </div>
        <div className="flex gap-3 text-[10px] font-semibold">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[oklch(0.72_0.15_145)]" />
            <span>100%</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[oklch(0.78_0.16_195)]" />
            <span>Em Andamento</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[oklch(0.62_0.18_25)]" />
            <span>Atenção (&lt;30%)</span>
          </div>
        </div>
      </div>

      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={dadosGrafico}
            layout="vertical"
            margin={{ top: 5, right: 15, left: -10, bottom: 5 }}
          >
            <XAxis 
              type="number" 
              domain={[0, 100]} 
              stroke="oklch(0.6 0.02 255)" 
              fontSize={10}
              tickFormatter={(v) => `${v}%`}
            />
            <YAxis 
              dataKey="nome" 
              type="category" 
              stroke="oklch(0.6 0.02 255)" 
              fontSize={10}
              width={100}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "oklch(1 0 0 / 3%)" }} />
            <Bar 
              dataKey="progresso" 
              radius={[0, 4, 4, 0]} 
              barSize={12}
            >
              {dadosGrafico.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={obterCorBarra(entry.progresso)} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
