import React from "react";
import { 
  LayoutDashboard, 
  Calendar, 
  Plus,
  Sparkles,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarDashboardProps {
  onCriarObjetivo: () => void;
  onLimparDados: () => void;
}

export default function SidebarDashboard({ onCriarObjetivo, onLimparDados }: SidebarDashboardProps) {
  return (
    <aside className="w-full lg:w-64 bg-card text-card-foreground border-b lg:border-b-0 lg:border-r border-border/80 p-6 flex flex-col justify-between gap-6 lg:min-h-screen">
      <div className="space-y-6">
        {/* Logo / Branding */}
        <div className="flex items-center gap-2.5 px-2">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
            T
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-foreground block">
              Tidly
            </span>
            <span className="text-[10px] font-semibold text-muted-foreground block uppercase tracking-wider">
              Productivity
            </span>
          </div>
        </div>

        {/* Botão de Ação Rápida */}
        <Button 
          onClick={onCriarObjetivo}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl py-5 font-bold text-sm flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Novo Objetivo
        </Button>

        {/* Menu de Navegação */}
        <nav className="space-y-1">
          <span className="text-[10px] font-bold text-muted-foreground px-2 uppercase tracking-wider block mb-2">
            Navegação
          </span>
          
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold bg-primary/10 text-primary transition-all">
            <LayoutDashboard className="w-4 h-4" />
            Painel Geral
          </button>
          
          <button 
            onClick={() => alert("Funcionalidade de calendário conceitual. Todos os prazos já estão organizados na timeline principal.")}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
          >
            <Calendar className="w-4 h-4" />
            Visão Mensal
          </button>
        </nav>
      </div>

      {/* Seção Inferior / Controles */}
      <div className="space-y-4 pt-6 border-t border-border/80">
        {/* Widget de Insights de IA */}
        <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-1.5 text-primary text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            Insight do Dia
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Foque nas submetas mais próximas do prazo para manter o ritmo constante de conquistas.
          </p>
        </div>

        <div className="space-y-1">
          <button 
            onClick={onLimparDados}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-destructive hover:bg-destructive/10 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            Redefinir Dados
          </button>
        </div>
      </div>
    </aside>
  );
}
