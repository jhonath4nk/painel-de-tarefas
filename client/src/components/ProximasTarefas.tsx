import React, { useState, useMemo } from "react";
import { Objetivo, Submeta } from "@/lib/types";
import { Calendar, ChevronLeft, ChevronRight, CheckCircle2, Circle, Target } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProximasTarefasProps {
  objetivos: Objetivo[];
  onToggleEtapa: (objetivoId: string, metaId: string, submetaId: string, etapaId: string) => void;
  autenticado?: boolean;
}

interface TarefaPlana {
  objetivoId: string;
  metaId: string;
  submetaId: string;
  submetaNome: string;
  etapaId: string;
  etapaNome: string;
  concluida: boolean;
  prazo: string;
}

export default function ProximasTarefas({ objetivos, onToggleEtapa, autenticado = false }: ProximasTarefasProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Mapeia todas as etapas pendentes de todas as submetas e as ordena por prazo
  const proximasTarefas = useMemo(() => {
    const tarefas: TarefaPlana[] = [];

    objetivos.forEach((obj) => {
      obj.metas.forEach((meta) => {
        meta.submetas.forEach((sub) => {
          // Só pegamos etapas de submetas que ainda não foram concluídas por completo
          if (!sub.concluida && sub.etapas) {
            sub.etapas.forEach((etapa) => {
              if (!etapa.concluida) {
                tarefas.push({
                  objetivoId: obj.id,
                  metaId: meta.id,
                  submetaId: sub.id,
                  submetaNome: sub.nome,
                  etapaId: etapa.id,
                  etapaNome: etapa.nome,
                  concluida: etapa.concluida,
                  prazo: sub.prazo // O prazo final da etapa é o prazo da submeta
                });
              }
            });
          }
        });
      });
    });

    // Ordena por prazo (mais próximo primeiro)
    return tarefas.sort((a, b) => new Date(a.prazo).getTime() - new Date(b.prazo).getTime());
  }, [objetivos]);

  const totalTarefas = proximasTarefas.length;

  // Navegação do carrossel
  const handlePrev = () => {
    if (totalTarefas === 0) return;
    setCurrentIndex((prev) => (prev === 0 ? totalTarefas - 1 : prev - 1));
  };

  const handleNext = () => {
    if (totalTarefas === 0) return;
    setCurrentIndex((prev) => (prev === totalTarefas - 1 ? 0 : prev + 1));
  };

  // Formatar data de forma legível
  const formatarData = (dataStr: string) => {
    try {
      const partes = dataStr.split("-");
      if (partes.length === 3) {
        return `${partes[2]}/${partes[1]}/${partes[0]}`;
      }
      const d = new Date(dataStr);
      return d.toLocaleDateString("pt-BR");
    } catch {
      return dataStr;
    }
  };

  if (totalTarefas === 0) {
    return (
      <div className="bg-card/40 border border-border/40 rounded-2xl p-6 text-center backdrop-blur-sm">
        <div className="inline-flex p-3 bg-emerald-500/10 rounded-full text-emerald-400 mb-3 border border-emerald-500/20">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <h3 className="text-sm font-semibold text-foreground">Tudo em dia!</h3>
        <p className="text-xs text-muted-foreground mt-1">Você não tem nenhuma etapa pendente cadastrada.</p>
      </div>
    );
  }

  // Pegamos a tarefa ativa no índice atual
  const tarefaAtiva = proximasTarefas[currentIndex];

  return (
    <div className="relative bg-gradient-to-br from-card/60 to-card/20 border border-border/40 rounded-2xl p-5 backdrop-blur-sm overflow-hidden group">
      {/* Detalhe estético de fundo */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Lado Esquerdo: Título da Seção e Contador */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Próximas Tarefas de Foco
            </h2>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Acompanhe o que precisa ser feito em ordem de prioridade cronológica.
          </p>
        </div>

        {/* Contador */}
        <div className="text-xs font-mono text-muted-foreground bg-secondary/30 border border-border/30 px-2.5 py-0.5 rounded-full self-start md:self-auto">
          {currentIndex + 1} / {totalTarefas}
        </div>
      </div>

      {/* Conteúdo Central: Card da Tarefa Ativa */}
      <div className="mt-4 p-4 bg-background/50 border border-border/30 rounded-xl flex items-center justify-between gap-4 hover:border-border/60 transition-colors">
        <div className="min-w-0 flex-1 space-y-2">
          {/* Submeta Pai */}
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-primary">
            <Target className="w-3 h-3" />
            <span className="truncate">{tarefaAtiva.submetaNome}</span>
          </div>

          {/* Nome da Etapa */}
          <div 
            onClick={() => autenticado && onToggleEtapa(tarefaAtiva.objetivoId, tarefaAtiva.metaId, tarefaAtiva.submetaId, tarefaAtiva.etapaId)}
            className={`flex items-start gap-2.5 ${autenticado ? "cursor-pointer" : "cursor-default"}`}
          >
            <div className="mt-0.5 shrink-0">
              <Circle className="w-4 h-4 text-muted-foreground/60 hover:text-primary transition-colors" />
            </div>
            <span className="text-sm font-semibold text-foreground leading-snug truncate">
              {tarefaAtiva.etapaNome}
            </span>
          </div>

          {/* Prazo Final */}
          <div className="flex items-center gap-1 text-[10px] text-destructive font-bold bg-destructive/10 border border-destructive/20 w-fit px-2 py-0.5 rounded">
            <Calendar className="w-3 h-3" />
            <span>Prazo: {formatarData(tarefaAtiva.prazo)}</span>
          </div>
        </div>
      </div>

      {/* Setas Diagonais Assimétricas no Canto Inferior Direito */}
      <div className="absolute bottom-3 right-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200">
        <Button
          variant="outline"
          size="icon"
          onClick={handlePrev}
          className="h-7 w-7 bg-background/80 border-border/40 hover:bg-secondary hover:text-foreground rounded-lg -rotate-12 hover:rotate-0 transition-transform duration-150"
          title="Anterior"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleNext}
          className="h-7 w-7 bg-background/80 border-border/40 hover:bg-secondary hover:text-foreground rounded-lg rotate-12 hover:rotate-0 transition-transform duration-150"
          title="Próxima"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
