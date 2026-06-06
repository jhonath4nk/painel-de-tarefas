import { Objetivo, DesafioDiasData } from "./types";
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
 * Salva os objetivos e o desafio de dias de forma unificada e criptografada na nuvem.
 */
export async function salvarNaNuvem(
  objetivos: Objetivo[],
  desafioDias: DesafioDiasData | undefined,
  senha: string
): Promise<boolean> {
  try {
    const payload: PayloadUnificado = {
      objetivos,
      desafioDias
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

    // Se for o formato novo (objeto com objetivos e desafioDias)
    return parsed as PayloadUnificado;
  } catch (error) {
    console.error("Erro ao carregar da nuvem:", error);
    throw error;
  }
}
