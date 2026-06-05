import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Github, Key, Check, HelpCircle, AlertCircle, Loader2 } from "lucide-react";
import { validarGitHubToken, GitHubUser } from "@/lib/githubService";
import { toast } from "sonner";

interface DialogoLoginGitHubProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (token: string, user: GitHubUser) => void;
}

export default function DialogoLoginGitHub({
  isOpen,
  onClose,
  onLoginSuccess,
}: DialogoLoginGitHubProps) {
  const [token, setToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mostrarAjuda, setMostrarAjuda] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) return;

    setIsLoading(true);
    try {
      const user = await validarGitHubToken(token.trim());
      onLoginSuccess(token.trim(), user);
      toast.success(`Bem-vindo, ${user.name}! Sincronização ativada.`);
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Falha na validação do Token.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[460px] bg-card text-card-foreground border-border rounded-2xl soft-shadow p-6">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-2 text-primary">
            <Github className="w-6 h-6" />
            <DialogTitle className="text-xl font-bold tracking-tight">
              Conectar Nuvem do GitHub
            </DialogTitle>
          </div>
          <DialogDescription className="text-sm text-muted-foreground">
            Sincronize e salve suas metas automaticamente na sua conta do GitHub. Perfeito para hospedagem gratuita!
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleLogin} className="space-y-4 py-3">
          <div className="space-y-2">
            <Label htmlFor="token" className="text-sm font-semibold flex items-center justify-between">
              <span>GitHub Personal Access Token (PAT)</span>
              <button
                type="button"
                onClick={() => setMostrarAjuda(!mostrarAjuda)}
                className="text-xs text-primary hover:underline flex items-center gap-1 font-normal"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                Como obter?
              </button>
            </Label>
            
            <div className="relative">
              <Input
                id="token"
                type="password"
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                required
                className="bg-background border-border rounded-lg text-foreground focus:ring-primary/20 pl-10"
              />
              <Key className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3" />
            </div>
          </div>

          {/* Passo a Passo de Ajuda */}
          {mostrarAjuda && (
            <div className="bg-secondary/30 border border-border/50 rounded-xl p-4 space-y-3 text-xs text-muted-foreground leading-relaxed animate-in fade-in-50 duration-200">
              <div className="flex items-center gap-1.5 text-foreground font-bold">
                <AlertCircle className="w-4 h-4 text-primary" />
                Passo a passo rápido:
              </div>
              <ol className="list-decimal pl-4 space-y-2">
                <li>
                  Acesse sua conta do GitHub e vá em{" "}
                  <a
                    href="https://github.com/settings/tokens/new?description=Tidly%20Dashboard&scopes=gist"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline font-semibold"
                  >
                    Gerar Novo Token (Link Direto)
                  </a>.
                </li>
                <li>
                  Insira uma descrição (ex: <code>Tidly Dashboard</code>).
                </li>
                <li>
                  Marque apenas a permissão <strong><code>gist</code></strong> (necessária para criar o arquivo privado de dados).
                </li>
                <li>
                  Clique em <strong>Generate token</strong> no final da página.
                </li>
                <li>
                  Copie o token gerado (ele começa com <code>ghp_</code>) e cole no campo acima!
                </li>
              </ol>
            </div>
          )}

          <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-3 flex items-start gap-2.5 text-xs text-muted-foreground">
            <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <p>
              Seus dados serão armazenados em um <strong>Gist Privado</strong> na sua própria conta. Ninguém além de você terá acesso a eles.
            </p>
          </div>

          <DialogFooter className="pt-2 flex gap-2 justify-end">
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
              disabled={isLoading}
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg flex items-center gap-1.5"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Validando...
                </>
              ) : (
                "Conectar e Sincronizar"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
