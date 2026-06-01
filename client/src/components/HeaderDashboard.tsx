import React from "react";
import { Objetivo } from "@/lib/types";
import { Target, CheckCircle2, Clock, AlertTriangle } from "lucide-react";

interface HeaderDashboardProps {
  objetivos: Objetivo[];
}

export default function HeaderDashboard({ objetivos }: HeaderDashboardProps) {
  // Calcular estatísticas gerais
  const totalObjetivos = objetivos.length;
  
  const totalMetas = objetivos.reduce((acc, obj) => acc + obj.metas.length, 0);
  
  const totalSubmetas = objetivos.reduce((acc, obj) => {
    return acc + obj.metas.reduce((sum, meta) => sum + meta.submetas.length, 0);
  }, 0);

  const submetasConcluidas = objetivos.reduce((acc, obj) => {
    return acc + obj.metas.reduce((sum, meta) => {
      return sum + meta.submetas.filter(sub => sub.concluida).length;
    }, 0);
  }, 0);

  const taxaConclusaoGeral = totalSubmetas > 0 
    ? Math.round((submetasConcluidas / totalSubmetas) * 100) 
    : 0;

  // Verificar prazos atrasados gerais
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const totalAtrasadas = objetivos.reduce((acc, obj) => {
    return acc + obj.metas.reduce((sum, meta) => {
      return sum + meta.submetas.filter(sub => {
        const prazo = new Date(sub.prazo);
        return !sub.concluida && prazo < hoje;
      }).length;
    }, 0);
  }, 0);

  return (
    <div className="space-y-6">
      {/* Título e Conceito */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
            <span className="text-[10px] font-bold tracking-widest text-primary uppercase font-hud">
              Live Monitoring System
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl font-hud mt-1 uppercase bg-gradient-to-r from-foreground via-foreground/90 to-primary bg-clip-text text-transparent">
            Tidly // Dashboard
          </h1>
          <p className="text-muted-foreground mt-1 text-xs sm:text-sm max-w-2xl">
            Centro de controle tático de objetivos, metas e submetas integradas em tempo real.
          </p>
        </div>
      </div>

      {/* Grid de Big Numbers - Estilo HUD de Alta Tecnologia */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Objetivos Ativos */}
        <div className="bg-card backdrop-blur-md border border-border rounded-2xl p-5 soft-shadow flex items-center gap-4 glow-cyan-hover">
          <div className="p-3 bg-primary/10 rounded-xl text-primary glow-cyan">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              Objetivos Ativos
            </span>
            <span className="text-3xl font-black text-foreground block tracking-tight mt-0.5 font-hud">
              {totalObjetivos}
            </span>
          </div>
        </div>

        {/* Card 2: Metas Estabelecidas */}
        <div className="bg-card backdrop-blur-md border border-border rounded-2xl p-5 soft-shadow flex items-center gap-4 glow-cyan-hover">
          <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              Metas Ativas
            </span>
            <span className="text-3xl font-black text-foreground block tracking-tight mt-0.5 font-hud">
              {totalMetas}
            </span>
          </div>
        </div>

        {/* Card 3: Progresso Geral (Verde se batido/bom) */}
        <div className="bg-card backdrop-blur-md border border-border rounded-2xl p-5 soft-shadow flex items-center gap-4 glow-cyan-hover">
          <div className={`p-3 rounded-xl ${
            taxaConclusaoGeral === 100 
              ? "bg-emerald-500/10 text-emerald-400 glow-emerald" 
              : "bg-primary/10 text-primary glow-cyan"
          }`}>
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              Progresso Geral
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className={`text-3xl font-black tracking-tight font-hud ${
                taxaConclusaoGeral === 100 ? "text-emerald-400" : "text-foreground"
              }`}>
                {taxaConclusaoGeral}%
              </span>
              <span className="text-xs text-muted-foreground font-hud">
                ({submetasConcluidas}/{totalSubmetas})
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Atrasos (Vermelho se defasado/atrasado) */}
        <div className="bg-card backdrop-blur-md border border-border rounded-2xl p-5 soft-shadow flex items-center gap-4 glow-cyan-hover">
          <div className={`p-3 rounded-xl ${
            totalAtrasadas > 0 
              ? "bg-destructive/10 text-destructive glow-destructive animate-pulse" 
              : "bg-emerald-500/10 text-emerald-400 glow-emerald"
          }`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              Atrasadas / Alerta
            </span>
            <span className={`text-3xl font-black block tracking-tight mt-0.5 font-hud ${
              totalAtrasadas > 0 ? "text-destructive" : "text-emerald-400"
            }`}>
              {totalAtrasadas > 0 ? totalAtrasadas : "00"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
