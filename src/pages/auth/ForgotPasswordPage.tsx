import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { findUserByRegistrationOrCpf } from "@/services/capacitaActions";
import { validateInstitutionalIdentity } from "@/domain/rules";
import { ROUTES } from "@/constants/routes";
import { toast } from "sonner";
import { formatCpfMask, onlyDigits } from "@/domain/normalize";

const RECOVERY_KEY = "capacita-recovery-v1";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [registration, setRegistration] = useState("");
  const [cpf, setCpf] = useState("");
  const [birth, setBirth] = useState("");
  const [busy, setBusy] = useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const u = findUserByRegistrationOrCpf(registration.trim());
      if (!u || !validateInstitutionalIdentity(u, onlyDigits(cpf), birth.trim())) {
        toast.error("Não foi possível validar seus dados. Verifique as informações ou procure o suporte.");
        return;
      }
      sessionStorage.setItem(
        RECOVERY_KEY,
        JSON.stringify({ userId: u.id, exp: Date.now() + 15 * 60 * 1000 })
      );
      toast.message("Identidade validada", {
        description: "Defina uma nova senha na próxima etapa.",
      });
      navigate(ROUTES.access.reset, { replace: true });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6 space-y-4">
          <div>
            <h1 className="text-xl font-bold">Recuperação de senha</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Informe os mesmos dados usados no primeiro acesso. Nenhum e-mail externo é enviado nesta demonstração.
            </p>
          </div>
          <form className="space-y-3" onSubmit={onSubmit}>
            <div className="space-y-2">
              <Label>Matrícula ou CPF (login)</Label>
              <Input value={registration} onChange={(e) => setRegistration(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>CPF (confirmação)</Label>
              <Input value={cpf} onChange={(e) => setCpf(formatCpfMask(e.target.value))} required />
            </div>
            <div className="space-y-2">
              <Label>Data de nascimento</Label>
              <Input type="date" value={birth} onChange={(e) => setBirth(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full" disabled={busy}>
              Continuar
            </Button>
          </form>
          <p className="text-xs text-center text-muted-foreground">
            <Link to={ROUTES.access.login} className="text-primary hover:underline">
              Voltar ao login
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
