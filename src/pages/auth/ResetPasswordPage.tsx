import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { setUserPassword } from "@/services/capacitaActions";
import { hashPassword } from "@/lib/password";
import { ROUTES } from "@/constants/routes";
import { toast } from "sonner";

const RECOVERY_KEY = "capacita-recovery-v1";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const raw = sessionStorage.getItem(RECOVERY_KEY);
    if (!raw) {
      toast.error("Sessão de recuperação expirada.");
      navigate(ROUTES.access.forgot, { replace: true });
      return;
    }
    const { userId, exp } = JSON.parse(raw) as { userId: string; exp: number };
    if (Date.now() > exp) {
      sessionStorage.removeItem(RECOVERY_KEY);
      toast.error("Tempo esgotado. Reinicie a recuperação.");
      navigate(ROUTES.access.forgot, { replace: true });
      return;
    }
    if (pw !== pw2) {
      toast.error("Senhas não conferem.");
      return;
    }
    if (pw.length < 8) {
      toast.error("Mínimo de 8 caracteres.");
      return;
    }
    setBusy(true);
    try {
      const h = await hashPassword(pw);
      setUserPassword(userId, h);
      sessionStorage.removeItem(RECOVERY_KEY);
      toast.success("Senha atualizada.");
      navigate(ROUTES.access.login, { replace: true });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6 space-y-4">
          <h1 className="text-xl font-bold">Definir nova senha</h1>
          <form className="space-y-3" onSubmit={onSubmit}>
            <div className="space-y-2">
              <Label>Nova senha</Label>
              <Input type="password" value={pw} onChange={(e) => setPw(e.target.value)} minLength={8} required />
            </div>
            <div className="space-y-2">
              <Label>Confirmar</Label>
              <Input type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} minLength={8} required />
            </div>
            <Button type="submit" className="w-full" disabled={busy}>
              Salvar
            </Button>
          </form>
          <p className="text-xs text-center">
            <Link to={ROUTES.access.login} className="text-primary hover:underline">
              Voltar ao login
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
