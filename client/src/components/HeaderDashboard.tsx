import React from "react";
import { Objetivo } from "@/lib/types";
import { Layers, Target, CheckCircle2, AlertTriangle } from "lucide-react";

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

  // Calcular estatísticas gerais usando a nova nomenclatura:
  // objetivos (types) = Áreas (Mãe)
  // metas (types) = Objetivos
  // submetas (types) = Etapas
  // etapas (types) = Subetapas
  const totalAreas = objetivos.length;
  
  const totalObjetivos = objetivos.reduce((acc, obj) => acc + obj.metas.length, 0);
  
  const totalEtapas = objetivos.reduce((acc, obj) => {
    return acc + obj.metas.reduce((sum, meta) => sum + meta.submetas.length, 0);
  }, 0);

  const etapasConcluidas = objetivos.reduce((acc, obj) => {
    return acc + obj.metas.reduce((sum, meta) => {
      return sum + meta.submetas.filter(sub => obterProgressoEtapa(sub) === 100).length;
    }, 0);
  }, 0);

  const taxaConclusaoGeral = totalEtapas > 0 
    ? Math.round((etapasConcluidas / totalEtapas) * 100) 
    : 0;

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

  return (
    <div className="space-y-4">
      {/* Grid de Big Numbers - Estilo Flat Amigável */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Áreas Ativas */}
        <div className="bg-card border border-border/80 rounded-2xl p-5 flex items-center gap-4 transition-all duration-200">
          <div className="p-3 bg-primary/10 rounded-xl text-primary">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              Áreas Ativas
            </span>
            <span className="text-3xl font-bold text-foreground block tracking-tight mt-0.5">
              {totalAreas}
            </span>
          </div>
        </div>

        {/* Card 2: Objetivos em Foco */}
        <div className="bg-card border border-border/80 rounded-2xl p-5 flex items-center gap-4 transition-all duration-200">
          <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              Objetivos em Foco
            </span>
            <span className="text-3xl font-bold text-foreground block tracking-tight mt-0.5">
              {totalObjetivos}
            </span>
          </div>
        </div>

        {/* Card 3: Progresso Geral das Etapas */}
        <div className="bg-card border border-border/80 rounded-2xl p-5 flex items-center gap-4 transition-all duration-200">
          <div className={`p-3 rounded-xl ${
            taxaConclusaoGeral === 100 
              ? "bg-emerald-500/10 text-emerald-400" 
              : "bg-primary/10 text-primary"
          }`}>
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              Progresso Geral
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className={`text-3xl font-bold tracking-tight ${
                taxaConclusaoGeral === 100 ? "text-emerald-400" : "text-foreground"
              }`}>
                {taxaConclusaoGeral}%
              </span>
              <span className="text-xs text-muted-foreground">
                ({etapasConcluidas}/{totalEtapas} Etapas)
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Etapas Atrasadas */}
        <div className="bg-card border border-border/80 rounded-2xl p-5 flex items-center gap-4 transition-all duration-200">
          <div className={`p-3 rounded-xl ${
            totalAtrasadas > 0 
              ? "bg-destructive/10 text-destructive" 
              : "bg-emerald-500/10 text-emerald-400"
          }`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              Etapas Atrasadas
            </span>
            <span className={`text-3xl font-bold block tracking-tight mt-0.5 ${
              totalAtrasadas > 0 ? "text-destructive" : "text-emerald-400"
            }`}>
              {totalAtrasadas > 0 ? totalAtrasadas : "0"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
