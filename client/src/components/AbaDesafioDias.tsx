import React, { useState, useMemo, useCallback } from "react";
import { DesafioDiasData, RegraRecorrencia, DiaCorrido, TarefaDia } from "../lib/types";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, Cell, CartesianGrid } from "recharts";
import { 
  Plus, Trash2, Calendar, CheckCircle2, Circle, Clock, Sparkles, 
  Settings2, ChevronRight, ChevronLeft, Check, Info, AlertTriangle
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { toast } from "sonner";
import { Progress } from "./ui/progress";

interface AbaDesafioDiasProps {
  desafioData: DesafioDiasData;
  onChange: (newData: DesafioDiasData) => void;
  autenticado: boolean;
}

export function AbaDesafioDias({ desafioData, onChange, autenticado }: AbaDesafioDiasProps) {
  const [diaSelecionadoNum, setDiaSelecionadoNum] = useState<number>(6); // Inicializar em 6 (hoje, 06/07/2026)

  // Data de início do desafio: 01/07/2026
  const DATA_INICIO = useMemo(() => new Date(2026, 6, 1), []); // 1 de Julho de 2026

  // Função para obter a data real correspondente a um dia corrido
  const obterDataDia = useCallback((numeroDia: number): Date => {
    const data = new Date(DATA_INICIO);
    data.setDate(DATA_INICIO.getDate() + (numeroDia - 1));
    return data;
  }, [DATA_INICIO]);

  // Função para formatar a data de forma curta (ex: "06 Jul")
  const formatarDataCurta = useCallback((date: Date): string => {
    const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const dia = String(date.getDate()).padStart(2, "0");
    const mes = meses[date.getMonth()];
    return `${dia} ${mes}`;
  }, []);

  // Função para obter o dia da semana curto (ex: "Seg", "Ter")
  const formatarDiaSemana = useCallback((date: Date): string => {
    const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    return diasSemana[date.getDay()];
  }, []);

  // Função para formatar a data de forma longa e bonita (ex: "Segunda-feira, 06 de Julho de 2026")
  const formatarDataLonga = useCallback((date: Date): string => {
    const diasSemanaLongos = [
      "Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", 
      "Quinta-feira", "Sexta-feira", "Sábado"
    ];
    const mesesLongos = [
      "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];
    const diaSemana = diasSemanaLongos[date.getDay()];
    const dia = String(date.getDate()).padStart(2, "0");
    const mes = mesesLongos[date.getMonth()];
    const ano = date.getFullYear();
    return `${diaSemana}, ${dia} de ${mes} de ${ano}`;
  }, []);
  const [novaRegraNome, setNovaRegraNome] = useState("");
  const [novaRegraTipo, setNovaRegraTipo] = useState<"diaria" | "intervalo">("diaria");
  const [novaRegraIntervalo, setNovaRegraIntervalo] = useState("2");
  const [novaRegraCategoria, setNovaRegraCategoria] = useState<"Mente" | "Corpo" | "Profissional">("Mente");
  const [modalRegrasAberto, setModalRegrasAberto] = useState(false);
  const [filtroDia, setFiltroDia] = useState<"todos" | "concluidos" | "pendentes">("todos");

  // Dados para o Gráfico de Evolução das 3 Categorias (Últimos 7 Dias)
  const dadosEvolucao = useMemo(() => {
    const total = desafioData?.totalDias || 180;
    const dados: Array<{ name: string; Mente: number; Corpo: number; Profissional: number }> = [];

    // Pegar uma janela de 7 dias ao redor do diaSelecionadoNum para mostrar no gráfico
    const startDay = Math.max(1, Math.min(diaSelecionadoNum - 3, total - 6));
    const endDay = Math.min(total, startDay + 6);

    for (let d = startDay; d <= endDay; d++) {
      const dia = desafioData.dias[d] || desafioData.dias[String(d) as any];
      const tarefasValidas = dia && Array.isArray(dia.tarefas) ? dia.tarefas : [];

      let menteConcluidas = 0;
      let corpoConcluidas = 0;
      let profissionalConcluidas = 0;

      tarefasValidas.forEach(t => {
        if (t.concluida) {
          // Heurística de retrocompatibilidade para tarefas sem categoria
          let cat = t.categoria;
          if (!cat) {
            const nomeL = t.nome.toLowerCase();
            if (nomeL.includes("inglês") || nomeL.includes("conhecimento") || nomeL.includes("estudar") || nomeL.includes("leitura") || nomeL.includes("livro") || nomeL.includes("aprender") || nomeL.includes("curso")) {
              cat = "Mente";
            } else if (nomeL.includes("treino") || nomeL.includes("academia") || nomeL.includes("saúde") || nomeL.includes("água") || nomeL.includes("caminhada") || nomeL.includes("comer") || nomeL.includes("limpo") || nomeL.includes("físico") || nomeL.includes("exercício") || nomeL.includes("exercicio") || nomeL.includes("cardio") || nomeL.includes("alongamento") || nomeL.includes("dieta") || nomeL.includes("alimentação")) {
              cat = "Corpo";
            } else {
              cat = "Profissional";
            }
          }

          if (cat === "Mente") menteConcluidas++;
          else if (cat === "Corpo") corpoConcluidas++;
          else if (cat === "Profissional") profissionalConcluidas++;
        }
      });

      dados.push({
        name: formatarDataCurta(obterDataDia(d)),
        Mente: menteConcluidas,
        Corpo: corpoConcluidas,
        Profissional: profissionalConcluidas
      });
    }

    return dados;
  }, [desafioData, diaSelecionadoNum]);

  // Estatísticas do Desafio
  const stats = useMemo(() => {
    const total = desafioData?.totalDias || 180;
    let concluidos = 0;
    let totalTarefas = 0;
    let tarefasConcluidas = 0;

    // Para calcular a Consistência Média (Média de Execução):
    // 1. Primeiro identificamos o "último dia ativo/executado" pelo usuário.
    // Consideramos o maior número de dia que tem pelo menos uma tarefa concluída, ou o diaSelecionadoNum.
    let ultimoDiaExecutado = 1;
    const diasValidos = desafioData?.dias ? Object.values(desafioData.dias) : [];

    diasValidos.forEach((dia) => {
      if (!dia) return;
      if (dia.concluido) concluidos++;
      
      const tarefasValidas = Array.isArray(dia.tarefas) ? dia.tarefas : [];
      const temTarefaConcluida = tarefasValidas.some(t => t && t.concluida);
      
      if (temTarefaConcluida && dia.numero > ultimoDiaExecutado) {
        ultimoDiaExecutado = dia.numero;
      }

      tarefasValidas.forEach((t) => {
        if (!t) return;
        totalTarefas++;
        if (t.concluida) tarefasConcluidas++;
      });
    });

    // Garantir que consideramos pelo menos o dia selecionado atual se ele for maior que o último dia com tarefas concluídas
    if (diaSelecionadoNum > ultimoDiaExecutado) {
      // Mas só expandimos o limite se o dia selecionado possuir alguma tarefa concluída ou se for o dia atual que o usuário está editando
      const diaSel = desafioData.dias[diaSelecionadoNum] || desafioData.dias[String(diaSelecionadoNum) as any];
      const temTarefaConcluidaNoSel = diaSel && Array.isArray(diaSel.tarefas) && diaSel.tarefas.some(t => t.concluida);
      if (temTarefaConcluidaNoSel) {
        ultimoDiaExecutado = diaSelecionadoNum;
      }
    }

    // 2. Agora calculamos a média de execução diária APENAS do Dia 1 até o ultimoDiaExecutado.
    let somaPorcentagensDiarias = 0;
    let diasConsideradosCount = 0;

    for (let d = 1; d <= ultimoDiaExecutado; d++) {
      const dia = desafioData.dias[d] || desafioData.dias[String(d) as any];
      if (!dia) continue;

      const tarefasValidas = Array.isArray(dia.tarefas) ? dia.tarefas : [];
      let tarefasDoDiaTotal = 0;
      let tarefasDoDiaConcluidas = 0;

      tarefasValidas.forEach((t) => {
        if (!t) return;
        tarefasDoDiaTotal++;
        if (t.concluida) {
          tarefasDoDiaConcluidas++;
        }
      });

      // Se o dia tem tarefas configuradas, calculamos o aproveitamento dele (ex: 2 de 3 = 66%)
      if (tarefasDoDiaTotal > 0) {
        somaPorcentagensDiarias += (tarefasDoDiaConcluidas / tarefasDoDiaTotal) * 100;
        diasConsideradosCount++;
      }
    }

    const porcentagemDias = total > 0 ? Math.round((concluidos / total) * 100) : 0;
    const porcentagemTarefas = totalTarefas > 0 ? Math.round((tarefasConcluidas / totalTarefas) * 100) : 0;
    
    // Consistência Média: média aritmética das porcentagens de execução diária até o último dia ativo
    const consistenciaMedia = diasConsideradosCount > 0 
      ? Math.round(somaPorcentagensDiarias / diasConsideradosCount) 
      : 0;

    return {
      total,
      concluidos,
      porcentagemDias,
      totalTarefas,
      tarefasConcluidas,
      porcentagemTarefas,
      consistenciaMedia
    };
  }, [desafioData]);

  const diaSelecionado = useMemo(() => {
    const num = diaSelecionadoNum;
    return desafioData.dias[num] || desafioData.dias[String(num) as any] || { numero: num, concluido: false, tarefas: [] };
  }, [desafioData, diaSelecionadoNum]);

  // Filtrar os dias no grid
  const diasFiltrados = useMemo(() => {
    const total = desafioData?.totalDias || 180;
    const todosDias = Array.from({ length: total }, (_, i) => i + 1);
    
    if (filtroDia === "todos") return todosDias;
    
    return todosDias.filter((num) => {
      const dia = desafioData.dias[num] || desafioData.dias[String(num) as any];
      if (!dia) return filtroDia === "pendentes"; // Se o dia não existe no BD, por padrão está pendente
      return filtroDia === "concluidos" ? dia.concluido : !dia.concluido;
    });
  }, [desafioData, filtroDia]);

  // Agrupar os dias por mês para exibição em formato de calendário real
  const mesesAgrupados = useMemo(() => {
    const total = desafioData?.totalDias || 180;
    const todosDias = Array.from({ length: total }, (_, i) => i + 1);
    
    // Filtramos os dias com base no filtro selecionado
    const diasFiltradosSet = new Set(diasFiltrados);

    const meses: {
      [chaveMes: string]: {
        nome: string;
        ano: number;
        mesIndex: number;
        dias: Array<{ numeroDia: number; data: Date; vazio: boolean }>;
      };
    } = {};

    todosDias.forEach((num) => {
      const data = obterDataDia(num);
      const ano = data.getFullYear();
      const mesIndex = data.getMonth();
      const nomeMeses = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
      ];
      const chaveMes = `${ano}-${mesIndex}`;

      if (!meses[chaveMes]) {
        meses[chaveMes] = {
          nome: nomeMeses[mesIndex],
          ano,
          mesIndex,
          dias: []
        };
      }

      // Se o dia corrido passa pelo filtro, nós o adicionamos
      if (diasFiltradosSet.has(num)) {
        meses[chaveMes].dias.push({
          numeroDia: num,
          data,
          vazio: false
        });
      }
    });

    // Para cada mês, precisamos alinhar os dias com os dias da semana (células vazias no início)
    // Apenas se o filtro estiver como "todos", para não quebrar a estrutura do calendário.
    // Se houver filtros de concluídos/pendentes, exibimos em grid corrido simples para não ficar buracos confusos.
    const mesesOrdenados = Object.values(meses).sort((a, b) => {
      if (a.ano !== b.ano) return a.ano - b.ano;
      return a.mesIndex - b.mesIndex;
    });

    if (filtroDia === "todos") {
      mesesOrdenados.forEach((m) => {
        if (m.dias.length === 0) return;
        
        // Descobrir qual o dia da semana do primeiro dia deste mês que está no desafio
        const primeiroDiaValido = m.dias[0];
        const primeiroDiaData = primeiroDiaValido.data;
        
        // Se for o primeiro dia real do mês (dia 1 do mês), podemos alinhar perfeitamente.
        // Mas se for o início do desafio (01/07/2026), calha de ser o dia 1 do mês também.
        // Caso o primeiro dia do desafio naquele mês não seja o dia 1 do mês (por exemplo, se o desafio começasse no dia 15),
        // alinharíamos com base no dia real do mês. Como começa em 01/07/2026, é perfeito.
        const diaSemanaPrimeiro = primeiroDiaData.getDay(); // 0 = Domingo, 1 = Segunda, etc.
        
        // Adicionar células vazias antes do primeiro dia para alinhar com o dia da semana
        const vazios: Array<{ numeroDia: number; data: Date; vazio: boolean }> = [];
        for (let i = 0; i < diaSemanaPrimeiro; i++) {
          vazios.push({
            numeroDia: -1 - i,
            data: new Date(),
            vazio: true
          });
        }
        m.dias = [...vazios, ...m.dias];
      });
    }

    return mesesOrdenados;
  }, [desafioData, diasFiltrados, filtroDia, obterDataDia]);

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

      // O dia é considerado concluído (verde no grid) se tiver PELO MENOS 1 tarefa concluída!
      const diaConcluido = novasTarefas.length > 0 ? novasTarefas.some((t) => t.concluida) : false;

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
      dataCriacao: new Date().toISOString(),
      categoria: novaRegraCategoria
    };

    const novasRegras = [...(desafioData.regras || []), novaRegra];
    const novosDias = { ...desafioData.dias };
    const total = desafioData?.totalDias || 180;

    // Aplicar a nova regra retroativamente apenas nos dias NÃO concluídos
    for (let d = 1; d <= total; d++) {
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
            regraId: novaRegra.id,
            categoria: novaRegra.categoria
          }
        ];

        novosDias[d] = {
          ...dia,
          tarefas: novasTarefas,
          // O dia é considerado concluído se tiver pelo menos 1 tarefa concluída
          concluido: novasTarefas.length > 0 ? novasTarefas.some((t) => t.concluida) : false
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

    const novasRegras = (desafioData.regras || []).filter((r) => r.id !== regraId);
    const novosDias = { ...desafioData.dias };
    const total = desafioData?.totalDias || 180;

    // Remover as tarefas associadas a essa regra de todos os dias
    for (let d = 1; d <= total; d++) {
      const diaExistente = novosDias[d] || novosDias[String(d) as any];
      if (diaExistente) {
        const dia = { ...diaExistente };
        const novasTarefas = (dia.tarefas || []).filter((t) => t.regraId !== regraId);
        novosDias[d] = {
          ...dia,
          tarefas: novasTarefas,
          // O dia é considerado concluído se tiver pelo menos 1 tarefa concluída
          concluido: novasTarefas.length > 0 ? novasTarefas.some((t) => t.concluida) : dia.concluido
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

    const totalAtual = desafioData?.totalDias || 180;
    const novoTotal = totalAtual + 100;
    const novosDias = { ...desafioData.dias };

    for (let d = totalAtual + 1; d <= novoTotal; d++) {
      const tarefas: TarefaDia[] = [];
      (desafioData.regras || []).forEach((regra) => {
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
            regraId: regra.id,
            categoria: regra.categoria
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
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-zinc-900 via-neutral-950 to-zinc-900 border border-zinc-800/80 p-5 md:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-48 h-48 rounded-full bg-emerald-500/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 -mb-6 -ml-6 w-48 h-48 rounded-full bg-blue-500/5 blur-3xl" />
        
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> Desafio de Consistência
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Painel dos {stats.total} Dias Corridos
            </h1>
            <p className="text-zinc-400 text-xs md:text-sm leading-relaxed">
              Monitore a sua disciplina diária. Cadastre tarefas recorrentes que aparecem de forma automática a cada dia e dê check-in na sua evolução contínua.
            </p>
          </div>

          {/* Gerenciamento de Regras (Botão que abre Modal) */}
          <div className="flex items-center gap-3 w-full xl:w-auto shrink-0">
            <Dialog open={modalRegrasAberto} onOpenChange={setModalRegrasAberto}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full xl:w-auto border-zinc-800 bg-zinc-950 hover:bg-zinc-900 text-zinc-300 hover:text-white flex items-center justify-center gap-2 text-xs md:text-sm py-5 md:py-4">
                  <Settings2 className="w-4 h-4" /> Configurar Tarefas Diárias
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-100 max-w-[92vw] sm:max-w-lg rounded-xl">
                <DialogHeader>
                  <DialogTitle className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                    <Clock className="w-5 h-5 text-emerald-500" /> Tarefas Recorrentes
                  </DialogTitle>
                  <DialogDescription className="text-zinc-400 text-xs md:text-sm">
                    Configure as tarefas que serão geradas de forma automatizada para os dias.
                  </DialogDescription>
                </DialogHeader>

                {/* Lista de regras atuais */}
                <div className="space-y-3 my-2 max-h-[180px] overflow-y-auto pr-1">
                  <Label className="text-zinc-300 text-xs md:text-sm font-semibold">Tarefas Ativas:</Label>
                  {(desafioData?.regras || []).length === 0 ? (
                    <div className="text-center py-4 text-zinc-500 border border-dashed border-zinc-800 rounded-lg text-xs">
                      Nenhuma tarefa recorrente cadastrada ainda.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {(desafioData.regras || []).map((regra) => (
                        <div key={regra.id} className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs md:text-sm">
                          <div className="space-y-0.5">
                            <p className="font-semibold text-white leading-tight">{regra.nome}</p>
                            <p className="text-[10px] md:text-xs text-zinc-400">
                              {regra.tipo === "diaria" ? "Todo santo dia" : `A cada ${regra.intervaloDias} dias`}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoverRegra(regra.id, regra.nome)}
                            className="text-zinc-500 hover:text-red-400 hover:bg-red-500/10 h-8 w-8 shrink-0"
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
                <form onSubmit={handleAdicionarRegra} className="space-y-3.5 pt-1">
                  <Label className="text-zinc-300 text-xs md:text-sm font-semibold">Cadastrar Nova Tarefa:</Label>
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="nome" className="text-[10px] md:text-xs text-zinc-400">O que você precisa fazer?</Label>
                      <Input
                        id="nome"
                        placeholder="Ex: Beber 3L de água, Estudar inglês..."
                        value={novaRegraNome}
                        onChange={(e) => setNovaRegraNome(e.target.value)}
                        className="bg-zinc-900 border-zinc-800 text-white placeholder-zinc-600 focus:border-emerald-500 focus:ring-emerald-500/20 text-xs md:text-sm h-10"
                        disabled={!autenticado}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="categoria" className="text-[10px] md:text-xs text-zinc-400">Categoria (Área de Foco)</Label>
                      <Select
                        value={novaRegraCategoria}
                        onValueChange={(v) => setNovaRegraCategoria(v as "Mente" | "Corpo" | "Profissional")}
                        disabled={!autenticado}
                      >
                        <SelectTrigger id="categoria" className="bg-zinc-900 border-zinc-800 text-zinc-300 text-xs md:text-sm h-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-300">
                          <SelectItem value="Mente">Mente (Inglês, Conhecimento, etc.)</SelectItem>
                          <SelectItem value="Corpo">Corpo (Treino, Academia, Saúde, etc.)</SelectItem>
                          <SelectItem value="Profissional">Profissional (Trabalho, Negócios, etc.)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="tipo" className="text-[10px] md:text-xs text-zinc-400">Frequência</Label>
                        <Select
                          value={novaRegraTipo}
                          onValueChange={(v) => setNovaRegraTipo(v as "diaria" | "intervalo")}
                          disabled={!autenticado}
                        >
                          <SelectTrigger id="tipo" className="bg-zinc-900 border-zinc-800 text-zinc-300 text-xs md:text-sm h-10">
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
                          <Label htmlFor="intervalo" className="text-[10px] md:text-xs text-zinc-400">Dias de intervalo</Label>
                          <Input
                            id="intervalo"
                            type="number"
                            min="2"
                            value={novaRegraIntervalo}
                            onChange={(e) => setNovaRegraIntervalo(e.target.value)}
                            className="bg-zinc-900 border-zinc-800 text-white text-xs md:text-sm h-10"
                            disabled={!autenticado}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <DialogFooter className="pt-2">
                    <Button 
                      type="submit" 
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs md:text-sm h-10"
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
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-6 pt-5 border-t border-zinc-800/60">
          <div className="space-y-1">
            <span className="text-[10px] md:text-xs text-zinc-500 uppercase tracking-wider font-semibold">Dias Concluídos</span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl md:text-2xl font-bold text-white">{stats.concluidos}</span>
              <span className="text-xs text-zinc-500">de {stats.total} dias</span>
            </div>
            <Progress value={stats.porcentagemDias} className="h-1.5 bg-zinc-800 [&>div]:bg-emerald-500" />
          </div>

          <div className="space-y-1">
            <span className="text-[10px] md:text-xs text-zinc-500 uppercase tracking-wider font-semibold">Total de Checks</span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl md:text-2xl font-bold text-white">{stats.tarefasConcluidas}</span>
              <span className="text-xs text-zinc-500">de {stats.totalTarefas} tarefas</span>
            </div>
            <Progress value={stats.porcentagemTarefas} className="h-1.5 bg-zinc-800 [&>div]:bg-blue-500" />
          </div>

          <div className="flex items-center justify-start sm:justify-center pt-2 sm:pt-0">
            <div className="text-left sm:text-center">
              <span className="text-[10px] md:text-xs text-zinc-500 block uppercase tracking-wider font-semibold">Consistência Geral</span>
              <span className="text-2xl md:text-3xl font-extrabold text-emerald-400">{stats.porcentagemDias}%</span>
              <span className="text-[9px] text-zinc-500 block mt-0.5">Dias 100% feitos</span>
            </div>
          </div>

          <div className="flex items-center justify-start sm:justify-end pt-2 sm:pt-0">
            <div className="text-left sm:text-right">
              <span className="text-[10px] md:text-xs text-zinc-500 block uppercase tracking-wider font-semibold">Consistência Média</span>
              <span className="text-2xl md:text-3xl font-extrabold text-cyan-400">{stats.consistenciaMedia}%</span>
              <span className="text-[9px] text-zinc-500 block mt-0.5">Média de execução diária</span>
            </div>
          </div>
        </div>

        {/* Gráfico de Evolução das Três Categorias (Mente, Corpo, Profissional) */}
        <div className="mt-6 pt-5 border-t border-zinc-800/60 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <h4 className="text-xs md:text-sm font-bold text-white uppercase tracking-tight flex items-center gap-1.5">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                Evolução Semanal por Categoria
              </h4>
              <p className="text-[10px] md:text-xs text-zinc-400">Tarefas concluídas nos últimos 7 dias ao redor do dia selecionado</p>
            </div>
            
            {/* Legenda Premium do Gráfico */}
            <div className="flex flex-wrap gap-3 text-[9px] md:text-[10px] font-semibold">
              <div className="flex items-center gap-1.5 bg-zinc-900/40 px-2 py-0.5 rounded-full border border-zinc-800/40">
                <span className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_6px_rgba(6,182,212,0.4)]" />
                <span className="text-zinc-300">Mente</span>
              </div>
              <div className="flex items-center gap-1.5 bg-zinc-900/40 px-2 py-0.5 rounded-full border border-zinc-800/40">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.4)]" />
                <span className="text-zinc-300">Corpo</span>
              </div>
              <div className="flex items-center gap-1.5 bg-zinc-900/40 px-2 py-0.5 rounded-full border border-zinc-800/40">
                <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.4)]" />
                <span className="text-zinc-300">Profissional</span>
              </div>
            </div>
          </div>

          <div className="h-48 w-full bg-zinc-950/40 border border-zinc-800/40 rounded-xl p-3 md:p-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={dadosEvolucao}
                margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
              >
                <defs>
                  {/* Gradiente Mente (Ciano) */}
                  <linearGradient id="colorMenteDesafio" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0}/>
                  </linearGradient>
                  {/* Gradiente Corpo (Verde) */}
                  <linearGradient id="colorCorpoDesafio" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                  </linearGradient>
                  {/* Gradiente Profissional (Rosa/Vermelho) */}
                  <linearGradient id="colorProfissionalDesafio" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>

                <CartesianGrid 
                  vertical={false} 
                  stroke="#27272a" 
                  strokeOpacity={0.3}
                />

                <XAxis 
                  dataKey="name" 
                  stroke="#52525b" 
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  dy={5}
                />
                <YAxis 
                  stroke="#52525b" 
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                  dx={-5}
                />
                
                <Tooltip 
                  cursor={{ stroke: "rgba(255, 255, 255, 0.05)", strokeWidth: 1 }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-zinc-950/95 border border-zinc-800 p-2.5 rounded-lg shadow-2xl backdrop-blur-md text-xs space-y-1.5">
                          <p className="font-bold text-white text-center border-b border-zinc-900 pb-1">{payload[0].payload.name}</p>
                          <div className="space-y-1">
                            {payload.map((p: any) => (
                              <div key={p.name} className="flex items-center justify-between gap-5">
                                <div className="flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.color }} />
                                  <span className="text-zinc-400">{p.name}:</span>
                                </div>
                                <span className="font-bold text-white">{p.value} {p.value === 1 ? "feita" : "feitas"}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />

                {/* Área 1: Mente */}
                <Area
                  type="monotone"
                  dataKey="Mente"
                  stroke="#06b6d4"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorMenteDesafio)"
                  dot={{ stroke: '#fff', strokeWidth: 1, r: 3, fill: "#06b6d4" }}
                  activeDot={{ stroke: '#fff', strokeWidth: 1.5, r: 4.5, fill: "#06b6d4" }}
                />

                {/* Área 2: Corpo */}
                <Area
                  type="monotone"
                  dataKey="Corpo"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorCorpoDesafio)"
                  dot={{ stroke: '#fff', strokeWidth: 1, r: 3, fill: "#10b981" }}
                  activeDot={{ stroke: '#fff', strokeWidth: 1.5, r: 4.5, fill: "#10b981" }}
                />

                {/* Área 3: Profissional */}
                <Area
                  type="monotone"
                  dataKey="Profissional"
                  stroke="#f43f5e"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorProfissionalDesafio)"
                  dot={{ stroke: '#fff', strokeWidth: 1, r: 3, fill: "#f43f5e" }}
                  activeDot={{ stroke: '#fff', strokeWidth: 1.5, r: 4.5, fill: "#f43f5e" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Grid Principal: Lateral Esquerda com Dias / Lateral Direita com Detalhes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Grid de Dias (Esquerda) */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-500" />
              <h2 className="text-base md:text-lg font-bold text-white">Selecione o Dia Corrido</h2>
            </div>
            
            {/* Filtros de Dias */}
            <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded-lg p-0.5 text-[11px] md:text-xs w-full sm:w-auto justify-between sm:justify-start">
              <button
                onClick={() => setFiltroDia("todos")}
                className={`flex-1 sm:flex-none px-3 py-1.5 rounded-md font-medium transition-colors ${
                  filtroDia === "todos" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setFiltroDia("concluidos")}
                className={`flex-1 sm:flex-none px-3 py-1.5 rounded-md font-medium transition-colors ${
                  filtroDia === "concluidos" ? "bg-emerald-950/40 text-emerald-400 border border-emerald-800/30" : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Concluídos
              </button>
              <button
                onClick={() => setFiltroDia("pendentes")}
                className={`flex-1 sm:flex-none px-3 py-1.5 rounded-md font-medium transition-colors ${
                  filtroDia === "pendentes" ? "bg-amber-950/40 text-amber-400 border border-amber-800/30" : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Pendentes
              </button>
            </div>
          </div>

          {/* Grid Scrollable de Dias (Calendário Real) */}
          <div className="bg-zinc-950 border border-zinc-800/60 rounded-xl p-3 md:p-5 shadow-xl">
            {diasFiltrados.length === 0 ? (
              <div className="text-center py-12 text-zinc-500 text-sm">
                Nenhum dia encontrado para o filtro selecionado.
              </div>
            ) : filtroDia !== "todos" ? (
              // Se tiver filtros ativos (Concluídos ou Pendentes), exibe uma lista corrida simples para não quebrar a lógica visual do calendário
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-[480px] overflow-y-auto pr-1 scrollbar-thin">
                {diasFiltrados.map((num) => {
                  const dia = desafioData?.dias[num] || desafioData?.dias[String(num) as any];
                  const isConcluido = dia?.concluido;
                  const tarefasValidas = dia && Array.isArray(dia.tarefas) ? dia.tarefas : [];
                  const temTarefas = tarefasValidas.length > 0;
                  const isSelecionado = num === diaSelecionadoNum;
                  const dataReal = obterDataDia(num);

                  return (
                    <button
                      key={num}
                      onClick={() => setDiaSelecionadoNum(num)}
                      className={`relative rounded-xl flex flex-col items-center justify-center transition-all border p-1.5 h-14 w-full shrink-0 ${
                        isSelecionado
                          ? "bg-emerald-600 text-white border-emerald-400 shadow-lg scale-102 z-10 ring-2 ring-emerald-500/20 font-bold"
                          : isConcluido
                          ? "bg-emerald-950/30 text-emerald-400 border-emerald-800/40 hover:bg-emerald-950/50"
                          : temTarefas
                          ? "bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/80"
                          : "bg-zinc-950 text-zinc-600 border-zinc-900 cursor-not-allowed"
                      }`}
                    >
                      <span className="text-[7px] sm:text-[8px] opacity-60 font-medium block uppercase">{formatarDiaSemana(dataReal)}</span>
                      <span className="text-xs sm:text-sm font-extrabold block mt-0.5">{String(dataReal.getDate()).padStart(2, "0")}</span>
                      <span className="text-[7px] opacity-50 block">{formatarDataCurta(dataReal)}</span>
                      
                      {isConcluido && !isSelecionado && (
                        <div className="absolute bottom-1 w-1 h-1 rounded-full bg-emerald-400" />
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              // Calendário Real por Meses (com cabeçalhos de dias da semana e alinhamento perfeito)
              <div className="space-y-6 max-h-[480px] overflow-y-auto pr-1 scrollbar-thin">
                {mesesAgrupados.map((mes) => (
                  <div key={`${mes.ano}-${mes.mesIndex}`} className="space-y-2 border-b border-zinc-900/60 pb-4 last:border-b-0 last:pb-0">
                    <h3 className="text-xs md:text-sm font-bold text-zinc-300 flex items-center justify-between px-1">
                      <span className="uppercase tracking-wider">{mes.nome}</span>
                      <span className="text-[10px] text-zinc-500 font-semibold">{mes.ano}</span>
                    </h3>
                    
                    {/* Cabeçalho de Dias da Semana (D S T Q Q S S) */}
                    <div className="grid grid-cols-7 gap-1 text-center text-[9px] md:text-[10px] font-bold text-zinc-500 pb-1">
                      <span>D</span>
                      <span>S</span>
                      <span>T</span>
                      <span>Q</span>
                      <span>Q</span>
                      <span>S</span>
                      <span>S</span>
                    </div>

                    {/* Grade de Dias do Mês */}
                    <div className="grid grid-cols-7 gap-1">
                      {mes.dias.map((d, idx) => {
                        if (d.vazio) {
                          return <div key={`vazio-${mes.ano}-${mes.mesIndex}-${idx}`} className="h-8 md:h-10 w-full rounded-md bg-transparent" />;
                        }

                        const num = d.numeroDia;
                        const dia = desafioData?.dias[num] || desafioData?.dias[String(num) as any];
                        const isConcluido = dia?.concluido;
                        const tarefasValidas = dia && Array.isArray(dia.tarefas) ? dia.tarefas : [];
                        const temTarefas = tarefasValidas.length > 0;
                        const isSelecionado = num === diaSelecionadoNum;
                        const diaDoMes = d.data.getDate();

                        return (
                          <button
                            key={num}
                            onClick={() => setDiaSelecionadoNum(num)}
                            className={`relative rounded-lg flex flex-col items-center justify-center transition-all border h-8 md:h-10 w-full text-[10px] md:text-xs font-semibold ${
                              isSelecionado
                                ? "bg-emerald-600 text-white border-emerald-400 shadow-md scale-105 z-10 font-bold"
                                : isConcluido
                                ? "bg-emerald-950/40 text-emerald-400 border-emerald-900/50 hover:bg-emerald-950/60"
                                : temTarefas
                                ? "bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/80"
                                : "bg-zinc-950 text-zinc-600 border-zinc-900 cursor-not-allowed"
                            }`}
                            title={`Dia ${num} (${formatarDataCurta(d.data)})`}
                          >
                            <span>{diaDoMes}</span>
                            
                            {/* Pequeno indicador de tarefas concluídas no dia */}
                            {isConcluido && !isSelecionado && (
                              <div className="absolute bottom-0.5 w-1 h-1 rounded-full bg-emerald-400 shadow-[0_0_4px_rgba(52,211,153,0.6)]" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Opção de construir mais 100 dias no final do grid */}
            <div className="mt-4 md:mt-6 pt-4 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-[10px] md:text-xs text-zinc-500 flex items-center gap-1.5 text-center sm:text-left">
                <Info className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                Clique em um dia para ver ou marcar as tarefas dele no painel lateral.
              </div>
              <Button
                onClick={handleExpandirMais100}
                className="w-full sm:w-auto bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 hover:text-white font-bold text-xs py-2 px-4 flex items-center justify-center gap-2"
                disabled={!autenticado}
                title={!autenticado ? "Faça login para expandir o desafio" : "Adicionar mais 100 dias"}
              >
                <Plus className="w-4 h-4" /> Expandir mais 100 Dias
              </Button>
            </div>
          </div>
        </div>

        {/* Detalhes do Dia Selecionado (Direita) */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <h2 className="text-base md:text-lg font-bold text-white">Checklist do Dia</h2>
          </div>

          <Card className="bg-zinc-950 border-zinc-800/60 shadow-2xl relative overflow-hidden rounded-xl">
            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
            
            <CardHeader className="pb-3 md:pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl md:text-2xl font-extrabold text-white flex flex-col sm:flex-row sm:items-center gap-2">
                    <span>Dia {diaSelecionadoNum}</span>
                    <span className="text-zinc-500 text-xs sm:text-sm font-medium hidden sm:inline">—</span>
                    <span className="text-zinc-400 text-xs sm:text-sm font-semibold">{formatarDataLonga(obterDataDia(diaSelecionadoNum))}</span>
                  </CardTitle>
                  <CardDescription className="text-zinc-400 text-[11px] md:text-xs mt-0.5">
                    {diaSelecionado.concluido 
                      ? "Todas as obrigações concluídas!" 
                      : "Checklist pendente para hoje."}
                  </CardDescription>
                </div>
                
                {/* Botão de Check Rápido do Dia Inteiro */}
                {Array.isArray(diaSelecionado.tarefas) && diaSelecionado.tarefas.length > 0 && (
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
              {!Array.isArray(diaSelecionado.tarefas) || diaSelecionado.tarefas.length === 0 ? (
                <div className="text-center py-8 text-zinc-500 text-xs md:text-sm border border-dashed border-zinc-800 rounded-lg p-4">
                  Nenhuma tarefa recorrente ativa para este dia.
                  <p className="text-[10px] md:text-xs text-zinc-600 mt-1">Cadastre tarefas diárias no botão de configurações acima.</p>
                </div>
              ) : (
                <div className="space-y-2 md:space-y-2.5">
                  {diaSelecionado.tarefas.map((tarefa) => {
                    // Descobrir a categoria da tarefa (com heurística de retrocompatibilidade se não tiver salva)
                    let cat = tarefa.categoria;
                    if (!cat) {
                      const nomeL = tarefa.nome.toLowerCase();
                      if (nomeL.includes("inglês") || nomeL.includes("conhecimento") || nomeL.includes("estudar") || nomeL.includes("leitura") || nomeL.includes("livro") || nomeL.includes("aprender") || nomeL.includes("curso")) {
                        cat = "Mente";
                      } else if (nomeL.includes("treino") || nomeL.includes("academia") || nomeL.includes("saúde") || nomeL.includes("água") || nomeL.includes("caminhada") || nomeL.includes("comer") || nomeL.includes("limpo") || nomeL.includes("físico") || nomeL.includes("exercício") || nomeL.includes("exercicio") || nomeL.includes("cardio") || nomeL.includes("alongamento") || nomeL.includes("dieta") || nomeL.includes("alimentação")) {
                        cat = "Corpo";
                      } else {
                        cat = "Profissional";
                      }
                    }

                    // Definir classes de cores neon baseadas na categoria
                    let corBorda = "border-zinc-800/80 hover:border-zinc-700";
                    let corTextoCategoria = "text-zinc-400";
                    let bgEtiqueta = "bg-zinc-900/50 border-zinc-800/60";
                    let corPonto = "bg-zinc-500";

                    if (cat === "Mente") {
                      corBorda = tarefa.concluida ? "border-cyan-950/40" : "border-cyan-950/60 hover:border-cyan-500/40";
                      corTextoCategoria = "text-cyan-400";
                      bgEtiqueta = "bg-cyan-950/20 border-cyan-800/20";
                      corPonto = "bg-cyan-500 shadow-[0_0_6px_rgba(6,182,212,0.4)]";
                    } else if (cat === "Corpo") {
                      corBorda = tarefa.concluida ? "border-emerald-950/40" : "border-emerald-950/60 hover:border-emerald-500/40";
                      corTextoCategoria = "text-emerald-400";
                      bgEtiqueta = "bg-emerald-950/20 border-emerald-800/20";
                      corPonto = "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.4)]";
                    } else if (cat === "Profissional") {
                      corBorda = tarefa.concluida ? "border-rose-950/40" : "border-rose-950/60 hover:border-rose-500/40";
                      corTextoCategoria = "text-rose-400";
                      bgEtiqueta = "bg-rose-950/20 border-rose-800/20";
                      corPonto = "bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.4)]";
                    }

                    return (
                      <button
                        key={tarefa.id}
                        onClick={() => handleToggleTarefa(diaSelecionadoNum, tarefa.id)}
                        className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-all group ${
                          tarefa.concluida
                            ? "bg-zinc-950/40 text-zinc-500"
                            : "bg-zinc-900/40 text-zinc-200 hover:bg-zinc-900"
                        } ${corBorda}`}
                      >
                        <div className="mt-0.5 shrink-0 transition-transform group-active:scale-90">
                          {tarefa.concluida ? (
                            <CheckCircle2 className="w-4.5 h-4.5 md:w-5 md:h-5 text-emerald-500 fill-emerald-500/10" />
                          ) : (
                            <Circle className="w-4.5 h-4.5 md:w-5 md:h-5 text-zinc-600 group-hover:text-emerald-500" />
                          )}
                        </div>
                        
                        <div className="space-y-1.5 min-w-0 flex-1">
                          <span className={`text-xs md:text-sm font-semibold block leading-tight break-words ${
                            tarefa.concluida ? "line-through text-zinc-500 font-medium" : ""
                          }`}>
                            {tarefa.nome}
                          </span>
                          
                          <div className="flex flex-wrap items-center gap-2">
                            {/* Etiqueta de Categoria de Área de Foco */}
                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[9px] font-semibold uppercase tracking-wider ${bgEtiqueta} ${corTextoCategoria}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${corPonto}`} />
                              {cat}
                            </span>

                            {/* Indicador de Tipo de Recorrência Especial */}
                            {(desafioData?.regras || []).find(r => r.id === tarefa.regraId)?.tipo === "intervalo" && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[9px] font-semibold uppercase tracking-wider">
                                Recorrente Especial
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Detalhes rápidos de navegação */}
              <div className="flex items-center justify-between pt-4 border-t border-zinc-900 text-[10px] md:text-xs text-zinc-500">
                <button
                  onClick={() => setDiaSelecionadoNum(prev => Math.max(1, prev - 1))}
                  disabled={diaSelecionadoNum === 1}
                  className="flex items-center gap-1 hover:text-zinc-300 disabled:opacity-30"
                >
                  <ChevronLeft className="w-4 h-4" /> Anterior
                </button>
                <span className="font-medium flex items-center gap-1">
                  <span>Dia {diaSelecionadoNum}</span>
                  <span className="text-zinc-600 hidden sm:inline">|</span>
                  <span className="text-zinc-400 hidden sm:inline">{formatarDataCurta(obterDataDia(diaSelecionadoNum))}</span>
                </span>
                <button
                  onClick={() => setDiaSelecionadoNum(prev => Math.min(stats.total, prev + 1))}
                  disabled={diaSelecionadoNum === stats.total}
                  className="flex items-center gap-1 hover:text-zinc-300 disabled:opacity-30"
                >
                  Próximo <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
