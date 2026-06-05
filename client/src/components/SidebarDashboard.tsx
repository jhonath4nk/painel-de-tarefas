import React from "react";
import { 
  LayoutDashboard, 
  Calendar, 
  Plus,
  Sparkles,
  LogOut,
  Github,
  Cloud,
  CloudLightning,
  CloudOff,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { GitHubUser, SyncStatus } from "@/lib/githubService";

interface SidebarDashboardProps {
  onCriarObjetivo: () => void;
  onLimparDados: () => void;
  githubUser: GitHubUser | null;
  syncStatus: SyncStatus;
  onLoginClick: () => void;
  onLogoutClick: () => void;
}

export default function SidebarDashboard({ 
  onCriarObjetivo, 
  onLimparDados,
  githubUser,
  syncStatus,
  onLoginClick,
  onLogoutClick
}: SidebarDashboardProps) {
  return (
    <aside className="w-full lg:w-64 bg-card text-card-foreground border-b lg:border-b-0 lg:border-r border-border/80 p-6 flex flex-col justify-between gap-6 lg:min-h-screen shrink-0">
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

        {/* Widget de Sincronização do GitHub */}
        <div className="space-y-2 pt-2 border-t border-border/40">
          <span className="text-[10px] font-bold text-muted-foreground px-2 uppercase tracking-wider block mb-1">
            Nuvem & Backup
          </span>

          {githubUser ? (
            /* Conectado */
            <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-3.5 space-y-3">
              <div className="flex items-center gap-2">
                <img 
                  src={githubUser.avatar_url} 
                  alt={githubUser.name} 
                  className="w-7 h-7 rounded-full border border-emerald-500/20 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-bold text-foreground block truncate">
                    {githubUser.name}
                  </span>
                  <span className="text-[9px] text-muted-foreground block truncate">
                    @{githubUser.login}
                  </span>
                </div>
              </div>

              {/* Status de Sincronização */}
              <div className="flex items-center gap-2 text-[10px] font-medium">
                {syncStatus.status === "syncing" && (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 text-amber-500 animate-spin" />
                    <span className="text-amber-500 font-semibold">{syncStatus.message || "Sincronizando..."}</span>
                  </>
                )}
                {syncStatus.status === "success" && (
                  <>
                    <Cloud className="w-3.5 h-3.5 text-emerald-500" />
                    <div className="min-w-0 flex-1">
                      <span className="text-emerald-500 font-bold block">Online & Sincronizado</span>
                      {syncStatus.lastSync && (
                        <span className="text-[8px] text-muted-foreground block">Última sync: {syncStatus.lastSync}</span>
                      )}
                    </div>
                  </>
                )}
                {syncStatus.status === "error" && (
                  <>
                    <CloudLightning className="w-3.5 h-3.5 text-destructive animate-pulse" />
                    <span className="text-destructive font-bold">{syncStatus.message || "Erro de conexão"}</span>
                  </>
                )}
              </div>

              {/* Botão de Desconectar */}
              <button 
                onClick={onLogoutClick}
                className="w-full bg-secondary/40 hover:bg-secondary/80 text-[10px] font-bold text-muted-foreground hover:text-foreground transition-all py-1.5 rounded-lg border border-border/40"
              >
                Desconectar GitHub
              </button>
            </div>
          ) : (
            /* Desconectado */
            <div className="bg-secondary/10 border border-border/40 rounded-xl p-3.5 space-y-2.5">
              <div className="flex items-start gap-2">
                <CloudOff className="w-4 h-4 text-muted-foreground/80 shrink-0 mt-0.5" />
                <p className="text-[11px] text-muted-foreground leading-snug">
                  Seus dados estão salvos apenas neste navegador. Conecte ao GitHub para backup em nuvem permanente.
                </p>
              </div>
              <Button 
                onClick={onLoginClick}
                className="w-full bg-foreground text-background hover:bg-foreground/90 text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1.5"
              >
                <Github className="w-3.5 h-3.5" />
                Conectar GitHub
              </Button>
            </div>
          )}
        </div>
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
