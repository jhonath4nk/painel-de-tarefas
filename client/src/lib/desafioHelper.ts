import { DesafioDiasData, DiaCorrido, TarefaDia, RegraRecorrencia } from "./types";

/**
 * Cria a estrutura inicial do desafio de dias corridos.
 * Por padrão, inicia com 180 dias conforme nova solicitação.
 */
export function inicializarDesafio(): DesafioDiasData {
  const regrasIniciais: RegraRecorrencia[] = [
    {
      id: "regra-1",
      nome: "Inglês 15 min",
      tipo: "diaria",
      dataCriacao: new Date().toISOString()
    },
    {
      id: "regra-2",
      nome: "Treino / Academia",
      tipo: "diaria",
      dataCriacao: new Date().toISOString()
    },
    {
      id: "regra-3",
      nome: "Revisão de Metas Comerciais",
      tipo: "intervalo",
      intervaloDias: 10,
      dataCriacao: new Date().toISOString()
    }
  ];

  const data: DesafioDiasData = {
    totalDias: 180,
    regras: regrasIniciais,
    dias: {}
  };

  // Gerar os primeiros 180 dias com base nas regras iniciais
  for (let d = 1; d <= 180; d++) {
    data.dias[d] = gerarDiaComRegras(d, regrasIniciais);
  }

  return data;
}

/**
 * Gera um único dia com suas tarefas de acordo com as regras de recorrência ativas.
 */
export function gerarDiaComRegras(numeroDia: number, regras: RegraRecorrencia[]): DiaCorrido {
  const tarefas: TarefaDia[] = [];

  regras.forEach((regra) => {
    let deveIncluir = false;

    if (regra.tipo === "diaria") {
      deveIncluir = true;
    } else if (regra.tipo === "intervalo" && regra.intervaloDias) {
      deveIncluir = numeroDia % regra.intervaloDias === 0;
    }

    if (deveIncluir) {
      tarefas.push({
        id: `t-${regra.id}-${numeroDia}`,
        nome: regra.nome,
        concluida: false,
        regraId: regra.id
      });
    }
  });

  return {
    numero: numeroDia,
    concluido: false,
    tarefas
  };
}

/**
 * Expande o desafio adicionando mais 100 dias ao total de dias atual.
 */
export function expandirMais100Dias(data: DesafioDiasData): DesafioDiasData {
  const novoTotal = (data.totalDias || 180) + 100;
  const novosDias = { ...data.dias };

  for (let d = (data.totalDias || 180) + 1; d <= novoTotal; d++) {
    novosDias[d] = gerarDiaComRegras(d, data.regras || []);
  }

  return {
    ...data,
    totalDias: novoTotal,
    dias: novosDias
  };
}

/**
 * Adiciona uma nova regra de recorrência e atualiza os dias pendentes.
 * Preserva 100% o histórico dos dias que já foram marcados como concluídos!
 */
export function adicionarRegraRecorrente(
  data: DesafioDiasData,
  novaRegra: Omit<RegraRecorrencia, "id" | "dataCriacao">
): DesafioDiasData {
  const totalDias = data.totalDias || 180;
  const regraCompleta: RegraRecorrencia = {
    ...novaRegra,
    id: `regra-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    dataCriacao: new Date().toISOString()
  };

  const novasRegras = [...(data.regras || []), regraCompleta];
  const novosDias = { ...data.dias };

  // Aplicar a nova regra em todos os dias do desafio
  for (let d = 1; d <= totalDias; d++) {
    // Garante que o dia existe
    if (!novosDias[d]) {
      novosDias[d] = {
        numero: d,
        concluido: false,
        tarefas: []
      };
    }

    const dia = novosDias[d];

    // REGRA DE PRESERVAÇÃO: Se o dia já foi concluído pelo usuário, não adicionamos obrigações retroativas!
    if (dia.concluido) {
      continue;
    }

    let deveIncluir = false;
    if (regraCompleta.tipo === "diaria") {
      deveIncluir = true;
    } else if (regraCompleta.tipo === "intervalo" && regraCompleta.intervaloDias) {
      deveIncluir = d % regraCompleta.intervaloDias === 0;
    }

    if (deveIncluir) {
      const tarefasDia = dia.tarefas || [];
      const existe = tarefasDia.some((t) => t.regraId === regraCompleta.id);
      
      if (!existe) {
        const novasTarefas = [
          ...tarefasDia,
          {
            id: `t-${regraCompleta.id}-${d}`,
            nome: regraCompleta.nome,
            concluida: false,
            regraId: regraCompleta.id
          }
        ];
        
        novosDias[d] = {
          ...dia,
          tarefas: novasTarefas,
          concluido: novasTarefas.length > 0 ? novasTarefas.every((t) => t.concluida) : dia.concluido
        };
      }
    }
  }

  return {
    ...data,
    totalDias,
    regras: novasRegras,
    dias: novosDias
  };
}

/**
 * Remove uma regra de recorrência e remove suas tarefas associadas nos dias onde ela não foi concluída.
 */
export function removerRegraRecorrente(data: DesafioDiasData, regraId: string): DesafioDiasData {
  const totalDias = data.totalDias || 180;
  const novasRegras = (data.regras || []).filter((r) => r.id !== regraId);
  const novosDias = { ...data.dias };

  for (let d = 1; d <= totalDias; d++) {
    const dia = novosDias[d];
    if (!dia) continue;
    
    // Remove apenas as tarefas da regra removida
    const tarefasDia = dia.tarefas || [];
    const novasTarefas = tarefasDia.filter((t) => t.regraId !== regraId);
    
    novosDias[d] = {
      ...dia,
      tarefas: novasTarefas,
      concluido: novasTarefas.length > 0 ? novasTarefas.every((t) => t.concluida) : false
    };
  }

  return {
    ...data,
    totalDias,
    regras: novasRegras,
    dias: novosDias
  };
}
