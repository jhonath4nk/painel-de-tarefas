import React, { useState, useEffect } from "react";
import { Objetivo, Meta, Submeta, Etapa, DADOS_INICIAIS } from "@/lib/types";
import HeaderDashboard from "@/components/HeaderDashboard";
import TimelineLinhas from "@/components/TimelineLinhas";
import DialogoEdicao from "@/components/DialogoEdicao";
import DialogoLoginUsuario from "@/components/DialogoLoginUsuario";
import { toast } from "sonner";
import { RefreshCw, Lock, LogOut, Plus, Cloud, CloudOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GitHubUser, SyncStatus, sincronizarGist, atualizarGist } from "@/lib/githubService";

export default function Home() {
  const [objetivos, setObjetivos] = useState<Objetivo[]>([]);
  const [isCarregado, setIsCarregado] = useState(false);

  // Estado de Autenticação do Usuário Jhonathan
  const [autenticado, setAutenticado] = useState(false);
  const [loginUsuarioAberto, setLoginUsuarioAberto] = useState(false);

  // Estados dos Diálogos
  const [dialogoAberto, setDialogoAberto] = useState(false);
  const [tipoDialogo, setTipoDialogo] = useState<"objetivo" | "meta" | "submeta">("objetivo");
  const [modoDialogo, setModoDialogo] = useState<"criar" | "editar">("criar");
  const [dadosEdicao, setDadosEdicao] = useState<any>(null);

  // Auxiliares para criação aninhada
  const [idObjetivoAtivo, setIdObjetivoAtivo] = useState<string | null>(null);
  const [idMetaAtiva, setIdMetaAtiva] = useState<string | null>(null);

  // Estados de Sincronização do GitHub (Sincroniza em segundo plano se o token estiver no LocalStorage)
  const [githubToken, setGithubToken] = useState<string | null>(null);
  const [githubUser, setGithubUser] = useState<GitHubUser | null>(null);
  const [gistId, setGistId] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({ status: "idle" });

  // Carregar dados iniciais e verificar login persistido na sessão
  useEffect(() => {
    const inicializar = async () => {
      // 1. Verificar se o usuário está logado nesta sessão (SessionStorage para segurança)
      const sessaoLogin = sessionStorage.getItem("jhonathan_autenticado");
      if (sessaoLogin === "true") {
        setAutenticado(true);
      }

      // 2. Carregar dados locais temporariamente
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

      // 3. Sincronizar silenciosamente com o GitHub se o token estiver salvo
      const tokenSalvo = localStorage.getItem("tidly_github_token");
      const gistIdSalvo = localStorage.getItem("tidly_github_gist_id");
      const userSalvo = localStorage.getItem("tidly_github_user");

      if (tokenSalvo && gistIdSalvo && userSalvo) {
        try {
          setSyncStatus({ status: "syncing", message: "Sincronizando..." });
          const user = JSON.parse(userSalvo);
          setGithubToken(tokenSalvo);
          setGithubUser(user);
          setGistId(gistIdSalvo);

          const resultado = await sincronizarGist(tokenSalvo, dadosIniciaisParaUsar);
          setGistId(resultado.gistId);
          setObjetivos(resultado.dados);
          localStorage.setItem("tidly_objetivos", JSON.stringify(resultado.dados));
          localStorage.setItem("tidly_github_gist_id", resultado.gistId);
          
          setSyncStatus({ 
            status: "success", 
            lastSync: new Date().toLocaleTimeString(),
            message: "Sincronizado" 
          });
        } catch (err) {
          console.error("Erro de sincronização em segundo plano", err);
          setSyncStatus({ status: "error", message: "Erro de conexão." });
        }
      }
      setIsCarregado(true);
    };

    inicializar();
  }, []);

  // Tratar sucesso de login do Jhonathan
  const handleLoginUsuarioSuccess = () => {
    setAutenticado(true);
    sessionStorage.setItem("jhonathan_autenticado", "true");
  };

  // Tratar logout do Jhonathan
  const handleLogoutUsuario = () => {
    setAutenticado(false);
    sessionStorage.removeItem("jhonathan_autenticado");
    toast.info("Sessão encerrada. Modo de visualização ativo.");
  };

  // Salvar dados (Localmente e na Nuvem se houver token)
  const salvarDados = async (novosObjetivos: Objetivo[]) => {
    setObjetivos(novosObjetivos);
    localStorage.setItem("tidly_objetivos", JSON.stringify(novosObjetivos));

    if (githubToken && gistId) {
      setSyncStatus({ status: "syncing", message: "Salvando..." });
      try {
        await atualizarGist(githubToken, gistId, novosObjetivos);
        setSyncStatus({ 
          status: "success", 
          lastSync: new Date().toLocaleTimeString(),
          message: "Salvo na Nuvem" 
        });
      } catch (err) {
        console.error("Erro ao salvar no Gist", err);
        setSyncStatus({ status: "error", message: "Erro ao salvar." });
      }
    }
  };

  // Alternar conclusão de submeta (Etapas filhas herdam)
  const handleToggleSubmeta = (objetivoId: string, metaId: string, submetaId: string) => {
    if (!autenticado) return;
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

  // Alternar conclusão de uma Etapa específica
  const handleToggleEtapa = (objetivoId: string, metaId: string, submetaId: string, etapaId: string) => {
    if (!autenticado) return;
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

              const todasConcluidas = novasEtapas.length > 0 && novasEtapas.every(e => e.concluida);
              
              if (todasConcluidas && !sub.concluida) {
                toast.success(`Todas as etapas de "${sub.nome}" foram concluídas!`);
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
    if (!autenticado) return;
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
        toast.success("Objetivo criado!");
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
        toast.success("Meta adicionada!");
      } else {
        novosObjetivos = novosObjetivos.map(o => {
          return {
            ...o,
            metas: o.metas.map(m => m.id === dados.id ? { ...m, ...dados } : m)
          };
        });
        toast.success("Meta atualizada!");
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
    if (!autenticado) return;
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
    if (!autenticado) return;
    setTipoDialogo("objetivo");
    setModoDialogo("criar");
    setDadosEdicao({ prazo: new Date().toISOString().split("T")[0] });
    setDialogoAberto(true);
  };

  const abrirEditarObjetivo = (obj: Objetivo) => {
    if (!autenticado) return;
    setTipoDialogo("objetivo");
    setModoDialogo("editar");
    setDadosEdicao(obj);
    setDialogoAberto(true);
  };

  const abrirCriarMeta = (objetivoId: string) => {
    if (!autenticado) return;
    setIdObjetivoAtivo(objetivoId);
    setTipoDialogo("meta");
    setModoDialogo("criar");
    setDadosEdicao({ prazo: new Date().toISOString().split("T")[0] });
    setDialogoAberto(true);
  };

  const abrirEditarMeta = (objetivoId: string, meta: Meta) => {
    if (!autenticado) return;
    setIdObjetivoAtivo(objetivoId);
    setTipoDialogo("meta");
    setModoDialogo("editar");
    setDadosEdicao(meta);
    setDialogoAberto(true);
  };

  const abrirCriarSubmeta = (objetivoId: string, metaId: string) => {
    if (!autenticado) return;
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
    if (!autenticado) return;
    setIdObjetivoAtivo(objetivoId);
    setIdMetaAtiva(metaId);
    setTipoDialogo("submeta");
    setModoDialogo("editar");
    setDadosEdicao(submeta);
    setDialogoAberto(true);
  };

  if (!isCarregado) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-primary animate-spin" />
          <span className="text-sm font-medium text-muted-foreground">Carregando painel...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      {/* Barra de Controle Superior (Login, Status de Sincronização, Criar Objetivo) */}
      <div className="border-b border-border/40 bg-card/40 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
          {/* Status de Sincronização da Nuvem (GitHub) */}
          <div className="flex items-center gap-2">
            {githubToken ? (
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                <Cloud className="w-3.5 h-3.5" />
                <span>Nuvem Ativa</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium bg-secondary/60 px-2.5 py-1 rounded-full border border-border/40">
                <CloudOff className="w-3.5 h-3.5" />
                <span>Modo Local</span>
              </div>
            )}
            {syncStatus.status === "syncing" && (
              <span className="text-[10px] text-muted-foreground animate-pulse">Salvando...</span>
            )}
          </div>

          {/* Ações e Autenticação */}
          <div className="flex items-center gap-2">
            {autenticado ? (
              <>
                <Button 
                  onClick={abrirCriarObjetivo}
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-1 text-xs px-3 h-8 rounded-lg"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Novo Objetivo</span>
                </Button>
                <Button 
                  onClick={handleLogoutUsuario}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                  title="Sair"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <Button 
                onClick={() => setLoginUsuarioAberto(true)}
                size="sm"
                variant="outline"
                className="border-border/60 hover:bg-muted text-xs font-semibold gap-1 px-3 h-8 rounded-lg"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Entrar</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Conteúdo Principal do Dashboard */}
      <main className="p-6 lg:p-10 space-y-8 max-w-6xl mx-auto w-full">
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
            autenticado={autenticado}
          />
        </div>

        {/* Rodapé Oculto/Discreto v6 e Créditos de Design */}
        <footer className="pt-10 pb-4 border-t border-border/30 flex flex-col sm:flex-row items-center justify-between text-[11px] text-muted-foreground gap-2">
          <span>&copy; 2026 Productivity Board. Todos os direitos reservados.</span>
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

      {/* Diálogo de Login Local (Jhonathan) */}
      <DialogoLoginUsuario
        isOpen={loginUsuarioAberto}
        onClose={() => setLoginUsuarioAberto(false)}
        onLoginSuccess={handleLoginUsuarioSuccess}
      />
    </div>
  );
}
