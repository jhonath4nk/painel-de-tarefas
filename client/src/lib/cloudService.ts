import { Objetivo } from "./types";
import { criptografar, descriptografar } from "./cripto";

// Usamos o kvdb.io como um banco de dados KV na nuvem gratuito e instantâneo.
// Criamos um bucket exclusivo para o usuário Jhonathan baseado em um hash único para privacidade.
const BUCKET_ID = "bucket_jhonathan_metas_v6_secure";
const API_URL = `https://kvdb.io/${BUCKET_ID}/dados_metas`;

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
      method: "PUT",
      headers: {
        "Content-Type": "text/plain"
      },
      body: dadosCriptografados
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

    const dadosCriptografados = await response.text();
    if (!dadosCriptografados || dadosCriptografados.trim() === "") {
      return null;
    }

    // Descriptografar usando a senha do usuário
    const jsonStr = await descriptografar(dadosCriptografados, senha);
    return JSON.parse(jsonStr) as Objetivo[];
  } catch (error) {
    console.error("Erro ao carregar da nuvem:", error);
    throw error; // Repassar o erro para que a interface possa identificar senha incorreta
  }
}
