import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";

export default function NotFound() {
  const location = useLocation();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="text-center max-w-md space-y-4">
        <p className="text-sm font-medium text-muted-foreground">Erro 404</p>
        <h1 className="text-2xl font-bold text-foreground">Página não encontrada</h1>
        <p className="text-sm text-muted-foreground">
          O endereço <span className="font-mono text-xs">{location.pathname}</span> não existe neste sistema interno.
        </p>
        <Button asChild>
          <Link to={ROUTES.access.login}>Ir para o acesso institucional</Link>
        </Button>
      </div>
    </div>
  );
}
