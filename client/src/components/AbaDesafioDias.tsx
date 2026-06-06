import React, { useState, useMemo } from "react";
import { DesafioDiasData, RegraRecorrencia, DiaCorrido, TarefaDia } from "../lib/types";
import { 
  Plus, Trash2, Calendar, CheckCircle2, Circle, Clock, Sparkles, 
  Settings2, ChevronRight, ChevronLeft, ArrowRight, Check, RefreshCw,
  HelpCircle, Info
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { toast } from "sonner";
import { Progress } from "./ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

interface AbaDesafioDiasProps {
  desafioData: DesafioDiasData;
  onChange: (newData: DesafioDiasData) => void;
  autenticado: boolean;
}

export function AbaDesafioDias({ desafioData, onChange, autenticado }: AbaDesafioDiasProps) {
  const [diaSelecionadoNum, setDiaSelecionadoNum] = useState<number>(1);
  const [novaRegraNome, setNovaRegraNome] = useState("");
  const [novaRegraTipo, setNovaRegraTipo] = useState<"diaria" | "intervalo">("diaria");
  const [novaRegraIntervalo, setNovaRegraIntervalo] = useState("2");
  const [modalRegrasAberto, setModalRegrasAberto] = useState(false);
  const [filtroDia, setFiltroDia] = useState<"todos" | "concluidos" | "pendentes">("todos");

  // Estatísticas do Desafio
  const stats = useMemo(() => {
    const total = desafioData?.totalDias || 100;
    let concluidos = 0;
    let totalTarefas = 0;
    let tarefasConcluidas = 0;

    const diasValidos = desafioData?.dias ? Object.values(desafioData.dias) : [];

    diasValidos.forEach((dia) => {
      if (!dia) return;
      if (dia.concluido) concluidos++;
      const tarefasValidas = Array.isArray(dia.tarefas) ? dia.tarefas : [];
      tarefasValidas.forEach((t) => {
        if (!t) return;
        totalTarefas++;
        if (t.concluida) tarefasConcluidas++;
      });
    });

    const porcentagemDias = total > 0 ? Math.round((concluidos / total) * 100) : 0;
    const porcentagemTarefas = totalTarefas > 0 ? Math.round((tarefasConcluidas / totalTarefas) * 100) : 0;

    return {
      total,
      concluidos,
      porcentagemDias,
      totalTarefas,
      tarefasConcluidas,
      porcentagemTarefas
    };
  }, [desafioData]);

  const diaSelecionado = useMemo(() => {
    return desafioData.dias[diaSelecionadoNum] || desafioData.dias[String(diaSelecionadoNum) as any] || { numero: diaSelecionadoNum, concluido: false, tarefas: [] };
  }, [desafioData, diaSelecionadoNum]);

  // Filtrar os dias no grid
  const diasFiltrados = useMemo(() => {
    const todosDias = Array.from({ length: desafioData.totalDias }, (_, i) => i + 1);
    
    if (filtroDia === "todos") return todosDias;
    
    return todosDias.filter((num) => {
      const dia = desafioData.dias[num] || desafioData.dias[String(num) as any];
      if (!dia) return false;
      return filtroDia === "concluidos" ? dia.concluido : !dia.concluido;
    });
  }, [desafioData, filtroDia]);

  // Alternar a conclusão de uma tarefa de um dia específico
  const handleToggleTarefa = (diaNum: number, tarefaId: string) => {
    if (!autenticado) {
      toast.error("Você precisa estar logado para salvar alterações.");
      return;
    }

    const novosDias = { ...desafioData.dias };
    const diaExistente = novosDias[diaNum] || novosDias[String(diaNum) as any];
    
    if (diaExistente) {
      const dia = { ...diaExistente };
      const novasTarefas = (dia.tarefas || []).map((t) => {
        if (t.id === tarefaId) {
          return { ...t, concluida: !t.concluida };
        }
        return t;
      });

      const diaConcluido = novasTarefas.length > 0 ? novasTarefas.every((t) => t.concluida) : false;

      novosDias[diaNum] = {
        ...dia,
        tarefas: novasTarefas,
        concluido: diaConcluido
      };

      onChange({
        ...desafioData,
        dias: novosDias
      });

      // Feedback visual bacana
      const tarefaModificada = dia.tarefas.find(t => t.id === tarefaId);
      if (tarefaModificada && !tarefaModificada.concluida) {
        if (diaConcluido) {
          toast.success(`Parabéns! Você completou todas as tarefas do Dia ${diaNum}! 🎉`);
        } else {
          toast.success(`Tarefa concluída no Dia ${diaNum}!`);
        }
      }
    }
  };

  // Cadastrar nova regra de recorrência
  const handleAdicionarRegra = (e: React.FormEvent) => {
    e.preventDefault();
    if (!autenticado) {
      toast.error("Apenas usuários autenticados podem gerenciar regras.");
      return;
    }

    if (!novaRegraNome.trim()) {
      toast.error("Insira o nome da tarefa recorrente.");
      return;
    }

    const intervaloNum = parseInt(novaRegraIntervalo);
    if (novaRegraTipo === "intervalo" && (isNaN(intervaloNum) || intervaloNum < 2)) {
      toast.error("O intervalo de repetição deve ser de pelo menos 2 dias.");
      return;
    }

    const novaRegra: RegraRecorrencia = {
      id: `regra-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      nome: novaRegraNome.trim(),
      tipo: novaRegraTipo,
      intervaloDias: novaRegraTipo === "intervalo" ? intervaloNum : undefined,
      dataCriacao: new Date().toISOString()
    };

    const novasRegras = [...desafioData.regras, novaRegra];
    const novosDias = { ...desafioData.dias };

    // Aplicar a nova regra retroativamente apenas nos dias NÃO concluídos
    for (let d = 1; d <= desafioData.totalDias; d++) {
      // Lê de forma segura tratando chaves que podem vir como string ou número do JSON
      const diaExistente = novosDias[d] || novosDias[String(d) as any];
      const dia = diaExistente ? { ...diaExistente } : { numero: d, concluido: false, tarefas: [] };
      
      // Regra de Ouro: Se o dia já está concluído, NUNCA adicionamos a nova tarefa nele,
      // preservando totalmente o histórico de sucesso do usuário no passado.
      if (dia.concluido) {
        continue;
      }

      let deveIncluir = false;

      if (novaRegra.tipo === "diaria") {
        deveIncluir = true;
      } else if (novaRegra.tipo === "intervalo" && novaRegra.intervaloDias) {
        deveIncluir = d % novaRegra.intervaloDias === 0;
      }

      if (deveIncluir) {
        const novasTarefas = [
          ...(dia.tarefas || []),
          {
            id: `t-${novaRegra.id}-${d}`,
            nome: novaRegra.nome,
            concluida: false,
            regraId: novaRegra.id
          }
        ];

        novosDias[d] = {
          ...dia,
          tarefas: novasTarefas,
          concluido: false // Como tem uma nova tarefa não concluída, esse dia que já estava pendente continua pendente
        };
      }
    }

    onChange({
      ...desafioData,
      regras: novasRegras,
      dias: novosDias
    });

    setNovaRegraNome("");
    toast.success(`Tarefa recorrente "${novaRegra.nome}" cadastrada e aplicada com sucesso!`);
  };

  // Remover uma regra de recorrência
  const handleRemoverRegra = (regraId: string, nomeRegra: string) => {
    if (!autenticado) {
      toast.error("Apenas usuários autenticados podem gerenciar regras.");
      return;
    }

    const novasRegras = desafioData.regras.filter((r) => r.id !== regraId);
    const novosDias = { ...desafioData.dias };

    // Remover as tarefas associadas a essa regra de todos os dias
    for (let d = 1; d <= desafioData.totalDias; d++) {
      const diaExistente = novosDias[d] || novosDias[String(d) as any];
      if (diaExistente) {
        const dia = { ...diaExistente };
        const novasTarefas = (dia.tarefas || []).filter((t) => t.regraId !== regraId);
        novosDias[d] = {
          ...dia,
          tarefas: novasTarefas,
          concluido: novasTarefas.length > 0 ? novasTarefas.every((t) => t.concluida) : false
        };
      }
    }

    onChange({
      ...desafioData,
      regras: novasRegras,
      dias: novosDias
    });

    toast.success(`Tarefa recorrente "${nomeRegra}" removida de todos os dias.`);
  };

  // Expandir mais 100 dias corridos
  const handleExpandirMais100 = () => {
    if (!autenticado) {
      toast.error("Apenas usuários autenticados podem expandir o desafio.");
      return;
    }

    const novoTotal = desafioData.totalDias + 100;
    const novosDias = { ...desafioData.dias };

    for (let d = desafioData.totalDias + 1; d <= novoTotal; d++) {
      const tarefas: TarefaDia[] = [];
      desafioData.regras.forEach((regra) => {
        let deveIncluir = false;
        if (regra.tipo === "diaria") {
          deveIncluir = true;
        } else if (regra.tipo === "intervalo" && regra.intervaloDias) {
          deveIncluir = d % regra.intervaloDias === 0;
        }

        if (deveIncluir) {
          tarefas.push({
            id: `t-${regra.id}-${d}`,
            nome: regra.nome,
            concluida: false,
            regraId: regra.id
          });
        }
      });

      novosDias[d] = {
        numero: d,
        concluido: false,
        tarefas
      };
    }

    onChange({
      ...desafioData,
      totalDias: novoTotal,
      dias: novosDias
    });

    toast.success(`Desafio expandido com sucesso! Agora você tem ${novoTotal} dias para completar. 🚀`);
  };

  // Marcar/Desmarcar o dia inteiro como concluído de forma rápida
  const handleToggleDiaInteiro = (diaNum: number) => {
    if (!autenticado) {
      toast.error("Você precisa estar logado para salvar alterações.");
      return;
    }

    const novosDias = { ...desafioData.dias };
    const diaExistente = novosDias[diaNum] || novosDias[String(diaNum) as any];
    
    if (diaExistente) {
      const dia = { ...diaExistente };
      const todosConcluidos = (dia.tarefas || []).every(t => t.concluida);
      const novoEstado = !todosConcluidos;

      const novasTarefas = (dia.tarefas || []).map(t => ({
        ...t,
        concluida: novoEstado
      }));

      novosDias[diaNum] = {
        ...dia,
        tarefas: novasTarefas,
        concluido: novoEstado
      };

      onChange({
        ...desafioData,
        dias: novosDias
      });

      if (novoEstado) {
        toast.success(`Dia ${diaNum} marcado como concluído! 🎉`);
      } else {
        toast.info(`Dia ${diaNum} marcado como pendente.`);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner de Cabeçalho do Desafio */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-zinc-900 via-neutral-950 to-zinc-900 border border-zinc-800/80 p-6 md:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-48 h-48 rounded-full bg-emerald-500/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 -mb-6 -ml-6 w-48 h-48 rounded-full bg-blue-500/5 blur-3xl" />
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> Desafio de Consistência
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Painel dos {stats.total} Dias Corridos
            </h1>
            <p className="text-zinc-400 text-sm md:text-base leading-relaxed">
              Monitore a sua disciplina diária. Cadastre tarefas recorrentes que aparecem de forma automática a cada dia e dê check-in na sua evolução contínua.
            </p>
          </div>

          {/* Gerenciamento de Regras (Botão que abre Modal) */}
          <div className="flex items-center gap-3">
            <Dialog open={modalRegrasAberto} onOpenChange={setModalRegrasAberto}>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-zinc-800 bg-zinc-950 hover:bg-zinc-900 text-zinc-300 hover:text-white flex items-center gap-2">
                  <Settings2 className="w-4 h-4" /> Configurar Tarefas Diárias
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-100 max-w-lg">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                    <Clock className="w-5 h-5 text-emerald-500" /> Tarefas Recorrentes
                  </DialogTitle>
                  <DialogDescription className="text-zinc-400 text-sm">
                    Configure as tarefas que serão geradas de forma automatizada para os dias.
                  </DialogDescription>
                </DialogHeader>

                {/* Lista de regras atuais */}
                <div className="space-y-3 my-4 max-h-[200px] overflow-y-auto pr-1">
                  <Label className="text-zinc-300 font-semibold">Tarefas Ativas:</Label>
                  {desafioData.regras.length === 0 ? (
                    <div className="text-center py-4 text-zinc-500 border border-dashed border-zinc-800 rounded-lg text-xs">
                      Nenhuma tarefa recorrente cadastrada ainda.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {desafioData.regras.map((regra) => (
                        <div key={regra.id} className="flex items-center justify-between p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-sm">
                          <div className="space-y-0.5">
                            <p className="font-semibold text-white">{regra.nome}</p>
                            <p className="text-xs text-zinc-400">
                              {regra.tipo === "diaria" ? "Todo santo dia" : `A cada ${regra.intervaloDias} dias`}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoverRegra(regra.id, regra.nome)}
                            className="text-zinc-500 hover:text-red-400 hover:bg-red-500/10 h-8 w-8"
                            disabled={!autenticado}
                            title={!autenticado ? "Faça login para remover" : "Remover tarefa"}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <hr className="border-zinc-800" />

                {/* Formulário para nova regra */}
                <form onSubmit={handleAdicionarRegra} className="space-y-4 pt-2">
                  <Label className="text-zinc-300 font-semibold">Cadastrar Nova Tarefa:</Label>
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="nome" className="text-xs text-zinc-400">O que você precisa fazer?</Label>
                      <Input
                        id="nome"
                        placeholder="Ex: Beber 3L de água, Estudar inglês..."
                        value={novaRegraNome}
                        onChange={(e) => setNovaRegraNome(e.target.value)}
                        className="bg-zinc-900 border-zinc-800 text-white placeholder-zinc-600 focus:border-emerald-500 focus:ring-emerald-500/20"
                        disabled={!autenticado}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="tipo" className="text-xs text-zinc-400">Frequência</Label>
                        <Select
                          value={novaRegraTipo}
                          onValueChange={(v) => setNovaRegraTipo(v as "diaria" | "intervalo")}
                          disabled={!autenticado}
                        >
                          <SelectTrigger id="tipo" className="bg-zinc-900 border-zinc-800 text-zinc-300">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-300">
                            <SelectItem value="diaria">Todo dia</SelectItem>
                            <SelectItem value="intervalo">A cada X dias</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {novaRegraTipo === "intervalo" && (
                        <div className="space-y-1.5">
                          <Label htmlFor="intervalo" className="text-xs text-zinc-400">Dias de intervalo</Label>
                          <Input
                            id="intervalo"
                            type="number"
                            min="2"
                            value={novaRegraIntervalo}
                            onChange={(e) => setNovaRegraIntervalo(e.target.value)}
                            className="bg-zinc-900 border-zinc-800 text-white"
                            disabled={!autenticado}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <DialogFooter className="pt-2">
                    <Button 
                      type="submit" 
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
                      disabled={!autenticado}
                    >
                      {autenticado ? "Salvar e Aplicar nos Dias" : "Faça Login para Salvar"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Estatísticas de Progresso do Desafio */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-zinc-800/60">
          <div className="space-y-1">
            <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Dias Concluídos</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">{stats.concluidos}</span>
              <span className="text-sm text-zinc-500">de {stats.total} dias</span>
            </div>
            <Progress value={stats.porcentagemDias} className="h-1.5 bg-zinc-800 [&>div]:bg-emerald-500" />
          </div>

          <div className="space-y-1">
            <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Total de Checks</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">{stats.tarefasConcluidas}</span>
              <span className="text-sm text-zinc-500">de {stats.totalTarefas} tarefas</span>
            </div>
            <Progress value={stats.porcentagemTarefas} className="h-1.5 bg-zinc-800 [&>div]:bg-blue-500" />
          </div>

          <div className="flex items-center justify-end sm:pt-2">
            <div className="text-right">
              <span className="text-xs text-zinc-500 block uppercase tracking-wider font-semibold">Consistência Geral</span>
              <span className="text-3xl font-extrabold text-emerald-400">{stats.porcentagemDias}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Principal: Lateral Esquerda com Dias / Lateral Direita com Detalhes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Grid de Dias (Esquerda) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-500" />
              <h2 className="text-lg font-bold text-white">Selecione o Dia Corrido</h2>
            </div>
            
            {/* Filtros de Dias */}
            <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded-lg p-1 text-xs">
              <button
                onClick={() => setFiltroDia("todos")}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  filtroDia === "todos" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setFiltroDia("concluidos")}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  filtroDia === "concluidos" ? "bg-emerald-950/40 text-emerald-400 border border-emerald-800/30" : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Concluídos
              </button>
              <button
                onClick={() => setFiltroDia("pendentes")}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  filtroDia === "pendentes" ? "bg-amber-950/40 text-amber-400 border border-amber-800/30" : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Pendentes
              </button>
            </div>
          </div>

          {/* Grid Scrollable de Dias */}
          <div className="bg-zinc-950 border border-zinc-800/60 rounded-xl p-4 md:p-6 shadow-xl">
            {diasFiltrados.length === 0 ? (
              <div className="text-center py-12 text-zinc-500 text-sm">
                Nenhum dia encontrado para o filtro selecionado.
              </div>
            ) : (
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 max-h-[420px] overflow-y-auto pr-1">
                {diasFiltrados.map((num) => {
                  const dia = desafioData.dias[num] || desafioData.dias[String(num) as any];
                  const isConcluido = dia?.concluido;
                  const temTarefas = dia && dia.tarefas.length > 0;
                  const isSelecionado = num === diaSelecionadoNum;

                  return (
                    <button
                      key={num}
                      onClick={() => setDiaSelecionadoNum(num)}
                      className={`relative aspect-square rounded-lg flex flex-col items-center justify-center transition-all border text-xs font-semibold ${
                        isSelecionado
                          ? "bg-emerald-600 text-white border-emerald-400 shadow-lg scale-105 z-10 ring-2 ring-emerald-500/20"
                          : isConcluido
                          ? "bg-emerald-950/30 text-emerald-400 border-emerald-800/40 hover:bg-emerald-950/50"
                          : temTarefas
                          ? "bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/80"
                          : "bg-zinc-950 text-zinc-600 border-zinc-900 cursor-not-allowed"
                      }`}
                    >
                      <span className="text-[10px] opacity-60 font-medium">DIA</span>
                      <span className="text-base font-extrabold">{num}</span>
                      
                      {/* Pequeno ponto indicador de conclusão rápida */}
                      {isConcluido && !isSelecionado && (
                        <div className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Opção de construir mais 100 dias no final do grid */}
            <div className="mt-6 pt-4 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-zinc-500 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-zinc-400" />
                Dica: Clique com o botão direito no botão do dia para marcá-lo como concluído rapidamente.
              </div>
              <Button
                onClick={handleExpandirMais100}
                className="bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 hover:text-white font-bold text-xs py-2 px-4 flex items-center gap-2"
                disabled={!autenticado}
                title={!autenticado ? "Faça login para expandir o desafio" : "Adicionar mais 100 dias"}
              >
                <Plus className="w-4 h-4" /> Construir mais 100 Dias
              </Button>
            </div>
          </div>
        </div>

        {/* Detalhes do Dia Selecionado (Direita) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <h2 className="text-lg font-bold text-white">Checklist do Dia</h2>
          </div>

          <Card className="bg-zinc-950 border-zinc-800/60 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
            
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-extrabold text-white">Dia {diaSelecionadoNum}</CardTitle>
                  <CardDescription className="text-zinc-400 text-xs mt-1">
                    {diaSelecionado.concluido 
                      ? "Todas as obrigações concluídas!" 
                      : "Checklist pendente para hoje."}
                  </CardDescription>
                </div>
                
                {/* Botão de Check Rápido do Dia Inteiro */}
                {diaSelecionado.tarefas.length > 0 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleToggleDiaInteiro(diaSelecionadoNum)}
                    className={`h-9 w-9 rounded-full ${
                      diaSelecionado.concluido 
                        ? "text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20" 
                        : "text-zinc-500 hover:text-emerald-400 hover:bg-emerald-500/10"
                    }`}
                    title="Marcar dia inteiro como feito"
                    disabled={!autenticado}
                  >
                    <Check className="w-5 h-5" />
                  </Button>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {diaSelecionado.tarefas.length === 0 ? (
                <div className="text-center py-8 text-zinc-500 text-sm border border-dashed border-zinc-800 rounded-lg">
                  Nenhuma tarefa recorrente ativa para este dia.
                  <p className="text-xs text-zinc-600 mt-1">Cadastre tarefas diárias no topo da tela.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {diaSelecionado.tarefas.map((tarefa) => (
                    <button
                      key={tarefa.id}
                      onClick={() => handleToggleTarefa(diaSelecionadoNum, tarefa.id)}
                      className={`w-full flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all group ${
                        tarefa.concluida
                          ? "bg-emerald-950/10 border-emerald-800/30 text-zinc-400"
                          : "bg-zinc-900/60 border-zinc-800/80 text-zinc-200 hover:border-zinc-700 hover:bg-zinc-900"
                      }`}
                    >
                      <div className="mt-0.5 shrink-0 transition-transform group-active:scale-90">
                        {tarefa.concluida ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-500/10" />
                        ) : (
                          <Circle className="w-5 h-5 text-zinc-600 group-hover:text-emerald-500" />
                        )}
                      </div>
                      
                      <div className="space-y-1">
                        <span className={`text-sm font-semibold block leading-tight ${
                          tarefa.concluida ? "line-through text-zinc-500" : ""
                        }`}>
                          {tarefa.nome}
                        </span>
                        
                        {/* Indicador de Tipo de Tarefa */}
                        {desafioData.regras.find(r => r.id === tarefa.regraId)?.tipo === "intervalo" && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-medium uppercase">
                            Recorrente Especial
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Detalhes rápidos de navegação */}
              <div className="flex items-center justify-between pt-4 border-t border-zinc-900 text-xs text-zinc-500">
                <button
                  onClick={() => setDiaSelecionadoNum(prev => Math.max(1, prev - 1))}
                  disabled={diaSelecionadoNum === 1}
                  className="flex items-center gap-1 hover:text-zinc-300 disabled:opacity-30"
                >
                  <ChevronLeft className="w-4 h-4" /> Dia Anterior
                </button>
                <span>Dia {diaSelecionadoNum} de {desafioData.totalDias}</span>
                <button
                  onClick={() => setDiaSelecionadoNum(prev => Math.min(desafioData.totalDias, prev + 1))}
                  disabled={diaSelecionadoNum === desafioData.totalDias}
                  className="flex items-center gap-1 hover:text-zinc-300 disabled:opacity-30"
                >
                  Próximo Dia <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
