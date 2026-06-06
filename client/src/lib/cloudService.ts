import { Objetivo, DesafioDiasData, DiaCorrido, TarefaDia, RegraRecorrencia } from "./types";
import { criptografar, descriptografar } from "./cripto";

const NAMESPACE = "jhonathan-metas-dashboard";
const WRITE_KEY = "67873783eef7d5502b1b5416e454b3ff0933fbc8f223b242323ba0d0ee49fa51";
const API_URL = `https://mantledb.sh/v2/${NAMESPACE}/metas_data`;

export type CloudSyncStatus = {
  status: "idle" | "syncing" | "success" | "error";
  message?: string;
  lastSync?: string;
};

// Interface do payload unificado que salvamos na nuvem
export interface PayloadUnificado {
  objetivos: Objetivo[];
  desafioDias?: DesafioDiasData;
}

/**
 * Compacta o desafio de dias para economizar espaço de armazenamento (limite de 64KB do MantleDB).
 * Remove as tarefas não concluídas de cada dia, pois elas podem ser geradas dinamicamente
 * no frontend a partir das regras de recorrência salvas.
 */
function compactarDesafio(desafio: DesafioDiasData): DesafioDiasData {
  const diasCompactados: Record<number, DiaCorrido> = {};

  Object.entries(desafio.dias).forEach(([diaNumStr, dia]) => {
    const diaNum = parseInt(diaNumStr);
    if (isNaN(diaNum) || !dia) return;

    // Filtra para salvar APENAS as tarefas que já foram CONCLUÍDAS.
    // As tarefas pendentes (concluida: false) serão regeneradas a partir das regras de recorrência.
    const tarefasConcluidas = (dia.tarefas || []).filter((t) => t.concluida);

    // Salvamos o dia apenas se ele estiver concluído, se tiver tarefas concluídas,
    // ou se o seu estado de conclusão estiver marcado como verdadeiro.
    if (dia.concluido || tarefasConcluidas.length > 0) {
      diasCompactados[diaNum] = {
        numero: diaNum,
        concluido: dia.concluido,
        tarefas: tarefasConcluidas.map((t) => ({
          id: t.id,
          nome: t.nome,
          concluida: true,
          regraId: t.regraId
        }))
      };
    }
  });

  return {
    totalDias: desafio.totalDias,
    regras: desafio.regras,
    dias: diasCompactados
  };
}

/**
 * Descompacta o desafio de dias carregado da nuvem.
 * Reconstrói todos os dias do desafio (até o totalDias) e injeta as tarefas pendentes
 * geradas a partir das regras de recorrência, mesclando com as tarefas que o usuário já concluiu.
 */
function descompactarDesafio(desafioCompactado: DesafioDiasData): DesafioDiasData {
  const diasCompletos: Record<number, DiaCorrido> = {};
  const totalDias = desafioCompactado.totalDias || 100;
  const regras = desafioCompactado.regras || [];
  const diasSalvos = desafioCompactado.dias || {};

  for (let d = 1; d <= totalDias; d++) {
    // Lê o dia compactado (que contém apenas as tarefas concluídas, se houver)
    const diaSalvo = diasSalvos[d] || diasSalvos[String(d) as any];
    const tarefasConcluidas = diaSalvo && Array.isArray(diaSalvo.tarefas) ? diaSalvo.tarefas : [];
    
    // Mapeia os IDs das tarefas que já estão concluídas para evitar duplicação
    const idsConcluidos = new Set(tarefasConcluidas.map((t) => t.id));

    // Gera as tarefas padrão do dia de acordo com as regras de recorrência
    const tarefasGeradas: TarefaDia[] = [];
    regras.forEach((regra) => {
      let deveIncluir = false;
      if (regra.tipo === "diaria") {
        deveIncluir = true;
      } else if (regra.tipo === "intervalo" && regra.intervaloDias) {
        deveIncluir = d % regra.intervaloDias === 0;
      }

      if (deveIncluir) {
        const idTarefa = `t-${regra.id}-${d}`;
        // Se a tarefa já está concluída nos dados salvos, nós não a geramos como pendente
        if (!idsConcluidos.has(idTarefa)) {
          tarefasGeradas.push({
            id: idTarefa,
            nome: regra.nome,
            concluida: false,
            regraId: regra.id
          });
        }
      }
    });

    // Une as tarefas concluídas salvas com as tarefas pendentes geradas
    const todasTarefas = [...tarefasConcluidas, ...tarefasGeradas];

    // O dia está concluído se todas as suas tarefas estiverem concluídas
    const diaConcluido = diaSalvo?.concluido || (todasTarefas.length > 0 && todasTarefas.every((t) => t.concluida));

    diasCompletos[d] = {
      numero: d,
      concluido: diaConcluido,
      tarefas: todasTarefas
    };
  }

  return {
    totalDias,
    regras,
    dias: diasCompletos
  };
}

/**
 * Salva os objetivos e o desafio de dias de forma unificada e criptografada na nuvem.
 */
export async function salvarNaNuvem(
  objetivos: Objetivo[],
  desafioDias: DesafioDiasData | undefined,
  senha: string
): Promise<boolean> {
  try {
    // Compacta o desafio de dias antes de criptografar e enviar para economizar espaço
    const desafioCompactado = desafioDias ? compactarDesafio(desafioDias) : undefined;

    const payload: PayloadUnificado = {
      objetivos,
      desafioDias: desafioCompactado
    };
    
    const jsonStr = JSON.stringify(payload);
    const dadosCriptografados = await criptografar(jsonStr, senha);

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Mantle-Key": WRITE_KEY
      },
      body: JSON.stringify({ payload: dadosCriptografados })
    });

    if (!response.ok) {
      throw new Error(`Erro na requisição: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error("Erro ao salvar na nuvem:", error);
    return false;
  }
}

/**
 * Recupera os dados da nuvem e retorna os objetivos e o desafio de dias descriptografados.
 * Trata retrocompatibilidade caso o payload na nuvem seja do formato antigo (apenas array de Objetivos).
 */
export async function carregarDaNuvem(senha: string): Promise<PayloadUnificado | null> {
  try {
    const response = await fetch(API_URL);
    
    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error(`Erro na requisição: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data || !data.payload || data.payload.trim() === "") {
      return null;
    }

    const jsonStr = await descriptografar(data.payload, senha);
    const parsed = JSON.parse(jsonStr);

    // Se for o formato antigo (apenas um array de objetivos)
    if (Array.isArray(parsed)) {
      return {
        objetivos: parsed,
        desafioDias: undefined
      };
    }

    // Se for o formato novo, descompacta o desafio de dias para o frontend usar normalmente
    const payload = parsed as PayloadUnificado;
    if (payload.desafioDias) {
      payload.desafioDias = descompactarDesafio(payload.desafioDias);
    }

    return payload;
  } catch (error) {
    console.error("Erro ao carregar da nuvem:", error);
    throw error;
  }
}
