import { Link, useNavigate } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { useAuth } from "@/auth/AuthContext";
import { ROUTES } from "@/constants/routes";
import { toast } from "sonner";
import { formatCpfMask, onlyDigits } from "@/domain/normalize";

export default function FirstAccessPage() {
  const { completeFirstAccess } = useAuth();
  const navigate = useNavigate();
  const [registration, setRegistration] = useState("");
  const [cpf, setCpf] = useState("");
  const [birth, setBirth] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pw !== pw2) {
      toast.error("As senhas não conferem.");
      return;
    }
    setBusy(true);
    try {
      const res = await completeFirstAccess(registration.trim(), onlyDigits(cpf), birth.trim(), pw);
      if (!res.ok) {
        toast.error(res.message);
        return;
      }
      toast.success("Senha criada. Bem-vindo(a).");
      navigate(ROUTES.portal.home, { replace: true });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center space-y-2">
          <BookOpen className="h-10 w-10 text-primary mx-auto" />
          <h1 className="text-2xl font-bold">Primeiro acesso</h1>
          <p className="text-sm text-muted-foreground">
            Validação por dados cadastrados pela administração. Após confirmar, defina uma senha pessoal e intransferível.
          </p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <form className="space-y-4" onSubmit={onSubmit}>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Matrícula funcional</Label>
                  <Input value={registration} onChange={(e) => setRegistration(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Data de nascimento</Label>
                  <Input type="date" value={birth} onChange={(e) => setBirth(e.target.value)} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label>CPF</Label>
                <Input
                  value={cpf}
                  onChange={(e) => setCpf(formatCpfMask(e.target.value))}
                  placeholder="000.000.000-00"
                  required
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nova senha</Label>
                  <Input type="password" value={pw} onChange={(e) => setPw(e.target.value)} minLength={8} required />
                </div>
                <div className="space-y-2">
                  <Label>Confirmar senha</Label>
                  <Input type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} minLength={8} required />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={busy}>
                {busy ? "Salvando…" : "Concluir primeiro acesso"}
              </Button>
            </form>
            <p className="text-xs text-muted-foreground mt-4 text-center">
              Problemas com a base? Contate o RH ou a TI da prefeitura.{" "}
              <Link className="text-primary hover:underline" to={ROUTES.access.login}>
                Voltar ao login
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
