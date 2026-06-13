import { Objetivo, Meta, Submeta, Etapa, DesafioDiasData, RegraRecorrencia, DiaCorrido, TarefaDia } from "./types";

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
      dataCriacao: new Date().toISOString(),
      categoria: "Mente"
    },
    {
      id: "regra-2",
      nome: "Treino / Academia",
      tipo: "diaria",
      dataCriacao: new Date().toISOString(),
      categoria: "Corpo"
    },
    {
      id: "regra-3",
      nome: "Revisão de Metas Comerciais",
      tipo: "intervalo",
      intervaloDias: 10,
      dataCriacao: new Date().toISOString(),
      categoria: "Profissional"
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
        regraId: regra.id,
        categoria: regra.categoria
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
            regraId: regraCompleta.id,
            categoria: regraCompleta.categoria
          }
        ];
        
        novosDias[d] = {
          ...dia,
          tarefas: novasTarefas,
          // O dia é considerado concluído se tiver pelo menos 1 tarefa concluída
          concluido: novasTarefas.length > 0 ? novasTarefas.some((t) => t.concluida) : dia.concluido
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
/**
 * Sincroniza as etapas das Metas/OKRs marcadas para sincronização diária com as regras de recorrência do desafio.
 */


/**
 * Sincroniza as etapas das Metas/OKRs marcadas para sincronização diária com as regras de recorrência do desafio.
 */
export function sincronizarEtapasComDesafio(
  desafio: DesafioDiasData,
  objetivos: Objetivo[]
): DesafioDiasData {
  let novoDesafio = { ...desafio };
  const totalDias = novoDesafio.totalDias || 180;
  
  // 1. Coletar todas as etapas que estão marcadas para sincronização diária nas metas
  const etapasSincronizadas: { id: string; nome: string; categoria: "Mente" | "Corpo" | "Profissional" }[] = [];
  
  objetivos.forEach((obj: Objetivo) => {
    obj.metas.forEach((meta: Meta) => {
      meta.submetas.forEach((sub: Submeta) => {
        if (Array.isArray(sub.etapas)) {
          sub.etapas.forEach((et: Etapa) => {
            if (et.sincronizarDesafio) {
              etapasSincronizadas.push({
                id: et.id,
                nome: et.nome,
                categoria: et.categoriaDesafio || "Mente"
              });
            }
          });
        }
      });
    });
  });

  // 2. Identificar quais regras do desafio vieram de etapas sincronizadas (usaremos um prefixo no ID, ex: "regra-etapa-{etapaId}")
  const regrasAtuais = [...(novoDesafio.regras || [])];
  const novasRegras: RegraRecorrencia[] = [];
  
  // Manter as regras puramente manuais (que não têm o prefixo "regra-etapa-")
  regrasAtuais.forEach((regra) => {
    if (!regra.id.startsWith("regra-etapa-")) {
      novasRegras.push(regra);
    }
  });

  // 3. Adicionar/Atualizar as regras que vêm das etapas sincronizadas
  etapasSincronizadas.forEach((et) => {
    const regraId = `regra-etapa-${et.id}`;
    novasRegras.push({
      id: regraId,
      nome: et.nome,
      tipo: "diaria",
      dataCriacao: new Date().toISOString(),
      categoria: et.categoria
    });
  });

  // Atualizar a lista de regras no desafio
  novoDesafio.regras = novasRegras;
  
  // 4. Reconciliar os dias do desafio
  const novosDias = { ...novoDesafio.dias };
  
  for (let d = 1; d <= totalDias; d++) {
    if (!novosDias[d]) {
      novosDias[d] = { numero: d, concluido: false, tarefas: [] };
    }
    
    const dia = novosDias[d];
    const tarefasDia = [...(dia.tarefas || [])];
    
    // Filtrar as tarefas atuais para remover aquelas de etapas que não estão mais sincronizadas
    let novasTarefasDia = tarefasDia.filter((t) => {
      if (t.regraId && t.regraId.startsWith("regra-etapa-")) {
        const etapaId = t.regraId.replace("regra-etapa-", "");
        return etapasSincronizadas.some((et) => et.id === etapaId);
      }
      return true;
    });

    // Adicionar ou atualizar as tarefas das etapas sincronizadas atuais
    etapasSincronizadas.forEach((et) => {
      const regraId = `regra-etapa-${et.id}`;
      const tarefaExistente = novasTarefasDia.find((t) => t.regraId === regraId);
      
      if (tarefaExistente) {
        // Se a tarefa já existe, apenas atualiza o nome e a categoria se mudaram
        tarefaExistente.nome = et.nome;
        tarefaExistente.categoria = et.categoria;
      } else {
        // Se não existe, cria a tarefa (apenas se o dia não estiver concluído para não estragar histórico)
        if (!dia.concluido) {
          novasTarefasDia.push({
            id: `t-${regraId}-${d}`,
            nome: et.nome,
            concluida: false,
            regraId: regraId,
            categoria: et.categoria
          });
        }
      }
    });

    novosDias[d] = {
      ...dia,
      tarefas: novasTarefasDia,
      concluido: novasTarefasDia.length > 0 ? novasTarefasDia.some((t) => t.concluida) : false
    };
  }

  novoDesafio.dias = novosDias;
  return novoDesafio;
}

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
      // O dia é considerado concluído se tiver pelo menos 1 tarefa concluída
      concluido: novasTarefas.length > 0 ? novasTarefas.some((t) => t.concluida) : false
    };
  }

  return {
    ...data,
    totalDias,
    regras: novasRegras,
    dias: novosDias
  };
}
