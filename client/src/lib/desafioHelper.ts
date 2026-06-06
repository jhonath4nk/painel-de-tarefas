import { DesafioDiasData, RegraRecorrencia, DiaCorrido, TarefaDia } from "./types";

/**
 * Cria a estrutura inicial do desafio de dias corridos.
 * Por padrão, inicia com 100 dias.
 */
export function inicializarDesafio(): DesafioDiasData {
  const regrasIniciais: RegraRecorrencia[] = [
    {
      id: "regra-1",
      nome: "Leitura de 15 páginas",
      tipo: "diaria",
      dataCriacao: new Date().toISOString()
    },
    {
      id: "regra-2",
      nome: "Treino físico de alta intensidade",
      tipo: "diaria",
      dataCriacao: new Date().toISOString()
    },
    {
      id: "regra-3",
      nome: "Revisão geral das metas de 10 dias",
      tipo: "intervalo",
      intervaloDias: 10,
      dataCriacao: new Date().toISOString()
    }
  ];

  const data: DesafioDiasData = {
    totalDias: 100,
    regras: regrasIniciais,
    dias: {}
  };

  // Gerar os primeiros 100 dias com base nas regras iniciais
  for (let d = 1; d <= 100; d++) {
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
      // Ex: a cada 2 dias -> d % 2 === 0
      // Ex: a cada 10 dias -> d % 10 === 0
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
  const novoTotal = data.totalDias + 100;
  const novosDias = { ...data.dias };

  for (let d = data.totalDias + 1; d <= novoTotal; d++) {
    novosDias[d] = gerarDiaComRegras(d, data.regras);
  }

  return {
    ...data,
    totalDias: novoTotal,
    dias: novosDias
  };
}

/**
 * Adiciona uma nova regra de recorrência e atualiza retroativamente/futuramente os dias
 * que ainda não foram concluídos ou todos os dias futuros que não tenham tarefas concluídas.
 */
export function adicionarRegraRecorrente(
  data: DesafioDiasData,
  novaRegra: Omit<RegraRecorrencia, "id" | "dataCriacao">
): DesafioDiasData {
  const regraCompleta: RegraRecorrencia = {
    ...novaRegra,
    id: `regra-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    dataCriacao: new Date().toISOString()
  };

  const novasRegras = [...data.regras, regraCompleta];
  const novosDias = { ...data.dias };

  // Aplicar a nova regra em todos os dias do desafio
  for (let d = 1; d <= data.totalDias; d++) {
    const dia = novosDias[d];
    let deveIncluir = false;

    if (regraCompleta.tipo === "diaria") {
      deveIncluir = true;
    } else if (regraCompleta.tipo === "intervalo" && regraCompleta.intervaloDias) {
      deveIncluir = d % regraCompleta.intervaloDias === 0;
    }

    if (deveIncluir) {
      // Evitar duplicados se por acaso já existir
      const existe = dia.tarefas.some((t) => t.regraId === regraCompleta.id);
      if (!existe) {
        const novasTarefas = [
          ...dia.tarefas,
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
    regras: novasRegras,
    dias: novosDias
  };
}

/**
 * Remove uma regra de recorrência e remove suas tarefas associadas nos dias onde ela não foi concluída.
 */
export function removerRegraRecorrente(data: DesafioDiasData, regraId: string): DesafioDiasData {
  const novasRegras = data.regras.filter((r) => r.id !== regraId);
  const novosDias = { ...data.dias };

  for (let d = 1; d <= data.totalDias; d++) {
    const dia = novosDias[d];
    
    // Filtra as tarefas removendo as que pertencem à regra excluída, 
    // exceto se já tiverem sido concluídas (para manter histórico se o usuário desejar, ou remove tudo se preferir)
    // Aqui vamos remover tudo relacionado à regra para manter limpo.
    const novasTarefas = dia.tarefas.filter((t) => t.regraId !== regraId);
    
    novosDias[d] = {
      ...dia,
      tarefas: novasTarefas,
      concluido: novasTarefas.length > 0 ? novasTarefas.every((t) => t.concluida) : false
    };
  }

  return {
    ...data,
    regras: novasRegras,
    dias: novosDias
  };
}
