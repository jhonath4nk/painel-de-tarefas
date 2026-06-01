import React, { useState } from "react";
import { Objetivo, Meta, Submeta } from "@/lib/types";
import { 
  ChevronDown, 
  ChevronRight, 
  Calendar, 
  Plus, 
  Edit2, 
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
    "obj-1": true
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

  // Formatar data para exibição
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
            className="bg-card backdrop-blur-md border border-border rounded-2xl p-5 soft-shadow glow-cyan-hover transition-all duration-300"
          >
            {/* Linha do Objetivo */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4">
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <button 
                  onClick={() => toggleObjetivo(obj.id)}
                  className="mt-1 text-muted-foreground hover:text-primary transition-colors p-0.5 rounded hover:bg-muted/50"
                >
                  {expandidoObj ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                </button>
                
                <div className="p-2.5 bg-primary/10 border border-primary/20 rounded-xl text-primary glow-cyan">
                  <IconeObj className="w-5 h-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-bold text-foreground tracking-tight leading-snug font-hud uppercase">
                      {obj.nome}
                    </h3>
                    {atrasadoObj && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-destructive/10 text-destructive border border-destructive/20 animate-pulse font-hud">
                        <AlertTriangle className="w-3 h-3" />
                        Alerta
                      </span>
                    )}
                    {progressoObj === 100 && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-hud">
                        Batido
                      </span>
                    )}
                  </div>
                  {obj.descricao && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                      {obj.descricao}
                    </p>
                  )}
                </div>
              </div>

              {/* Informações de Progresso e Ações do Objetivo */}
              <div className="flex items-center gap-6 self-end md:self-auto pl-8 md:pl-0">
                <div className="flex flex-col items-end gap-1.5 min-w-[140px]">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1 font-hud">
                    <Calendar className="w-3.5 h-3.5" />
                    Prazo: <span className={atrasadoObj ? "text-destructive font-bold" : "text-foreground"}>{formatarData(obj.prazo)}</span>
                  </span>
                  
                  {/* Barra de Progresso Unificada Neon com Gradiente Dinâmico */}
                  <div className="w-full flex items-center gap-2">
                    <div className="w-24 bg-muted border border-border/40 rounded-full h-2 overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500"
                        style={{ 
                          width: `${progressoObj}%`,
                          backgroundColor: atrasadoObj 
                            ? "oklch(0.62 0.18 25)" // Vermelho neon se atrasado
                            : progressoObj === 100 
                              ? "oklch(0.72 0.15 145)" // Verde esmeralda se concluído
                              : `oklch(0.75 ${0.12 + (progressoObj / 100) * 0.04} ${45 + (progressoObj / 100) * 100})`, // Transição linear de Amarelo (oklch hue 45) para Verde (oklch hue 145)
                          boxShadow: atrasadoObj 
                            ? "0 0 10px oklch(0.62 0.18 25 / 40%)" 
                            : progressoObj === 100 
                              ? "0 0 10px oklch(0.72 0.15 145 / 40%)" 
                              : `0 0 10px oklch(0.75 0.14 ${45 + (progressoObj / 100) * 100} / 30%)`
                        }}
                      />
                    </div>
                    <span className="text-xs font-bold font-hud" style={{
                      color: atrasadoObj 
                        ? "oklch(0.62 0.18 25)" 
                        : progressoObj === 100 
                          ? "oklch(0.72 0.15 145)" 
                          : `oklch(0.75 0.14 ${45 + (progressoObj / 100) * 100})`
                    }}>
                      {progressoObj}%
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => onEditarObjetivo(obj)}
                    className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg"
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

            {/* Lista de Metas (Timeline Interna HUD) */}
            {expandidoObj && (
              <div className="mt-4 ml-4 pl-6 border-l-2 border-primary/20 space-y-5 relative">
                {obj.metas.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-2">
                    Nenhuma meta cadastrada para este objetivo. Clique no botão "+" para criar uma.
                  </p>
                ) : (
                  obj.metas.map((meta) => {
                    const progressoMeta = obterProgressoMeta(meta);
                    const atrasadoMeta = estaAtrasado(meta.prazo, progressoMeta === 100);
                    const expandidaMeta = metasExpandidas[meta.id];

                    return (
                      <div key={meta.id} className="group relative">
                        {/* Marcador de Linha do Tempo Luminoso */}
                        <div className="absolute -left-[31px] top-2.5 w-4 h-4 rounded-full bg-background border-2 border-primary/30 flex items-center justify-center z-10">
                          <div className={`w-1.5 h-1.5 rounded-full ${
                            progressoMeta === 100 
                              ? "bg-emerald-500 glow-emerald" 
                              : atrasadoMeta 
                                ? "bg-destructive glow-destructive" 
                                : "bg-primary glow-cyan"
                          }`} />
                        </div>

                        {/* Linha da Meta */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted/20 hover:bg-muted/40 p-3 border border-border/20 rounded-xl transition-colors duration-200">
                          <div className="flex items-start gap-2.5 min-w-0 flex-1">
                            <button 
                              onClick={() => toggleMeta(meta.id)}
                              className="mt-0.5 text-muted-foreground hover:text-primary transition-colors p-0.5 rounded"
                            >
                              {expandidaMeta ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            </button>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-sm font-bold text-foreground tracking-tight font-hud uppercase">
                                  {meta.nome}
                                </h4>
                                {atrasadoMeta && (
                                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-bold uppercase bg-destructive/10 text-destructive border border-destructive/20 font-hud">
                                    Alerta
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
                              <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1 font-hud uppercase">
                                <Calendar className="w-3 h-3" />
                                {formatarData(meta.prazo)}
                              </span>
                              
                              <div className="w-full flex items-center gap-2">
                                <div className="w-16 bg-muted border border-border/40 rounded-full h-1.5 overflow-hidden">
                                  <div 
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{ 
                                      width: `${progressoMeta}%`,
                                      backgroundColor: atrasadoMeta 
                                        ? "oklch(0.62 0.18 25)" // Vermelho se atrasado
                                        : progressoMeta === 100 
                                          ? "oklch(0.72 0.15 145)" // Verde esmeralda se concluído
                                          : `oklch(0.75 ${0.12 + (progressoMeta / 100) * 0.04} ${45 + (progressoMeta / 100) * 100})`, // Transição linear de Amarelo para Verde
                                      boxShadow: atrasadoMeta 
                                        ? "0 0 10px oklch(0.62 0.18 25 / 40%)" 
                                        : progressoMeta === 100 
                                          ? "0 0 10px oklch(0.72 0.15 145 / 40%)" 
                                          : `0 0 10px oklch(0.75 0.14 ${45 + (progressoMeta / 100) * 100} / 30%)`
                                    }}
                                  />
                                </div>
                                <span className="text-[10px] font-bold font-hud" style={{
                                  color: atrasadoMeta 
                                    ? "oklch(0.62 0.18 25)" 
                                    : progressoMeta === 100 
                                      ? "oklch(0.72 0.15 145)" 
                                      : `oklch(0.75 0.14 ${45 + (progressoMeta / 100) * 100})`
                                }}>
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

                        {/* Lista de Submetas (Checkpoints HUD) */}
                        {expandidaMeta && (
                          <div className="mt-2 ml-4 pl-6 border-l border-dashed border-primary/20 space-y-2.5 relative">
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
                                    className="flex items-center justify-between gap-3 p-2 bg-card/40 border border-border/20 rounded-lg hover:border-primary/20 transition-colors group/sub"
                                  >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                      <Checkbox 
                                        checked={sub.concluida}
                                        onCheckedChange={() => onToggleSubmeta(obj.id, meta.id, sub.id)}
                                        className="rounded border-border/60 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
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
                                      <span className={`text-[9px] font-bold font-hud uppercase flex items-center gap-1 px-2 py-0.5 rounded-full ${
                                        sub.concluida 
                                          ? "bg-emerald-500/10 text-emerald-400" 
                                          : atrasadaSub 
                                            ? "bg-destructive/10 text-destructive" 
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
