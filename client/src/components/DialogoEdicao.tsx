import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, CheckCircle2, Circle } from "lucide-react";
import { Etapa } from "@/lib/types";

interface DialogoEdicaoProps {
  isOpen: boolean;
  onClose: () => void;
  tipo: "objetivo" | "meta" | "submeta";
  modo: "criar" | "editar";
  dadosIniciais?: any;
  onSave: (dados: any) => void;
  onDelete?: () => void;
}

export default function DialogoEdicao({
  isOpen,
  onClose,
  tipo,
  modo,
  dadosIniciais,
  onSave,
  onDelete
}: DialogoEdicaoProps) {
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [prazo, setPrazo] = useState("");
  const [icone, setIcone] = useState("Target");
  
  // Estado específico para gerenciar as Etapas da Submeta
  const [etapas, setEtapas] = useState<Etapa[]>([]);
  const [novaEtapaNome, setNovaEtapaNome] = useState("");

  useEffect(() => {
    if (isOpen) {
      setNome(dadosIniciais?.nome || "");
      setDescricao(dadosIniciais?.descricao || "");
      setPrazo(dadosIniciais?.prazo || "");
      setIcone(dadosIniciais?.icone || "Target");
      setEtapas(dadosIniciais?.etapas || []);
      setNovaEtapaNome("");
    }
  }, [isOpen, dadosIniciais]);

  const handleAdicionarEtapa = () => {
    if (!novaEtapaNome.trim()) return;
    const nova: Etapa = {
      id: `etapa-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      nome: novaEtapaNome.trim(),
      concluida: false
    };
    setEtapas(prev => [...prev, nova]);
    setNovaEtapaNome("");
  };

  const handleRemoverEtapa = (id: string) => {
    setEtapas(prev => prev.filter(e => e.id !== id));
  };

  const handleToggleEtapaInterna = (id: string) => {
    setEtapas(prev => prev.map(e => e.id === id ? { ...e, concluida: !e.concluida } : e));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !prazo) return;

    // Se todas as etapas estiverem concluídas (e houver pelo menos uma etapa), marcar a submeta como concluída
    const todasConcluidas = etapas.length > 0 && etapas.every(e => e.concluida);

    onSave({
      ...dadosIniciais,
      nome,
      descricao: tipo !== "submeta" ? descricao : undefined,
      prazo,
      ...(tipo === "objetivo" ? { icone } : {}),
      ...(tipo === "submeta" ? { etapas, concluida: todasConcluidas } : {})
    });
    onClose();
  };

  const labelTipo = {
    objetivo: "Objetivo",
    meta: "Meta",
    submeta: "Submeta"
  }[tipo];

  const iconesDisponiveis = [
    "Target", "TrendingUp", "Award", "Heart", "Briefcase", "Globe", "Cpu", "Users"
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto bg-card text-card-foreground border-border rounded-2xl soft-shadow p-6">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-xl font-semibold tracking-tight">
            {modo === "criar" ? `Criar Novo ${labelTipo}` : `Editar ${labelTipo}`}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {modo === "criar" 
              ? `Preencha as informações para criar um novo ${labelTipo.toLowerCase()} na sua timeline.`
              : `Atualize as informações do seu ${labelTipo.toLowerCase()} ou remova-o.`
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-4">
          <div className="space-y-2">
            <Label htmlFor="nome" className="text-sm font-semibold text-foreground">
              Nome do {labelTipo} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="nome"
              placeholder={`Ex: ${tipo === "objetivo" ? "Expandir para o mercado internacional" : tipo === "meta" ? "Inaugurar filial na Europa" : "Pesquisar locais de locação"}`}
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              className="bg-background border-border rounded-lg text-foreground focus:ring-primary/20"
            />
          </div>

          {tipo !== "submeta" && (
            <div className="space-y-2">
              <Label htmlFor="descricao" className="text-sm font-semibold text-foreground">
                Descrição <span className="text-muted-foreground font-normal">(Opcional)</span>
              </Label>
              <Textarea
                id="descricao"
                placeholder="Uma breve descrição sobre o que se trata..."
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                className="bg-background border-border rounded-lg text-foreground focus:ring-primary/20 min-h-[80px]"
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="prazo" className="text-sm font-semibold text-foreground">
                Prazo Final <span className="text-destructive">*</span>
              </Label>
              <Input
                id="prazo"
                type="date"
                value={prazo}
                onChange={(e) => setPrazo(e.target.value)}
                required
                className="bg-background border-border rounded-lg text-foreground focus:ring-primary/20"
              />
            </div>

            {tipo === "objetivo" && (
              <div className="space-y-2">
                <Label htmlFor="icone" className="text-sm font-semibold text-foreground">
                  Ícone Representativo
                </Label>
                <select
                  id="icone"
                  value={icone}
                  onChange={(e) => setIcone(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg text-foreground focus:ring-primary/20 p-2 text-sm"
                >
                  {iconesDisponiveis.map((ic) => (
                    <option key={ic} value={ic}>
                      {ic}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Seção Exclusiva de Etapas de Execução para Submetas */}
          {tipo === "submeta" && (
            <div className="space-y-3 pt-2 border-t border-border/40">
              <Label className="text-sm font-bold text-foreground">
                Etapas de Execução
              </Label>
              <p className="text-xs text-muted-foreground">
                Adicione as pequenas tarefas que precisam ser feitas. A submeta será marcada como concluída quando todas estas etapas forem finalizadas.
              </p>

              {/* Campo para adicionar nova etapa */}
              <div className="flex gap-2">
                <Input
                  placeholder="Nova etapa (ex: Fazer orçamento com fornecedor)"
                  value={novaEtapaNome}
                  onChange={(e) => setNovaEtapaNome(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAdicionarEtapa();
                    }
                  }}
                  className="bg-background border-border rounded-lg text-foreground flex-1"
                />
                <Button 
                  type="button" 
                  onClick={handleAdicionarEtapa}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg shrink-0 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </Button>
              </div>

              {/* Lista de etapas adicionadas */}
              <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1 scrollbar-thin">
                {etapas.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-2 italic">
                    Nenhuma etapa adicionada. Crie pelo menos uma etapa para esta submeta.
                  </p>
                ) : (
                  etapas.map((etapa) => (
                    <div 
                      key={etapa.id} 
                      className="flex items-center justify-between gap-2 p-2 bg-secondary/20 border border-border/30 rounded-lg group"
                    >
                      <div 
                        className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
                        onClick={() => handleToggleEtapaInterna(etapa.id)}
                      >
                        {etapa.concluida ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-muted-foreground/60 shrink-0" />
                        )}
                        <span className={`text-xs font-medium truncate ${
                          etapa.concluida ? "text-muted-foreground line-through" : "text-foreground"
                        }`}>
                          {etapa.nome}
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoverEtapa(etapa.id)}
                        className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          <DialogFooter className="pt-4 border-t border-border/40 flex sm:justify-between items-center gap-2">
            {modo === "editar" && onDelete ? (
              <Button
                type="button"
                variant="destructive"
                onClick={() => {
                  onDelete();
                  onClose();
                }}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-lg flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                Excluir
              </Button>
            ) : (
              <div />
            )}

            <div className="flex gap-2 w-full sm:w-auto justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="border-border hover:bg-muted text-muted-foreground rounded-lg"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg"
              >
                {modo === "criar" ? "Criar" : "Salvar"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
