import React from "react";
import { Objetivo } from "@/lib/types";
import { CheckCircle2, Circle, AlertTriangle } from "lucide-react";

interface HeaderDashboardProps {
  objetivos: Objetivo[];
}

export default function HeaderDashboard({ objetivos }: HeaderDashboardProps) {
  // Obter progresso de uma etapa (antiga submeta) com base em suas subetapas (antigas etapas)
  const obterProgressoEtapa = (etapa: any) => {
    if (!etapa.etapas || etapa.etapas.length === 0) {
      return etapa.concluida ? 100 : 0;
    }
    const concluidas = etapa.etapas.filter((e: any) => e.concluida).length;
    return Math.round((concluidas / etapa.etapas.length) * 100);
  };

  // Calcular estatísticas focadas em Tarefas (Etapas no código, mostradas como Tarefas na UI)
  // objetivos (types) = Áreas (Mãe)
  // metas (types) = Objetivos
  // submetas (types) = Etapas (que o usuário visualiza como as tarefas principais da timeline)
  
  const totalEtapas = objetivos.reduce((acc, obj) => {
    return acc + obj.metas.reduce((sum, meta) => sum + meta.submetas.length, 0);
  }, 0);

  const etapasConcluidas = objetivos.reduce((acc, obj) => {
    return acc + obj.metas.reduce((sum, meta) => {
      return sum + meta.submetas.filter(sub => obterProgressoEtapa(sub) === 100).length;
    }, 0);
  }, 0);

  const etapasFaltando = totalEtapas - etapasConcluidas;

  // Verificar prazos atrasados gerais (etapas pendentes que passaram do prazo)
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const totalAtrasadas = objetivos.reduce((acc, obj) => {
    return acc + obj.metas.reduce((sum, meta) => {
      return sum + meta.submetas.filter(sub => {
        const prazo = new Date(sub.prazo);
        const concluida = obterProgressoEtapa(sub) === 100;
        return !concluida && prazo < hoje;
      }).length;
    }, 0);
  }, 0);

  // Percentuais correspondentes
  const pctFeitas = totalEtapas > 0 ? Math.round((etapasConcluidas / totalEtapas) * 100) : 0;
  const pctFaltando = totalEtapas > 0 ? Math.round((etapasFaltando / totalEtapas) * 100) : 0;
  const pctAtrasadas = totalEtapas > 0 ? Math.round((totalAtrasadas / totalEtapas) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Grid de Big Numbers Focado em Execução de Tarefas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Tarefas Feitas */}
        <div className="bg-card border border-border/80 rounded-2xl p-5 flex items-center gap-4 transition-all duration-200">
          <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              Tarefas Feitas
            </span>
            <div className="flex items-baseline justify-between mt-0.5">
              <span className="text-3xl font-bold text-emerald-400 tracking-tight">
                {etapasConcluidas}
                <span className="text-sm font-medium text-muted-foreground ml-1">/ {totalEtapas}</span>
              </span>
              <span className="text-lg font-extrabold text-emerald-500/80">
                {pctFeitas}%
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Tarefas Faltando */}
        <div className="bg-card border border-border/80 rounded-2xl p-5 flex items-center gap-4 transition-all duration-200">
          <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400">
            <Circle className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              Tarefas Faltando
            </span>
            <div className="flex items-baseline justify-between mt-0.5">
              <span className="text-3xl font-bold text-amber-400 tracking-tight">
                {etapasFaltando}
                <span className="text-sm font-medium text-muted-foreground ml-1">/ {totalEtapas}</span>
              </span>
              <span className="text-lg font-extrabold text-amber-500/80">
                {pctFaltando}%
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Tarefas em Atraso */}
        <div className="bg-card border border-border/80 rounded-2xl p-5 flex items-center gap-4 transition-all duration-200">
          <div className={`p-3 rounded-xl ${
            totalAtrasadas > 0 ? "bg-destructive/10 text-destructive" : "bg-emerald-500/10 text-emerald-400"
          }`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              Tarefas em Atraso
            </span>
            <div className="flex items-baseline justify-between mt-0.5">
              <span className={`text-3xl font-bold tracking-tight ${
                totalAtrasadas > 0 ? "text-destructive" : "text-emerald-400"
              }`}>
                {totalAtrasadas}
                <span className="text-sm font-medium text-muted-foreground ml-1">/ {totalEtapas}</span>
              </span>
              <span className={`text-lg font-extrabold ${
                totalAtrasadas > 0 ? "text-destructive/80" : "text-emerald-500/80"
              }`}>
                {pctAtrasadas}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
