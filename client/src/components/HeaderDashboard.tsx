import React from "react";
import { Objetivo } from "@/lib/types";
import { Target, CheckCircle2, Clock, AlertTriangle, PlayCircle } from "lucide-react";

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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Tidly — Painel de Metas
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base max-w-2xl">
            Acompanhe seus objetivos estratégicos através de metas e submetas organizadas cronologicamente em uma linha do tempo intuitiva.
          </p>
        </div>
      </div>

      {/* Grid de Big Numbers - Padronizado */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Objetivos Ativos */}
        <div className="bg-card border border-border rounded-2xl p-5 soft-shadow flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-xl text-primary">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-muted-foreground block">
              Objetivos Ativos
            </span>
            <span className="text-2xl font-bold text-foreground block tracking-tight mt-0.5">
              {totalObjetivos}
            </span>
          </div>
        </div>

        {/* Card 2: Metas Estabelecidas */}
        <div className="bg-card border border-border rounded-2xl p-5 soft-shadow flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-500">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-muted-foreground block">
              Metas Ativas
            </span>
            <span className="text-2xl font-bold text-foreground block tracking-tight mt-0.5">
              {totalMetas}
            </span>
          </div>
        </div>

        {/* Card 3: Progresso Geral (Verde se batido/bom) */}
        <div className="bg-card border border-border rounded-2xl p-5 soft-shadow flex items-center gap-4">
          <div className={`p-3 rounded-xl ${
            taxaConclusaoGeral === 100 
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
              : "bg-primary/10 text-primary"
          }`}>
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-xs font-medium text-muted-foreground block">
              Progresso Geral (Submetas)
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className={`text-2xl font-bold tracking-tight ${
                taxaConclusaoGeral === 100 ? "text-emerald-600 dark:text-emerald-400" : "text-foreground"
              }`}>
                {taxaConclusaoGeral}%
              </span>
              <span className="text-xs text-muted-foreground">
                ({submetasConcluidas}/{totalSubmetas})
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Atrasos (Vermelho se defasado/atrasado) */}
        <div className="bg-card border border-border rounded-2xl p-5 soft-shadow flex items-center gap-4">
          <div className={`p-3 rounded-xl ${
            totalAtrasadas > 0 
              ? "bg-destructive/10 text-destructive animate-pulse" 
              : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          }`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-muted-foreground block">
              Submetas Atrasadas
            </span>
            <span className={`text-2xl font-bold block tracking-tight mt-0.5 ${
              totalAtrasadas > 0 ? "text-destructive" : "text-emerald-600 dark:text-emerald-400"
            }`}>
              {totalAtrasadas > 0 ? totalAtrasadas : "Em dia"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
