import { Link, useLocation } from "react-router-dom";
import { TimerOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";

export default function SessionExpiredPage() {
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? ROUTES.portal.home;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-background">
      <TimerOff className="h-14 w-14 text-warning mb-4" />
      <h1 className="text-2xl font-bold">Sessão expirada</h1>
      <p className="text-sm text-muted-foreground max-w-md mt-2">
        Por segurança, o acesso foi encerrado após um período de inatividade. Faça login novamente para continuar.
      </p>
      <Button asChild className="mt-8">
        <Link to={ROUTES.access.login} state={{ from }}>
          Refazer login
        </Link>
      </Button>
    </div>
  );
}
