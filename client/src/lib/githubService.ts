import { Objetivo } from "./types";

const GIST_FILENAME = "tidly_dashboard_data.json";

export interface GitHubUser {
  login: string;
  avatar_url: string;
  name: string;
}

export interface SyncStatus {
  status: "idle" | "syncing" | "success" | "error";
  lastSync?: string;
  message?: string;
}

/**
 * Validar o Personal Access Token (PAT) do GitHub e obter dados do usuário
 */
export async function validarGitHubToken(token: string): Promise<GitHubUser> {
  const response = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `token ${token}`,
      Accept: "application/vnd.github.v3+json",
    },
  });

  if (!response.ok) {
    throw new Error("Token inválido ou expirado.");
  }

  const data = await response.json();
  return {
    login: data.login,
    avatar_url: data.avatar_url,
    name: data.name || data.login,
  };
}

/**
 * Buscar ou Criar um Gist privado para armazenar os dados do Tidly
 */
export async function sincronizarGist(
  token: string,
  dadosLocais: Objetivo[]
): Promise<{ gistId: string; dados: Objetivo[] }> {
  const headers = {
    Authorization: `token ${token}`,
    Accept: "application/vnd.github.v3+json",
    "Content-Type": "application/json",
  };

  // 1. Listar gists do usuário para encontrar um existente
  const responseList = await fetch("https://api.github.com/gists", { headers });
  if (!responseList.ok) {
    throw new Error("Falha ao acessar os Gists do GitHub.");
  }

  const gists = await responseList.json();
  // Encontrar um Gist que contenha o arquivo específico do Tidly
  const gistExistente = gists.find(
    (g: any) => g.files && g.files[GIST_FILENAME]
  );

  if (gistExistente) {
    // 2. Se o Gist existe, baixar os dados mais recentes dele
    const gistResponse = await fetch(`https://api.github.com/gists/${gistExistente.id}`, { headers });
    if (gistResponse.ok) {
      const gistData = await gistResponse.json();
      const fileContent = gistData.files[GIST_FILENAME].content;
      try {
        const dadosNuvem = JSON.parse(fileContent);
        
        // Estratégia de Mesclagem Simples: Se houver dados locais mais novos, ou se a nuvem estiver vazia, usamos local.
        // Como o usuário está logando agora, se ele tiver dados locais, vamos perguntar ou simplesmente mesclar.
        // Para máxima praticidade, se a nuvem tiver dados, nós os priorizamos. Se a nuvem estiver vazia ou inválida, enviamos os locais.
        if (Array.isArray(dadosNuvem) && dadosNuvem.length > 0) {
          return { gistId: gistExistente.id, dados: dadosNuvem };
        }
      } catch (e) {
        console.error("Erro ao parsear dados do Gist, sobrescrevendo com locais", e);
      }
    }
    
    // Se deu erro ao baixar ou estava vazio, atualiza o existente com os dados locais
    await atualizarGist(token, gistExistente.id, dadosLocais);
    return { gistId: gistExistente.id, dados: dadosLocais };
  } else {
    // 3. Se não existe, criar um novo Gist privado
    const novoGistPayload = {
      description: "Tidly Productivity Dashboard - Dados de Objetivos e Metas",
      public: false, // Gist Privado!
      files: {
        [GIST_FILENAME]: {
          content: JSON.stringify(dadosLocais, null, 2),
        },
      },
    };

    const responseCreate = await fetch("https://api.github.com/gists", {
      method: "POST",
      headers,
      body: JSON.stringify(novoGistPayload),
    });

    if (!responseCreate.ok) {
      throw new Error("Não foi possível criar o Gist privado no GitHub.");
    }

    const novoGist = await responseCreate.json();
    return { gistId: novoGist.id, dados: dadosLocais };
  }
}

/**
 * Atualizar os dados do Gist privado no GitHub
 */
export async function atualizarGist(
  token: string,
  gistId: string,
  dados: Objetivo[]
): Promise<void> {
  const response = await fetch(`https://api.github.com/gists/${gistId}`, {
    method: "PATCH",
    headers: {
      Authorization: `token ${token}`,
      Accept: "application/vnd.github.v3+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      files: {
        [GIST_FILENAME]: {
          content: JSON.stringify(dados, null, 2),
        },
      },
    }),
  });

  if (!response.ok) {
    throw new Error("Falha ao salvar dados na nuvem do GitHub.");
  }
}
