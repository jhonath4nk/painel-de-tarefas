import React, { useState, useEffect } from "react";
import { Objetivo, Meta, Submeta, Etapa, DADOS_INICIAIS, DesafioDiasData } from "@/lib/types";
import HeaderDashboard from "@/components/HeaderDashboard";
import TimelineLinhas from "@/components/TimelineLinhas";
import DialogoEdicao from "@/components/DialogoEdicao";
import DialogoLoginUsuario from "@/components/DialogoLoginUsuario";
import { AbaDesafioDias } from "@/components/AbaDesafioDias";
import { inicializarDesafio } from "@/lib/desafioHelper";
import { toast } from "sonner";
import { RefreshCw, Lock, LogOut, Plus, Cloud, CloudOff, CloudLightning, Calendar, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { carregarDaNuvem, salvarNaNuvem, CloudSyncStatus } from "@/lib/cloudService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Home() {
  const [objetivos, setObjetivos] = useState<Objetivo[]>([]);
  const [desafioData, setDesafioData] = useState<DesafioDiasData>(inicializarDesafio());
  const [abaAtiva, setAbaAtiva] = useState<string>("dashboard");
  const [isCarregado, setIsCarregado] = useState(false);

  // Estado de Autenticação do Usuário Jhonathan
  const [autenticado, setAutenticado] = useState(false);
  const [loginUsuarioAberto, setLoginUsuarioAberto] = useState(false);
  const [senhaDigitada, setSenhaDigitada] = useState<string>("");

  // Estados dos Diálogos
  const [dialogoAberto, setDialogoAberto] = useState(false);
  const [tipoDialogo, setTipoDialogo] = useState<"objetivo" | "meta" | "submeta">("objetivo");
  const [modoDialogo, setModoDialogo] = useState<"criar" | "editar">("criar");
  const [dadosEdicao, setDadosEdicao] = useState<any>(null);

  // Auxiliares para criação aninhada
  const [idObjetivoAtivo, setIdObjetivoAtivo] = useState<string | null>(null);
  const [idMetaAtiva, setIdMetaAtiva] = useState<string | null>(null);

  // Estado de Sincronização em Nuvem (Automático e Seguro)
  const [syncStatus, setSyncStatus] = useState<CloudSyncStatus>({ status: "idle" });

  // Carregar dados iniciais e verificar login persistido na sessão
  useEffect(() => {
    const inicializar = async () => {
      // 1. Verificar se o usuário está logado nesta sessão (SessionStorage para segurança)
      const sessaoLogin = sessionStorage.getItem("jhonathan_autenticado");
      const senhaSalva = sessionStorage.getItem("jhonathan_senha");
      
      // 2. Carregar dados locais temporariamente como fallback (Objetivos)
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

      // 3. Carregar dados locais temporariamente como fallback (Desafio de Dias)
      const desafioSalvo = localStorage.getItem("tidly_desafio_dias");
      let desafioInicialParaUsar = inicializarDesafio();
      if (desafioSalvo) {
        try {
          const parsed = JSON.parse(desafioSalvo);
          // Upgrade suave de 100 para 180 dias se for uma conta antiga
          if (parsed && parsed.totalDias === 100) {
            const novoDesafio = { ...parsed, totalDias: 180 };
            const regras = parsed.regras || [];
            for (let d = 101; d <= 180; d++) {
              if (!novoDesafio.dias[d]) {
                const tarefas: any[] = [];
                regras.forEach((regra: any) => {
                  let deveIncluir = false;
                  if (regra.tipo === "diaria") {
                    deveIncluir = true;
                  } else if (regra.tipo === "intervalo" && regra.intervaloDias) {
                    deveIncluir = d % regra.intervaloDias === 0;
                  }
                  if (deveIncluir) {
                    tarefas.push({
                      id: `t-${regra.id}-${d}`,
                      nome: regra.nome,
                      concluida: false,
                      regraId: regra.id
                    });
                  }
                });
                novoDesafio.dias[d] = { numero: d, concluido: false, tarefas };
              }
            }
            desafioInicialParaUsar = novoDesafio;
          } else {
            desafioInicialParaUsar = parsed;
          }
        } catch {
          desafioInicialParaUsar = inicializarDesafio();
        }
      }
      setDesafioData(desafioInicialParaUsar);

      if (sessaoLogin === "true" && senhaSalva) {
        setAutenticado(true);
        setSenhaDigitada(senhaSalva);
        // Sincronizar com a nuvem usando a senha da sessão
        await sincronizarComNuvem(senhaSalva, dadosIniciaisParaUsar, desafioInicialParaUsar);
      } else {
        setIsCarregado(true);
      }
    };

    inicializar();
  }, []);

  // Sincronizar dados com a nuvem (Carrega e envia se necessário)
  const sincronizarComNuvem = async (senha: string, dadosLocais: Objetivo[], desafioLocal: DesafioDiasData) => {
    setSyncStatus({ status: "syncing", message: "Buscando dados na nuvem..." });
    try {
      const payloadNuvem = await carregarDaNuvem(senha);
      if (payloadNuvem) {
        // Objetivos carregados
        setObjetivos(payloadNuvem.objetivos);
        localStorage.setItem("tidly_objetivos", JSON.stringify(payloadNuvem.objetivos));

        // Desafio de Dias carregado (ou inicializa se não houver no banco ainda)
        let desafioParaUsar = payloadNuvem.desafioDias || desafioLocal;
        
        // Upgrade suave de 100 para 180 dias se for uma conta antiga vinda da nuvem
        if (desafioParaUsar && desafioParaUsar.totalDias === 100) {
          const novoDesafio = { ...desafioParaUsar, totalDias: 180 };
          const regras = desafioParaUsar.regras || [];
          for (let d = 101; d <= 180; d++) {
            if (!novoDesafio.dias[d]) {
              const tarefas: any[] = [];
              regras.forEach((regra: any) => {
                let deveIncluir = false;
                if (regra.tipo === "diaria") {
                  deveIncluir = true;
                } else if (regra.tipo === "intervalo" && regra.intervaloDias) {
                  deveIncluir = d % regra.intervaloDias === 0;
                }
                if (deveIncluir) {
                  tarefas.push({
                    id: `t-${regra.id}-${d}`,
                    nome: regra.nome,
                    concluida: false,
                    regraId: regra.id
                  });
                }
              });
              novoDesafio.dias[d] = { numero: d, concluido: false, tarefas };
            }
          }
          desafioParaUsar = novoDesafio;
        }

        setDesafioData(desafioParaUsar);
        localStorage.setItem("tidly_desafio_dias", JSON.stringify(desafioParaUsar));

        setSyncStatus({
          status: "success",
          lastSync: new Date().toLocaleTimeString(),
          message: "Sincronizado com a Nuvem"
        });
      } else {
        // Primeira vez ou nuvem vazia, vamos subir os dados locais
        await salvarNaNuvem(dadosLocais, desafioLocal, senha);
        setSyncStatus({
          status: "success",
          lastSync: new Date().toLocaleTimeString(),
          message: "Nuvem inicializada"
        });
      }
    } catch (err) {
      console.error("Erro ao sincronizar com a nuvem:", err);
      setSyncStatus({ status: "error", message: "Erro de conexão com a nuvem." });
      toast.error("Não foi possível conectar ao banco de dados na nuvem.");
    } finally {
      setIsCarregado(true);
    }
  };

  // Tratar sucesso de login do Jhonathan
  const handleLoginUsuarioSuccess = async (senha: string) => {
    setAutenticado(true);
    setSenhaDigitada(senha);
    sessionStorage.setItem("jhonathan_autenticado", "true");
    sessionStorage.setItem("jhonathan_senha", senha);
    
    // Forçar carregamento imediato da nuvem após o login correto
    await sincronizarComNuvem(senha, objetivos, desafioData);
  };

  // Tratar logout do Jhonathan
  const handleLogoutUsuario = () => {
    setAutenticado(false);
    setSenhaDigitada("");
    sessionStorage.removeItem("jhonathan_autenticado");
    sessionStorage.removeItem("jhonathan_senha");
    setSyncStatus({ status: "idle" });
    toast.info("Sessão encerrada. Modo de visualização ativo.");
  };

  // Salvar dados de objetivos (Localmente e na Nuvem se estiver autenticado)
  const salvarDados = async (novosObjetivos: Objetivo[]) => {
    setObjetivos(novosObjetivos);
    localStorage.setItem("tidly_objetivos", JSON.stringify(novosObjetivos));

    if (autenticado && senhaDigitada) {
      setSyncStatus({ status: "syncing", message: "Salvando na nuvem..." });
      const sucesso = await salvarNaNuvem(novosObjetivos, desafioData, senhaDigitada);
      if (sucesso) {
        setSyncStatus({
          status: "success",
          lastSync: new Date().toLocaleTimeString(),
          message: "Sincronizado"
        });
      } else {
        setSyncStatus({ status: "error", message: "Erro ao salvar na nuvem." });
        toast.error("Falha ao salvar alterações na nuvem. Tentando novamente...");
      }
    }
  };

  // Salvar dados do desafio de dias (Localmente e na Nuvem se estiver autenticado)
  const salvarDadosDesafio = async (novoDesafio: DesafioDiasData) => {
    // Garantir integridade da estrutura de dados antes de atualizar o estado e salvar
    const desafioSeguro: DesafioDiasData = {
      totalDias: novoDesafio?.totalDias || 180,
      regras: Array.isArray(novoDesafio?.regras) ? novoDesafio.regras : [],
      dias: novoDesafio?.dias && typeof novoDesafio.dias === "object" ? novoDesafio.dias : {}
    };

    setDesafioData(desafioSeguro);
    localStorage.setItem("tidly_desafio_dias", JSON.stringify(desafioSeguro));

    if (autenticado && senhaDigitada) {
      setSyncStatus({ status: "syncing", message: "Salvando na nuvem..." });
      const sucesso = await salvarNaNuvem(objetivos, desafioSeguro, senhaDigitada);
      if (sucesso) {
        setSyncStatus({
          status: "success",
          lastSync: new Date().toLocaleTimeString(),
          message: "Sincronizado"
        });
      } else {
        setSyncStatus({ status: "error", message: "Erro ao salvar na nuvem." });
        toast.error("Falha ao salvar alterações na nuvem. Tentando novamente...");
      }
    }
  };

  // Alternar conclusão de submeta (Etapas filhas herdam)
  const handleToggleSubmeta = (objetivoId: string, metaId: string, submetaId: string) => {
    if (!autenticado) return;
    const novosObjetivos = objetivos.map(o => {
      if (o.id !== objetivoId) return o;
      return {
        ...o,
        metas: o.metas.map(m => {
          if (m.id !== metaId) return m;
          return {
            ...m,
            submetas: m.submetas.map(s => {
              if (s.id !== submetaId) return s;
              const novoEstado = !s.concluida;
              return {
                ...s,
                concluida: novoEstado,
                etapas: s.etapas.map(et => ({ ...et, concluida: novoEstado }))
              };
            })
          };
        })
      };
    });
    salvarDados(novosObjetivos);
  };

  // Alternar conclusão de etapa filha (Afeta a conclusão da submeta pai)
  const handleToggleEtapa = (objetivoId: string, metaId: string, submetaId: string, etapaId: string) => {
    if (!autenticado) return;
    const novosObjetivos = objetivos.map(o => {
      if (o.id !== objetivoId) return o;
      return {
        ...o,
        metas: o.metas.map(m => {
          if (m.id !== metaId) return m;
          return {
            ...m,
            submetas: m.submetas.map(s => {
              if (s.id !== submetaId) return s;
              const novasEtapas = s.etapas.map(et => {
                if (et.id !== etapaId) return et;
                return { ...et, concluida: !et.concluida };
              });
              const todasConcluidas = novasEtapas.every(et => et.concluida);
              return {
                ...s,
                concluida: todasConcluidas,
                etapas: novasEtapas
              };
            })
          };
        })
      };
    });
    salvarDados(novosObjetivos);
  };

  // Reordenar etapas de uma submeta (subir ou descer de posição)
  const handleReordenarEtapa = (objetivoId: string, metaId: string, submetaId: string, etapaId: string, direcao: "subir" | "descer") => {
    if (!autenticado) return;
    const novosObjetivos = objetivos.map(o => {
      if (o.id !== objetivoId) return o;
      return {
        ...o,
        metas: o.metas.map(m => {
          if (m.id !== metaId) return m;
          return {
            ...m,
            submetas: m.submetas.map(s => {
              if (s.id !== submetaId) return s;
              const index = s.etapas.findIndex(e => e.id === etapaId);
              if (index === -1) return s;
              
              const novasEtapas = [...s.etapas];
              if (direcao === "subir" && index > 0) {
                const temp = novasEtapas[index];
                novasEtapas[index] = novasEtapas[index - 1];
                novasEtapas[index - 1] = temp;
              } else if (direcao === "descer" && index < novasEtapas.length - 1) {
                const temp = novasEtapas[index];
                novasEtapas[index] = novasEtapas[index + 1];
                novasEtapas[index + 1] = temp;
              }
              
              return {
                ...s,
                etapas: novasEtapas
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
          <span className="text-sm font-medium text-muted-foreground">Sincronizando banco de dados...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      {/* Barra de Controle Superior (Login, Status de Sincronização, Criar Objetivo) */}
      <div className="border-b border-border/40 bg-card/40 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
          {/* Status de Sincronização da Nuvem (KVDB Seguro) */}
          <div className="flex items-center gap-2">
            {autenticado ? (
              syncStatus.status === "syncing" ? (
                <div className="flex items-center gap-1.5 text-xs text-amber-400 font-medium bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Sincronizando...</span>
                </div>
              ) : syncStatus.status === "error" ? (
                <div className="flex items-center gap-1.5 text-xs text-red-400 font-medium bg-red-500/10 px-2.5 py-1 rounded-full border border-red-500/20">
                  <CloudLightning className="w-3.5 h-3.5" />
                  <span>Erro de Sincronização</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20" title={`Último salvamento: ${syncStatus.lastSync || 'Agora'}`}>
                  <Cloud className="w-3.5 h-3.5" />
                  <span>Nuvem Sincronizada</span>
                </div>
              )
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium bg-secondary/60 px-2.5 py-1 rounded-full border border-border/40">
                <CloudOff className="w-3.5 h-3.5" />
                <span>Modo Leitura</span>
              </div>
            )}
          </div>

          {/* Seletor de Abas Centralizado de Alto Padrão */}
          <div className="flex bg-zinc-950 border border-zinc-800 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => setAbaAtiva("dashboard")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-bold transition-all ${
                abaAtiva === "dashboard" 
                  ? "bg-zinc-900 text-white shadow" 
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Metas & OKRs</span>
            </button>
            <button
              onClick={() => setAbaAtiva("desafio")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-bold transition-all ${
                abaAtiva === "desafio" 
                  ? "bg-zinc-900 text-emerald-400 shadow" 
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Desafio 180 Dias</span>
            </button>
          </div>

          {/* Ações e Autenticação */}
          <div className="flex items-center gap-2">
            {autenticado ? (
              <>
                {abaAtiva === "dashboard" && (
                  <Button 
                    onClick={abrirCriarObjetivo}
                    size="sm"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-1 text-xs px-3 h-8 rounded-lg"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Novo Objetivo</span>
                  </Button>
                )}
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
        {abaAtiva === "dashboard" ? (
          <>
            {/* Header Principal com Big Numbers diretamente no topo */}
            <HeaderDashboard objetivos={objetivos} />

            {/* Seção da Timeline de Objetivos e Metas */}
            <div className="space-y-4 pt-2">
              <TimelineLinhas 
                objetivos={objetivos}
                onToggleSubmeta={handleToggleSubmeta}
                onToggleEtapa={handleToggleEtapa}
                onReordenarEtapa={handleReordenarEtapa}
                onEditarObjetivo={abrirEditarObjetivo}
                onEditarMeta={abrirEditarMeta}
                onEditarSubmeta={abrirEditarSubmeta}
                onCriarMeta={abrirCriarMeta}
                onCriarSubmeta={abrirCriarSubmeta}
                autenticado={autenticado}
              />
            </div>
          </>
        ) : (
          <AbaDesafioDias 
            desafioData={desafioData}
            onChange={salvarDadosDesafio}
            autenticado={autenticado}
          />
        )}

        {/* Rodapé Oculto/Discreto v6 e Créditos de Design */}
        <footer className="pt-10 pb-4 border-t border-border/30 flex flex-col sm:flex-row items-center justify-between text-[11px] text-muted-foreground gap-2">
          <span>&copy; 2026 Productivity Board. Todos os direitos reservados.</span>
          <div className="flex items-center gap-4">
            <span className="font-bold text-emerald-400 bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-800/20">Versão v10</span>
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

      {/* Diálogo de Autenticação de Usuário */}
      <DialogoLoginUsuario
        isOpen={loginUsuarioAberto}
        onClose={() => setLoginUsuarioAberto(false)}
        onLoginSuccess={handleLoginUsuarioSuccess}
      />
    </div>
  );
}
