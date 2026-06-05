import React, { useState } from "react";
import { Objetivo, Meta, Submeta, Etapa } from "@/lib/types";
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
  AlertTriangle,
  CheckCircle2,
  Circle,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

interface TimelineLinhasProps {
  objetivos: Objetivo[];
  onToggleSubmeta: (objetivoId: string, metaId: string, submetaId: string) => void;
  onToggleEtapa: (objetivoId: string, metaId: string, submetaId: string, etapaId: string) => void;
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
  onToggleEtapa,
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
  const [submetasAbertas, setSubmetasAbertas] = useState<Record<string, boolean>>({});

  const toggleObjetivo = (id: string) => {
    setObjetivosExpandidos(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleMeta = (id: string) => {
    setMetasExpandidas(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleSubmetaChecklist = (id: string) => {
    setSubmetasAbertas(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Obter progresso de submeta com base em suas etapas
  const obterProgressoSubmeta = (submeta: Submeta) => {
    if (!submeta.etapas || submeta.etapas.length === 0) {
      return submeta.concluida ? 100 : 0;
    }
    const concluidas = submeta.etapas.filter(e => e.concluida).length;
    return Math.round((concluidas / submeta.etapas.length) * 100);
  };

  // Calcular progresso da Meta com base no progresso das Submetas
  const obterProgressoMeta = (meta: Meta) => {
    if (meta.submetas.length === 0) return 0;
    const totalProgresso = meta.submetas.reduce((acc, sub) => acc + obterProgressoSubmeta(sub), 0);
    return Math.round(totalProgresso / meta.submetas.length);
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
            className="bg-card border border-border/80 rounded-2xl p-5 hover:border-border transition-all duration-200"
          >
            {/* Linha do Objetivo */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border/40">
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <button 
                  onClick={() => toggleObjetivo(obj.id)}
                  className="mt-1 text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded hover:bg-muted"
                >
                  {expandidoObj ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                </button>
                
                <div className="p-2.5 bg-primary/10 border border-primary/20 rounded-xl text-primary">
                  <IconeObj className="w-5 h-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-bold text-foreground tracking-tight leading-snug">
                      {obj.nome}
                    </h3>
                    {atrasadoObj && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-destructive/10 text-destructive border border-destructive/20">
                        <AlertTriangle className="w-3 h-3" />
                        Atrasado
                      </span>
                    )}
                    {progressoObj === 100 && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Concluído
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
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Prazo: <span className={atrasadoObj ? "text-destructive font-bold" : "text-foreground"}>{formatarData(obj.prazo)}</span>
                  </span>
                  
                  {/* Barra de Progresso Unificada Flat */}
                  <div className="w-full flex items-center gap-2">
                    <div className="w-24 bg-secondary rounded-full h-2 overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500"
                        style={{ 
                          width: `${progressoObj}%`,
                          backgroundColor: atrasadoObj 
                            ? "oklch(0.60 0.15 25)" // Vermelho suave se atrasado
                            : progressoObj === 100 
                              ? "oklch(0.65 0.14 145)" // Verde suave se concluído
                              : `oklch(0.70 ${0.08 + (progressoObj / 100) * 0.05} ${45 + (progressoObj / 100) * 100})` // Amarelo até Verde
                        }}
                      />
                    </div>
                    <span className="text-xs font-bold" style={{
                      color: atrasadoObj 
                        ? "oklch(0.60 0.15 25)" 
                        : progressoObj === 100 
                          ? "oklch(0.65 0.14 145)" 
                          : `oklch(0.70 0.12 ${45 + (progressoObj / 100) * 100})`
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

            {/* Lista de Metas (Timeline Interna Flat) */}
            {expandidoObj && (
              <div className="mt-4 ml-4 pl-6 border-l border-border/80 space-y-6 relative">
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
                        {/* Marcador Flat Amigável */}
                        <div className="absolute -left-[30px] top-2.5 w-3.5 h-3.5 rounded-full bg-background border-2 border-border flex items-center justify-center z-10">
                          <div className={`w-1.5 h-1.5 rounded-full ${
                            progressoMeta === 100 
                              ? "bg-emerald-500" 
                              : atrasadoMeta 
                                ? "bg-destructive" 
                                : "bg-primary"
                          }`} />
                        </div>

                        {/* Linha da Meta */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-secondary/30 hover:bg-secondary/50 p-3 border border-border/30 rounded-xl transition-colors duration-150">
                          <div className="flex items-start gap-2 min-w-0 flex-1">
                            <button 
                              onClick={() => toggleMeta(meta.id)}
                              className="mt-0.5 text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded"
                            >
                              {expandidaMeta ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            </button>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-sm font-bold text-foreground tracking-tight">
                                  {meta.nome}
                                </h4>
                                {atrasadoMeta && (
                                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-semibold bg-destructive/10 text-destructive border border-destructive/20">
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
                              <span className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatarData(meta.prazo)}
                              </span>
                              
                              <div className="w-full flex items-center gap-2">
                                <div className="w-16 bg-secondary rounded-full h-1.5 overflow-hidden">
                                  <div 
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{ 
                                      width: `${progressoMeta}%`,
                                      backgroundColor: atrasadoMeta 
                                        ? "oklch(0.60 0.15 25)" 
                                        : progressoMeta === 100 
                                          ? "oklch(0.65 0.14 145)" 
                                          : `oklch(0.70 ${0.08 + (progressoMeta / 100) * 0.05} ${45 + (progressoMeta / 100) * 100})`
                                    }}
                                  />
                                </div>
                                <span className="text-[10px] font-bold" style={{
                                  color: atrasadoMeta 
                                    ? "oklch(0.60 0.15 25)" 
                                    : progressoMeta === 100 
                                      ? "oklch(0.65 0.14 145)" 
                                      : `oklch(0.70 0.12 ${45 + (progressoMeta / 100) * 100})`
                                }}>
                                  {progressoMeta}%
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
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

                        {/* Stepper Horizontal de Submetas Conectado */}
                        {expandidaMeta && (
                          <div className="mt-4 ml-4 pl-4 relative">
                            {meta.submetas.length === 0 ? (
                              <p className="text-xs text-muted-foreground py-1">
                                Nenhuma submeta cadastrada. Clique no "+" para criar uma.
                              </p>
                            ) : (
                              <div className="relative">
                                {/* Linha de Progressão Contínua Conectora de Fundo */}
                                <div className="absolute top-[18px] left-[16px] right-[16px] h-1 bg-secondary rounded-full z-0 hidden md:block" />
                                
                                {/* Linha de Progresso Ativa baseada na conclusão de submetas */}
                                <div 
                                  className="absolute top-[18px] left-[16px] h-1 bg-emerald-500 rounded-full z-0 transition-all duration-500 hidden md:block"
                                  style={{
                                    width: (() => {
                                      const total = meta.submetas.length;
                                      if (total <= 1) return "0%";
                                      const concluidas = meta.submetas.filter(s => obterProgressoSubmeta(s) === 100).length;
                                      // Calcula a largura da linha de conexão com base no número de submetas completas
                                      const percent = total > 1 ? (concluidas / (total - 1)) * 100 : 0;
                                      return `calc(${Math.min(percent, 100)}% - 32px)`;
                                    })()
                                  }}
                                />

                                <div className="flex flex-col md:flex-row md:items-start gap-6 md:gap-4 overflow-x-auto pb-4 scrollbar-thin relative z-10">
                                  {meta.submetas.map((sub, idx) => {
                                    const progressoSub = obterProgressoSubmeta(sub);
                                    const subConcluida = progressoSub === 100;
                                    const atrasadaSub = estaAtrasado(sub.prazo, subConcluida);
                                    const subAberta = submetasAbertas[sub.id];

                                    return (
                                      <div key={sub.id} className="flex-1 min-w-[240px] md:max-w-[320px] flex flex-col gap-2">
                                        {/* Cabeçalho do Step com Marcador Circular */}
                                        <div className="flex items-center gap-3 relative">
                                          {/* Círculo do Step */}
                                          <div 
                                            onClick={() => onToggleSubmeta(obj.id, meta.id, sub.id)}
                                            className={`w-9 h-9 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 border-2 z-10 shrink-0 ${
                                              subConcluida 
                                                ? "bg-emerald-500 border-emerald-500 text-white" 
                                                : progressoSub > 0
                                                  ? "bg-background border-amber-500 text-amber-500"
                                                  : "bg-background border-border text-muted-foreground hover:border-primary"
                                            }`}
                                          >
                                            {subConcluida ? (
                                              <Check className="w-5 h-5" />
                                            ) : (
                                              <span className="text-xs font-bold">{idx + 1}</span>
                                            )}
                                          </div>

                                          {/* Nome da Submeta e Prazo */}
                                          <div className="min-w-0 flex-1">
                                            <p className={`text-xs font-bold truncate ${
                                              subConcluida ? "text-muted-foreground line-through" : "text-foreground"
                                            }`}>
                                              {sub.nome}
                                            </p>
                                            <span className={`text-[10px] font-semibold flex items-center gap-1 mt-0.5 ${
                                              subConcluida 
                                                ? "text-emerald-400" 
                                                : atrasadaSub 
                                                  ? "text-destructive font-bold" 
                                                  : "text-muted-foreground"
                                            }`}>
                                              <Calendar className="w-2.5 h-2.5" />
                                              {formatarData(sub.prazo)}
                                            </span>
                                          </div>

                                          {/* Botão de Editar Submeta */}
                                          <Button 
                                            variant="ghost" 
                                            size="icon"
                                            onClick={() => onEditarSubmeta(obj.id, meta.id, sub)}
                                            className="h-7 w-7 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary shrink-0"
                                          >
                                            <Edit2 className="w-3.5 h-3.5" />
                                          </Button>
                                        </div>

                                        {/* Card Flat de Checklist de Etapas */}
                                        <div className="bg-secondary/20 border border-border/40 rounded-xl p-3 mt-1">
                                          <div 
                                            onClick={() => toggleSubmetaChecklist(sub.id)}
                                            className="flex items-center justify-between cursor-pointer hover:text-foreground text-muted-foreground transition-colors"
                                          >
                                            <span className="text-[10px] font-bold uppercase tracking-wider">
                                              Etapas ({sub.etapas?.filter(e => e.concluida).length || 0}/{sub.etapas?.length || 0})
                                            </span>
                                            <span className="text-[10px] font-bold text-primary">
                                              {progressoSub}%
                                            </span>
                                          </div>

                                          {/* Lista de Etapas (Checklist) */}
                                          {(!sub.etapas || sub.etapas.length === 0) ? (
                                            <p className="text-[11px] text-muted-foreground mt-2 italic">
                                              Nenhuma etapa cadastrada. Edite a submeta para adicionar etapas.
                                            </p>
                                          ) : (
                                            <div className="space-y-2 mt-2">
                                              {sub.etapas.map((etapa) => (
                                                <div 
                                                  key={etapa.id} 
                                                  className="flex items-start gap-2 p-1.5 hover:bg-secondary/40 rounded-lg transition-colors cursor-pointer"
                                                  onClick={() => onToggleEtapa(obj.id, meta.id, sub.id, etapa.id)}
                                                >
                                                  <div className="mt-0.5 shrink-0">
                                                    {etapa.concluida ? (
                                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                                    ) : (
                                                      <Circle className="w-3.5 h-3.5 text-muted-foreground/60" />
                                                    )}
                                                  </div>
                                                  <span className={`text-[11px] font-medium leading-tight select-none ${
                                                    etapa.concluida 
                                                      ? "text-muted-foreground line-through decoration-muted-foreground/40" 
                                                      : "text-foreground"
                                                  }`}>
                                                    {etapa.nome}
                                                  </span>
                                                </div>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
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
