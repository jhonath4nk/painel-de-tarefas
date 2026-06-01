import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon, Plus, Trash2 } from "lucide-react";

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

  useEffect(() => {
    if (isOpen) {
      setNome(dadosIniciais?.nome || "");
      setDescricao(dadosIniciais?.descricao || "");
      setPrazo(dadosIniciais?.prazo || "");
      setIcone(dadosIniciais?.icone || "Target");
    }
  }, [isOpen, dadosIniciais]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !prazo) return;

    onSave({
      ...dadosIniciais,
      nome,
      descricao: tipo !== "submeta" ? descricao : undefined,
      prazo,
      ...(tipo === "objetivo" ? { icone } : {})
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
      <DialogContent className="sm:max-w-[480px] bg-card text-card-foreground border-border rounded-2xl soft-shadow p-6">
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
            <Label htmlFor="nome" className="text-sm font-medium text-foreground">
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
              <Label htmlFor="descricao" className="text-sm font-medium text-foreground">
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
              <Label htmlFor="prazo" className="text-sm font-medium text-foreground">
                Prazo Final <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="prazo"
                  type="date"
                  value={prazo}
                  onChange={(e) => setPrazo(e.target.value)}
                  required
                  className="bg-background border-border rounded-lg text-foreground focus:ring-primary/20 pr-10"
                />
              </div>
            </div>

            {tipo === "objetivo" && (
              <div className="space-y-2">
                <Label htmlFor="icone" className="text-sm font-medium text-foreground">
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

          <DialogFooter className="pt-4 flex sm:justify-between items-center gap-2">
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
