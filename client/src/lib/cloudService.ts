import { Objetivo } from "./types";
import { criptografar, descriptografar } from "./cripto";

// Usamos o mantledb.sh como um banco de dados JSON na nuvem gratuito, anônimo e instantâneo.
// Namespace exclusivo e chave de escrita segura gerados para o usuário Jhonathan.
const NAMESPACE = "jhonathan-metas-dashboard";
const WRITE_KEY = "67873783eef7d5502b1b5416e454b3ff0933fbc8f223b242323ba0d0ee49fa51";
const API_URL = `https://mantledb.sh/v2/${NAMESPACE}/metas_data`;

export type CloudSyncStatus = {
  status: "idle" | "syncing" | "success" | "error";
  message?: string;
  lastSync?: string;
};

/**
 * Salva as metas criptografadas na nuvem.
 * Usa a senha do usuário como chave para a criptografia AES-256.
 */
export async function salvarNaNuvem(dados: Objetivo[], senha: string): Promise<boolean> {
  try {
    const jsonStr = JSON.stringify(dados);
    // Criptografar os dados antes de enviar à nuvem
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
 * Recupera as metas da nuvem e as descriptografa.
 * Usa a senha do usuário para a descriptografia AES-256.
 * Se não houver dados na nuvem, retorna null para que possamos usar os dados locais ou iniciais.
 */
export async function carregarDaNuvem(senha: string): Promise<Objetivo[] | null> {
  try {
    const response = await fetch(API_URL);
    
    if (response.status === 404) {
      // Nenhum dado salvo na nuvem ainda
      return null;
    }

    if (!response.ok) {
      throw new Error(`Erro na requisição: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data || !data.payload || data.payload.trim() === "") {
      return null;
    }

    // Descriptografar usando a senha do usuário
    const jsonStr = await descriptografar(data.payload, senha);
    return JSON.parse(jsonStr) as Objetivo[];
  } catch (error) {
    console.error("Erro ao carregar da nuvem:", error);
    throw error; // Repassar o erro para que a interface possa identificar senha incorreta
  }
}
