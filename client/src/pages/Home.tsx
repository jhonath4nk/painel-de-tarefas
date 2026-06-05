import React, { useState, useEffect } from "react";
import { Objetivo, Meta, Submeta, Etapa, DADOS_INICIAIS } from "@/lib/types";
import HeaderDashboard from "@/components/HeaderDashboard";
import TimelineLinhas from "@/components/TimelineLinhas";
import SidebarDashboard from "@/components/SidebarDashboard";
import DialogoEdicao from "@/components/DialogoEdicao";
import DialogoLoginGitHub from "@/components/DialogoLoginGitHub";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";
import { GitHubUser, SyncStatus, sincronizarGist, atualizarGist, validarGitHubToken } from "@/lib/githubService";

export default function Home() {
  const [objetivos, setObjetivos] = useState<Objetivo[]>([]);
  const [isCarregado, setIsCarregado] = useState(false);

  // Estados dos Diálogos
  const [dialogoAberto, setDialogoAberto] = useState(false);
  const [tipoDialogo, setTipoDialogo] = useState<"objetivo" | "meta" | "submeta">("objetivo");
  const [modoDialogo, setModoDialogo] = useState<"criar" | "editar">("criar");
  const [dadosEdicao, setDadosEdicao] = useState<any>(null);

  // Auxiliares para criação aninhada
  const [idObjetivoAtivo, setIdObjetivoAtivo] = useState<string | null>(null);
  const [idMetaAtiva, setIdMetaAtiva] = useState<string | null>(null);

  // Estados de Autenticação e Sincronização do GitHub
  const [githubToken, setGithubToken] = useState<string | null>(null);
  const [githubUser, setGithubUser] = useState<GitHubUser | null>(null);
  const [gistId, setGistId] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({ status: "idle" });
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);

  // Carregar dados iniciais (LocalStorage) e verificar se há token do GitHub salvo
  useEffect(() => {
    const inicializar = async () => {
      // 1. Carregar dados locais temporariamente
      const dadosSalvos = localStorage.getItem("tidly_objetivos");
      let dadosIniciaisParaUsar = DADOS_INICIAIS;
      if (dadosSalvos) {
        try {
          dadosIniciaisParaUsar = JSON.parse(dadosSalvos);
        } catch {
          dadosIniciaisParaUsar = DADOS_INICIAIS;
        }
      }
      setObjetivos(dadosIniciaisParaUsar);

      // 2. Verificar se há Token do GitHub salvo
      const tokenSalvo = localStorage.getItem("tidly_github_token");
      const gistIdSalvo = localStorage.getItem("tidly_github_gist_id");
      const userSalvo = localStorage.getItem("tidly_github_user");

      if (tokenSalvo && gistIdSalvo && userSalvo) {
        try {
          setSyncStatus({ status: "syncing", message: "Conectando ao GitHub..." });
          const user = JSON.parse(userSalvo);
          setGithubToken(tokenSalvo);
          setGithubUser(user);
          setGistId(gistIdSalvo);

          // Sincronizar dados do Gist na nuvem (baixa os mais recentes se houver)
          const resultado = await sincronizarGist(tokenSalvo, dadosIniciaisParaUsar);
          setGistId(resultado.gistId);
          setObjetivos(resultado.dados);
          localStorage.setItem("tidly_objetivos", JSON.stringify(resultado.dados));
          localStorage.setItem("tidly_github_gist_id", resultado.gistId);
          
          setSyncStatus({ 
            status: "success", 
            lastSync: new Date().toLocaleTimeString(),
            message: "Sincronizado com o GitHub" 
          });
        } catch (err) {
          console.error("Erro ao sincronizar na inicialização", err);
          setSyncStatus({ status: "error", message: "Erro de sincronização. Reconecte seu token." });
          toast.error("Sessão do GitHub expirada ou inválida. Por favor, conecte-se novamente.");
        }
      }
      setIsCarregado(true);
    };

    inicializar();
  }, []);

  // Salvar dados (Localmente e na Nuvem se logado)
  const salvarDados = async (novosObjetivos: Objetivo[]) => {
    // 1. Salvar localmente instantaneamente para UX fluida
    setObjetivos(novosObjetivos);
    localStorage.setItem("tidly_objetivos", JSON.stringify(novosObjetivos));

    // 2. Se logado no GitHub, salvar de forma assíncrona na nuvem
    if (githubToken && gistId) {
      setSyncStatus({ status: "syncing", message: "Salvando na nuvem..." });
      try {
        await atualizarGist(githubToken, gistId, novosObjetivos);
        setSyncStatus({ 
          status: "success", 
          lastSync: new Date().toLocaleTimeString(),
          message: "Salvo no GitHub" 
        });
      } catch (err) {
        console.error("Erro ao salvar no Gist", err);
        setSyncStatus({ status: "error", message: "Erro ao salvar na nuvem." });
        toast.error("Falha ao salvar dados no GitHub. Suas alterações continuam salvas localmente.");
      }
    }
  };

  // Tratar sucesso de login do GitHub
  const handleLoginSuccess = async (token: string, user: GitHubUser) => {
    setGithubToken(token);
    setGithubUser(user);
    localStorage.setItem("tidly_github_token", token);
    localStorage.setItem("tidly_github_user", JSON.stringify(user));

    setSyncStatus({ status: "syncing", message: "Sincronizando dados..." });
    try {
      // Sincroniza e mescla os dados locais com os dados do Gist (se já houver um)
      const resultado = await sincronizarGist(token, objetivos);
      setGistId(resultado.gistId);
      setObjetivos(resultado.dados);
      localStorage.setItem("tidly_github_gist_id", resultado.gistId);
      localStorage.setItem("tidly_objetivos", JSON.stringify(resultado.dados));

      setSyncStatus({ 
        status: "success", 
        lastSync: new Date().toLocaleTimeString(),
        message: "Conectado e sincronizado!" 
      });
    } catch (err: any) {
      setSyncStatus({ status: "error", message: "Erro ao sincronizar." });
      toast.error(err.message || "Erro ao configurar Gist de dados.");
    }
  };

  // Desconectar do GitHub
  const handleLogoutGitHub = () => {
    if (confirm("Deseja desconectar do GitHub? Seus dados continuarão salvos localmente neste navegador.")) {
      setGithubToken(null);
      setGithubUser(null);
      setGistId(null);
      setSyncStatus({ status: "idle" });
      localStorage.removeItem("tidly_github_token");
      localStorage.removeItem("tidly_github_gist_id");
      localStorage.removeItem("tidly_github_user");
      toast.info("Desconectado do GitHub.");
    }
  };

  // Alternar conclusão de submeta (conclui todas as etapas de uma vez ou desmarca todas)
  const handleToggleSubmeta = (objetivoId: string, metaId: string, submetaId: string) => {
    const novosObjetivos = objetivos.map(obj => {
      if (obj.id !== objetivoId) return obj;
      return {
        ...obj,
        metas: obj.metas.map(meta => {
          if (meta.id !== metaId) return meta;
          return {
            ...meta,
            submetas: meta.submetas.map(sub => {
              if (sub.id !== submetaId) return sub;
              const novoEstado = !sub.concluida;
              
              // Se marcar como concluída, marcar todas as etapas como concluídas.
              // Se desmarcar, desmarcar todas as etapas.
              const novasEtapas = sub.etapas?.map(e => ({ ...e, concluida: novoEstado })) || [];
              
              if (novoEstado) {
                toast.success(`Submeta "${sub.nome}" concluída!`);
              }
              return { 
                ...sub, 
                concluida: novoEstado,
                etapas: novasEtapas
              };
            })
          };
        })
      };
    });
    salvarDados(novosObjetivos);
  };

  // Alternar conclusão de uma Etapa específica dentro de uma Submeta
  const handleToggleEtapa = (objetivoId: string, metaId: string, submetaId: string, etapaId: string) => {
    const novosObjetivos = objetivos.map(obj => {
      if (obj.id !== objetivoId) return obj;
      return {
        ...obj,
        metas: obj.metas.map(meta => {
          if (meta.id !== metaId) return meta;
          return {
            ...meta,
            submetas: meta.submetas.map(sub => {
              if (sub.id !== submetaId) return sub;
              
              const novasEtapas = sub.etapas.map(etapa => {
                if (etapa.id !== etapaId) return etapa;
                const novoEstado = !etapa.concluida;
                if (novoEstado) {
                  toast.success(`Etapa "${etapa.nome}" concluída!`);
                }
                return { ...etapa, concluida: novoEstado };
              });

              // Submeta é concluída se TODAS as etapas estiverem concluídas
              const todasConcluidas = novasEtapas.length > 0 && novasEtapas.every(e => e.concluida);
              
              if (todasConcluidas && !sub.concluida) {
                toast.success(`Parabéns! Todas as etapas de "${sub.nome}" foram concluídas!`);
              }

              return {
                ...sub,
                etapas: novasEtapas,
                concluida: todasConcluidas
              };
            })
          };
        })
      };
    });
    salvarDados(novosObjetivos);
  };

  // Tratar salvamento do Diálogo (Criar ou Editar)
  const handleSaveDialogo = (dados: any) => {
    let novosObjetivos = [...objetivos];

    if (tipoDialogo === "objetivo") {
      if (modoDialogo === "criar") {
        const novoObj: Objetivo = {
          id: `obj-${Date.now()}`,
          nome: dados.nome,
          descricao: dados.descricao,
          prazo: dados.prazo,
          icone: dados.icone || "Target",
          metas: []
        };
        novosObjetivos.push(novoObj);
        toast.success("Objetivo criado com sucesso!");
      } else {
        novosObjetivos = novosObjetivos.map(o => o.id === dados.id ? { ...o, ...dados } : o);
        toast.success("Objetivo atualizado!");
      }
    } else if (tipoDialogo === "meta") {
      if (modoDialogo === "criar" && idObjetivoAtivo) {
        novosObjetivos = novosObjetivos.map(o => {
          if (o.id !== idObjetivoAtivo) return o;
          const novaMeta: Meta = {
            id: `meta-${Date.now()}`,
            nome: dados.nome,
            descricao: dados.descricao,
            prazo: dados.prazo,
            submetas: []
          };
          return { ...o, metas: [...o.metas, novaMeta] };
        });
        toast.success("Meta adicionada ao objetivo!");
      } else {
        novosObjetivos = novosObjetivos.map(o => {
          return {
            ...o,
            metas: o.metas.map(m => m.id === dados.id ? { ...m, ...dados } : m)
          };
        });
        toast.success("Meta updated!");
      }
    } else if (tipoDialogo === "submeta") {
      if (modoDialogo === "criar" && idObjetivoAtivo && idMetaAtiva) {
        novosObjetivos = novosObjetivos.map(o => {
          if (o.id !== idObjetivoAtivo) return o;
          return {
            ...o,
            metas: o.metas.map(m => {
              if (m.id !== idMetaAtiva) return m;
              const novaSub: Submeta = {
                id: `sub-${Date.now()}`,
                nome: dados.nome,
                prazo: dados.prazo,
                concluida: dados.concluida || false,
                etapas: dados.etapas || []
              };
              return { ...m, submetas: [...m.submetas, novaSub] };
            })
          };
        });
        toast.success("Submeta criada!");
      } else {
        novosObjetivos = novosObjetivos.map(o => {
          return {
            ...o,
            metas: o.metas.map(m => {
              return {
                ...m,
                submetas: m.submetas.map(s => s.id === dados.id ? { ...s, ...dados } : s)
              };
            })
          };
        });
        toast.success("Submeta atualizada!");
      }
    }

    salvarDados(novosObjetivos);
    setDialogoAberto(false);
  };

  // Tratar exclusão
  const handleDelete = () => {
    let novosObjetivos = [...objetivos];

    if (tipoDialogo === "objetivo" && dadosEdicao) {
      novosObjetivos = novosObjetivos.filter(o => o.id !== dadosEdicao.id);
      toast.error("Objetivo excluído!");
    } else if (tipoDialogo === "meta" && dadosEdicao) {
      novosObjetivos = novosObjetivos.map(o => ({
        ...o,
        metas: o.metas.filter(m => m.id !== dadosEdicao.id)
      }));
      toast.error("Meta excluída!");
    } else if (tipoDialogo === "submeta" && dadosEdicao) {
      novosObjetivos = novosObjetivos.map(o => ({
        ...o,
        metas: o.metas.map(m => ({
          ...m,
          submetas: m.submetas.filter(s => s.id !== dadosEdicao.id)
        }))
      }));
      toast.error("Submeta excluída!");
    }

    salvarDados(novosObjetivos);
    setDialogoAberto(false);
  };

  // Gatilhos de Diálogos
  const abrirCriarObjetivo = () => {
    setTipoDialogo("objetivo");
    setModoDialogo("criar");
    setDadosEdicao({ prazo: new Date().toISOString().split("T")[0] });
    setDialogoAberto(true);
  };

  const abrirEditarObjetivo = (obj: Objetivo) => {
    setTipoDialogo("objetivo");
    setModoDialogo("editar");
    setDadosEdicao(obj);
    setDialogoAberto(true);
  };

  const abrirCriarMeta = (objetivoId: string) => {
    setIdObjetivoAtivo(objetivoId);
    setTipoDialogo("meta");
    setModoDialogo("criar");
    setDadosEdicao({ prazo: new Date().toISOString().split("T")[0] });
    setDialogoAberto(true);
  };

  const abrirEditarMeta = (objetivoId: string, meta: Meta) => {
    setIdObjetivoAtivo(objetivoId);
    setTipoDialogo("meta");
    setModoDialogo("editar");
    setDadosEdicao(meta);
    setDialogoAberto(true);
  };

  const abrirCriarSubmeta = (objetivoId: string, metaId: string) => {
    setIdObjetivoAtivo(objetivoId);
    setIdMetaAtiva(metaId);
    setTipoDialogo("submeta");
    setModoDialogo("criar");
    setDadosEdicao({ 
      prazo: new Date().toISOString().split("T")[0],
      etapas: []
    });
    setDialogoAberto(true);
  };

  const abrirEditarSubmeta = (objetivoId: string, metaId: string, submeta: Submeta) => {
    setIdObjetivoAtivo(objetivoId);
    setIdMetaAtiva(metaId);
    setTipoDialogo("submeta");
    setModoDialogo("editar");
    setDadosEdicao(submeta);
    setDialogoAberto(true);
  };

  // Redefinir para dados de fábrica
  const handleLimparDados = () => {
    if (confirm("Deseja redefinir o painel para os dados iniciais? Todas as suas alterações locais e na nuvem serão perdidas.")) {
      salvarDados(DADOS_INICIAIS);
      toast.info("Dados redefinidos com sucesso!");
    }
  };

  if (!isCarregado) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-primary animate-spin" />
          <span className="text-sm font-medium text-muted-foreground">Carregando painel calmo...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background text-foreground selection:bg-primary/20">
      {/* Barra Lateral Esquerda */}
      <SidebarDashboard 
        onLimparDados={handleLimparDados} 
        onCriarObjetivo={abrirCriarObjetivo}
        githubUser={githubUser}
        syncStatus={syncStatus}
        onLoginClick={() => setLoginDialogOpen(true)}
        onLogoutClick={handleLogoutGitHub}
      />

      {/* Conteúdo Principal do Dashboard */}
      <main className="flex-1 p-6 lg:p-10 space-y-8 overflow-y-auto max-w-6xl mx-auto w-full">
        {/* Header Principal com Big Numbers diretamente no topo */}
        <HeaderDashboard objetivos={objetivos} />

        {/* Seção da Timeline de Objetivos e Metas */}
        <div className="space-y-4 pt-2">
          <TimelineLinhas 
            objetivos={objetivos}
            onToggleSubmeta={handleToggleSubmeta}
            onToggleEtapa={handleToggleEtapa}
            onEditarObjetivo={abrirEditarObjetivo}
            onEditarMeta={abrirEditarMeta}
            onEditarSubmeta={abrirEditarSubmeta}
            onCriarMeta={abrirCriarMeta}
            onCriarSubmeta={abrirCriarSubmeta}
          />
        </div>

        {/* Rodapé Oculto/Discreto v6 e Créditos de Design */}
        <footer className="pt-10 pb-4 border-t border-border/30 flex flex-col sm:flex-row items-center justify-between text-[11px] text-muted-foreground gap-2">
          <span>&copy; 2026 Tidly Productivity Inc. Todos os direitos reservados.</span>
          <div className="flex items-center gap-4">
            <span>v6 no rodapé</span>
            <span>&bull;</span>
            <span>Design Notion-Flat</span>
          </div>
        </footer>
      </main>

      {/* Diálogo Único de Criação e Edição */}
      <DialogoEdicao
        isOpen={dialogoAberto}
        onClose={() => setDialogoAberto(false)}
        tipo={tipoDialogo}
        modo={modoDialogo}
        dadosIniciais={dadosEdicao}
        onSave={handleSaveDialogo}
        onDelete={handleDelete}
      />

      {/* Diálogo de Login do GitHub */}
      <DialogoLoginGitHub
        isOpen={loginDialogOpen}
        onClose={() => setLoginDialogOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}
