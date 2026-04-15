import { Link, useLocation, useNavigate } from "react-router-dom";
import { BookOpen, Lock, UserSquare2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { useAuth } from "@/auth/AuthContext";
import { ROUTES } from "@/constants/routes";
import { toast } from "sonner";

const DEMO_PROFILES = [
  { label: "Participante", identifier: "2024001", password: "Capacita@2026" },
  { label: "Instrutor", identifier: "500100", password: "Instrutor@2026" },
  { label: "Gestor", identifier: "900200", password: "Admin@2026!" },
  { label: "Administrador", identifier: "900100", password: "Admin@2026!" },
];

export default function AccessLoginPage() {
  const { login, postLoginRoute, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from;

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) navigate(postLoginRoute(user), { replace: true });
  }, [user, navigate, postLoginRoute]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await login(identifier.trim(), password);
      if (!res.ok) {
        toast.error(res.message);
        return;
      }
      toast.success("Acesso autorizado.");
      const dest =
        from && !from.startsWith("/acesso") ? from : postLoginRoute(res.user);
      navigate(dest, { replace: true });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary mx-auto">
            <BookOpen className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Acesso institucional</h1>
          <p className="text-sm text-muted-foreground">
            Portal interno de capacitação. Utilize matrícula ou CPF cadastrados na base da prefeitura.
          </p>
        </div>

        <Card>
          <CardHeader className="pb-2" />
          <CardContent>
            <form className="space-y-4" onSubmit={onSubmit}>
              <div className="space-y-2">
                <Label htmlFor="id">Matrícula ou CPF</Label>
                <div className="relative">
                  <UserSquare2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="id"
                    className="pl-9"
                    autoComplete="username"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Ex.: 2024001"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between gap-2">
                  <Label htmlFor="pw">Senha</Label>
                  <Link to={ROUTES.access.forgot} className="text-xs text-primary hover:underline">
                    Esqueci minha senha
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="pw"
                    type="password"
                    className="pl-9"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
              <Button className="w-full" type="submit" disabled={busy}>
                {busy ? "Validando…" : "Entrar"}
              </Button>
            </form>
            <p className="text-center text-sm text-muted-foreground mt-4">
              Primeiro acesso?{" "}
              <Link to={ROUTES.access.firstAccess} className="text-primary font-medium hover:underline">
                Validar identidade e criar senha
              </Link>
            </p>
          </CardContent>
        </Card>

        <p className="text-[11px] text-center text-muted-foreground leading-relaxed">
          O cadastro é realizado apenas pela administração municipal. Não há autoinscrição pública neste sistema.
        </p>
        <Card className="bg-muted/40">
          <CardContent className="pt-5 space-y-3">
            <p className="text-xs text-muted-foreground">
              Perfis de demonstração para navegar por todas as áreas do sistema.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_PROFILES.map((profile) => (
                <Button
                  key={profile.label}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIdentifier(profile.identifier);
                    setPassword(profile.password);
                  }}
                >
                  {profile.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
