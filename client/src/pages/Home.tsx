import React, { useState, useEffect } from "react";
import { Objetivo, Meta, Submeta, DADOS_INICIAIS } from "@/lib/types";
import SidebarDashboard from "@/components/SidebarDashboard";
import HeaderDashboard from "@/components/HeaderDashboard";
import HeroVideo from "@/components/HeroVideo";
import TimelineLinhas from "@/components/TimelineLinhas";
import DialogoEdicao from "@/components/DialogoEdicao";
import GraficoProgresso from "@/components/GraficoProgresso";
import { toast } from "sonner";
import { HelpCircle, RefreshCw } from "lucide-react";

export default function Home() {
  const [objetivos, setObjetivos] = useState<Objetivo[]>([]);
  const [isCarregado, setIsCarregado] = useState(false);

  // Estados dos Diálogos
  const [dialogoAberto, setDialogoAberto] = useState(false);
  const [tipoDialogo, setTipoDialogo] = useState<"objetivo" | "meta" | "submeta">("objetivo");
  const [modoDialogo, setModoDialogo] = useState<"criar" | "editar">("criar");
  const [dadosEdicao, setDadosEdicao] = useState<any>(null);

  // IDs de apoio para criação de filhos
  const [idObjetivoAtivo, setIdObjetivoAtivo] = useState<string | null>(null);
  const [idMetaAtiva, setIdMetaAtiva] = useState<string | null>(null);

  // Carregar do localStorage ou iniciar com mocks
  useEffect(() => {
    const dadosSalvos = localStorage.getItem("tidly_objetivos");
    if (dadosSalvos) {
      try {
        setObjetivos(JSON.parse(dadosSalvos));
      } catch {
        setObjetivos(DADOS_INICIAIS);
      }
    } else {
      setObjetivos(DADOS_INICIAIS);
    }
    setIsCarregado(true);
  }, []);

  // Salvar no localStorage sempre que objetivos mudarem
  const salvarDados = (novosObjetivos: Objetivo[]) => {
    setObjetivos(novosObjetivos);
    localStorage.setItem("tidly_objetivos", JSON.stringify(novosObjetivos));
  };

  // Alternar conclusão de submeta
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
              if (novoEstado) {
                toast.success(`Submeta "${sub.nome}" concluída!`);
              }
              return { ...sub, concluida: novoEstado };
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
                concluida: false
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
    setDadosEdicao({ prazo: new Date().toISOString().split("T")[0] });
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
    if (confirm("Deseja redefinir o painel para os dados iniciais? Todas as suas alterações serão perdidas.")) {
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
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      {/* Barra Lateral Esquerda */}
      <SidebarDashboard 
        onCriarObjetivo={abrirCriarObjetivo}
        onLimparDados={handleLimparDados}
      />

      {/* Conteúdo Principal do Dashboard */}
      <main className="flex-1 p-6 lg:p-10 space-y-8 overflow-y-auto max-w-6xl mx-auto w-full">
        {/* Header Principal com Big Numbers diretamente no topo */}
        <HeaderDashboard objetivos={objetivos} />

        {/* Seção da Timeline de Objetivos e Metas LOGO ABAIXO */}
        <div className="space-y-4 pt-2">
          <TimelineLinhas 
            objetivos={objetivos}
            onToggleSubmeta={handleToggleSubmeta}
            onEditarObjetivo={abrirEditarObjetivo}
            onEditarMeta={abrirEditarMeta}
            onEditarSubmeta={abrirEditarSubmeta}
            onCriarMeta={abrirCriarMeta}
            onCriarSubmeta={abrirCriarSubmeta}
          />
        </div>

        {/* Rodapé Conceitual v6 */}
        <footer className="pt-12 pb-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© 2026 Tidly Productivity Inc. Todos os direitos reservados.</p>
          <div className="flex items-center gap-4">
            <span>v6 no rodapé</span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
            <span>Design Neo-Nordic</span>
          </div>
        </footer>
      </main>

      {/* Diálogo Reutilizável de Criação e Edição */}
      <DialogoEdicao 
        isOpen={dialogoAberto}
        onClose={() => setDialogoAberto(false)}
        tipo={tipoDialogo}
        modo={modoDialogo}
        dadosIniciais={dadosEdicao}
        onSave={handleSaveDialogo}
        onDelete={handleDelete}
      />
    </div>
  );
}
