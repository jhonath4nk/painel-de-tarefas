import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sha256, SENHA_HASH_ESPERADA, USUARIO_ESPERADO } from "@/lib/sha256";
import { toast } from "sonner";
import { Lock, User } from "lucide-react";

interface DialogoLoginUsuarioProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export default function DialogoLoginUsuario({ isOpen, onClose, onLoginSuccess }: DialogoLoginUsuarioProps) {
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuario.trim() || !senha.trim()) {
      toast.error("Por favor, preencha todos os campos.");
      return;
    }

    setIsLoading(true);
    try {
      const hashDigitado = await sha256(senha);
      
      // Validação segura com hash criptográfico
      if (usuario.trim().toLowerCase() === USUARIO_ESPERADO.toLowerCase() && hashDigitado === SENHA_HASH_ESPERADA) {
        toast.success(`Bem-vindo de volta, ${USUARIO_ESPERADO}!`);
        onLoginSuccess();
        setUsuario("");
        setSenha("");
        onClose();
      } else {
        toast.error("Usuário ou senha incorretos.");
      }
    } catch (err) {
      console.error("Erro na autenticação:", err);
      toast.error("Erro ao processar a autenticação.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[380px] bg-card border-border/80 text-foreground">
        <DialogHeader className="space-y-2">
          <div className="mx-auto p-3 bg-primary/10 rounded-full w-fit text-primary mb-1">
            <Lock className="w-6 h-6" />
          </div>
          <DialogTitle className="text-center text-xl font-bold tracking-tight">
            Área Restrita
          </DialogTitle>
          <DialogDescription className="text-center text-xs text-muted-foreground">
            Insira suas credenciais para liberar as permissões de edição e gerenciamento de metas.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="usuario" className="text-xs font-medium text-muted-foreground">Usuário</Label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/70" />
              <Input
                id="usuario"
                placeholder="Seu usuário"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                className="pl-9 bg-background/50 border-border/60 focus:border-primary/80"
                autoComplete="username"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="senha" className="text-xs font-medium text-muted-foreground">Senha</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/70" />
              <Input
                id="senha"
                type="password"
                placeholder="Sua senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="pl-9 bg-background/50 border-border/60 focus:border-primary/80"
                autoComplete="current-password"
              />
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="w-full sm:w-auto border-border/60 hover:bg-muted"
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
              disabled={isLoading}
            >
              {isLoading ? "Autenticando..." : "Entrar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
