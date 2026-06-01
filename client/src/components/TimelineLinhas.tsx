import React, { useState } from "react";
import { Objetivo, Meta, Submeta } from "@/lib/types";
import { 
  ChevronDown, 
  ChevronRight, 
  Calendar, 
  Plus, 
  Edit2, 
  CheckCircle2, 
  Circle, 
  TrendingUp, 
  Award, 
  Heart, 
  Briefcase, 
  Globe, 
  Cpu, 
  Users,
  Target,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

interface TimelineLinhasProps {
  objetivos: Objetivo[];
  onToggleSubmeta: (objetivoId: string, metaId: string, submetaId: string) => void;
  onEditarObjetivo: (objetivo: Objetivo) => void;
  onEditarMeta: (objetivoId: string, meta: Meta) => void;
  onEditarSubmeta: (objetivoId: string, metaId: string, submeta: Submeta) => void;
  onCriarMeta: (objetivoId: string) => void;
  onCriarSubmeta: (objetivoId: string, metaId: string) => void;
}

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  TrendingUp,
  Award,
  Heart,
  Briefcase,
  Globe,
  Cpu,
  Users,
  Target
};

export default function TimelineLinhas({
  objetivos,
  onToggleSubmeta,
  onEditarObjetivo,
  onEditarMeta,
  onEditarSubmeta,
  onCriarMeta,
  onCriarSubmeta
}: TimelineLinhasProps) {
  const [objetivosExpandidos, setObjetivosExpandidos] = useState<Record<string, boolean>>({
    "obj-1": true // Expandir o primeiro por padrão
  });
  const [metasExpandidas, setMetasExpandidas] = useState<Record<string, boolean>>({
    "meta-1-1": true
  });

  const toggleObjetivo = (id: string) => {
    setObjetivosExpandidos(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleMeta = (id: string) => {
    setMetasExpandidas(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Calcular progresso
  const obterProgressoMeta = (meta: Meta) => {
    if (meta.submetas.length === 0) return 0;
    const concluidas = meta.submetas.filter(s => s.concluida).length;
    return Math.round((concluidas / meta.submetas.length) * 100);
  };

  const obterProgressoObjetivo = (objetivo: Objetivo) => {
    if (objetivo.metas.length === 0) return 0;
    const totalProgressoMetas = objetivo.metas.reduce((acc, meta) => acc + obterProgressoMeta(meta), 0);
    return Math.round(totalProgressoMetas / objetivo.metas.length);
  };

  // Verificar se o prazo está atrasado
  const estaAtrasado = (prazoStr: string, concluida: boolean = false) => {
    if (concluida) return false;
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const prazo = new Date(prazoStr);
    return prazo < hoje;
  };

  // Formatar data para exibição mais agradável em PT-BR
  const formatarData = (dataStr: string) => {
    try {
      const partes = dataStr.split("-");
      if (partes.length !== 3) return dataStr;
      return `${partes[2]}/${partes[1]}/${partes[0]}`;
    } catch {
      return dataStr;
    }
  };

  return (
    <div className="space-y-6">
      {objetivos.map((obj) => {
        const progressoObj = obterProgressoObjetivo(obj);
        const atrasadoObj = estaAtrasado(obj.prazo, progressoObj === 100);
        const IconeObj = ICON_MAP[obj.icone || "Target"] || Target;
        const expandidoObj = objetivosExpandidos[obj.id];

        return (
          <div 
            key={obj.id} 
            className="bg-card text-card-foreground border border-border rounded-2xl soft-shadow p-5 transition-all duration-300 hover:border-primary/20"
          >
            {/* Linha do Objetivo */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4">
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <button 
                  onClick={() => toggleObjetivo(obj.id)}
                  className="mt-1 text-muted-foreground hover:text-primary transition-colors p-0.5 rounded hover:bg-muted"
                >
                  {expandidoObj ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                </button>
                
                <div className="p-2.5 bg-primary/5 rounded-xl text-primary">
                  <IconeObj className="w-5 h-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-semibold text-foreground tracking-tight leading-snug">
                      {obj.nome}
                    </h3>
                    {atrasadoObj && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-destructive/10 text-destructive border border-destructive/20 animate-pulse">
                        <AlertTriangle className="w-3 h-3" />
                        Atrasado
                      </span>
                    )}
                    {progressoObj === 100 && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        Concluído
                      </span>
                    )}
                  </div>
                  {obj.descricao && (
                    <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">
                      {obj.descricao}
                    </p>
                  )}
                </div>
              </div>

              {/* Informações de Progresso e Ações do Objetivo */}
              <div className="flex items-center gap-6 self-end md:self-auto pl-8 md:pl-0">
                <div className="flex flex-col items-end gap-1.5 min-w-[140px]">
                  <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Prazo: <span className={atrasadoObj ? "text-destructive font-semibold" : "text-foreground"}>{formatarData(obj.prazo)}</span>
                  </span>
                  
                  {/* Barra de Progresso Unificada */}
                  <div className="w-full flex items-center gap-2">
                    <div className="w-24 bg-muted rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          progressoObj === 100 
                            ? "bg-emerald-500" 
                            : atrasadoObj 
                              ? "bg-destructive" 
                              : "bg-primary"
                        }`}
                        style={{ width: `${progressoObj}%` }}
                      />
                    </div>
                    <span className={`text-xs font-semibold ${
                      progressoObj === 100 
                        ? "text-emerald-600 dark:text-emerald-400" 
                        : atrasadoObj 
                          ? "text-destructive" 
                          : "text-primary"
                    }`}>
                      {progressoObj}%
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => onEditarObjetivo(obj)}
                    className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => onCriarMeta(obj.id)}
                    className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10 rounded-lg"
                    title="Adicionar Meta"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Lista de Metas (Timeline Interna) */}
            {expandidoObj && (
              <div className="mt-4 ml-4 pl-6 border-l-2 border-border/60 space-y-5 relative">
                {obj.metas.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-2">
                    Nenhuma meta cadastrada para este objetivo. Clique no botão "+" para criar uma.
                  </p>
                ) : (
                  obj.metas.map((meta) => {
                    const progressoMeta = obterProgressoMeta(meta);
                    const atrasadoMeta = estaAtrasado(meta.prazo, progressoMeta === 100);
                    const expandidaMeta = metasExpandidas[meta.id];

                    return (
                      <div key={meta.id} className="group relative">
                        {/* Marcador de Linha do Tempo */}
                        <div className="absolute -left-[31px] top-2 w-4 h-4 rounded-full bg-card border-2 border-border flex items-center justify-center z-10">
                          <div className={`w-1.5 h-1.5 rounded-full ${
                            progressoMeta === 100 
                              ? "bg-emerald-500" 
                              : atrasadoMeta 
                                ? "bg-destructive" 
                                : "bg-primary"
                          }`} />
                        </div>

                        {/* Linha da Meta */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted/40 hover:bg-muted/70 p-3 rounded-xl transition-colors duration-200">
                          <div className="flex items-start gap-2.5 min-w-0 flex-1">
                            <button 
                              onClick={() => toggleMeta(meta.id)}
                              className="mt-0.5 text-muted-foreground hover:text-primary transition-colors p-0.5 rounded"
                            >
                              {expandidaMeta ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            </button>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-sm font-semibold text-foreground tracking-tight">
                                  {meta.nome}
                                </h4>
                                {atrasadoMeta && (
                                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-medium bg-destructive/10 text-destructive border border-destructive/20">
                                    Atrasado
                                  </span>
                                )}
                              </div>
                              {meta.descricao && (
                                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                                  {meta.descricao}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Prazo e Progresso da Meta */}
                          <div className="flex items-center gap-4 self-end sm:self-auto pl-7 sm:pl-0">
                            <div className="flex flex-col items-end gap-1 min-w-[120px]">
                              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatarData(meta.prazo)}
                              </span>
                              
                              <div className="w-full flex items-center gap-2">
                                <div className="w-16 bg-muted rounded-full h-1.5 overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full transition-all duration-500 ${
                                      progressoMeta === 100 
                                        ? "bg-emerald-500" 
                                        : atrasadoMeta 
                                          ? "bg-destructive" 
                                          : "bg-primary"
                                    }`}
                                    style={{ width: `${progressoMeta}%` }}
                                  />
                                </div>
                                <span className={`text-[11px] font-semibold ${
                                  progressoMeta === 100 
                                    ? "text-emerald-600 dark:text-emerald-400" 
                                    : atrasadoMeta 
                                      ? "text-destructive" 
                                      : "text-primary"
                                }`}>
                                  {progressoMeta}%
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => onEditarMeta(obj.id, meta)}
                                className="h-7 w-7 text-muted-foreground hover:text-foreground rounded-md"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => onCriarSubmeta(obj.id, meta.id)}
                                className="h-7 w-7 text-primary hover:bg-primary/10 rounded-md"
                                title="Adicionar Submeta"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Lista de Submetas (Checkpoints na Timeline) */}
                        {expandidaMeta && (
                          <div className="mt-2 ml-4 pl-6 border-l border-dashed border-border/80 space-y-2.5 relative">
                            {meta.submetas.length === 0 ? (
                              <p className="text-xs text-muted-foreground py-1">
                                Nenhuma submeta cadastrada. Clique no "+" para criar um prazo específico.
                              </p>
                            ) : (
                              meta.submetas.map((sub) => {
                                const atrasadaSub = estaAtrasado(sub.prazo, sub.concluida);

                                return (
                                  <div 
                                    key={sub.id} 
                                    className="flex items-center justify-between gap-3 p-2 bg-card border border-border/40 rounded-lg hover:border-border transition-colors group/sub"
                                  >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                      <Checkbox 
                                        checked={sub.concluida}
                                        onCheckedChange={() => onToggleSubmeta(obj.id, meta.id, sub.id)}
                                        className="rounded-md border-muted-foreground/40 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                                      />
                                      <span className={`text-xs font-medium truncate ${
                                        sub.concluida 
                                          ? "text-muted-foreground line-through decoration-muted-foreground/50" 
                                          : "text-foreground"
                                      }`}>
                                        {sub.nome}
                                      </span>
                                    </div>

                                    <div className="flex items-center gap-3">
                                      <span className={`text-[10px] flex items-center gap-1 px-2 py-0.5 rounded-full ${
                                        sub.concluida 
                                          ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" 
                                          : atrasadaSub 
                                            ? "bg-destructive/10 text-destructive font-semibold" 
                                            : "bg-muted text-muted-foreground"
                                      }`}>
                                        <Calendar className="w-2.5 h-2.5" />
                                        {formatarData(sub.prazo)}
                                      </span>

                                      <Button 
                                        variant="ghost" 
                                        size="icon"
                                        onClick={() => onEditarSubmeta(obj.id, meta.id, sub)}
                                        className="h-6 w-6 opacity-0 group-hover/sub:opacity-100 text-muted-foreground hover:text-foreground rounded transition-opacity"
                                      >
                                        <Edit2 className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
