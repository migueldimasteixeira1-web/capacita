import { Link } from "react-router-dom";
import { ShieldOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/auth/AuthContext";

export default function AccessDeniedPage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-background">
      <ShieldOff className="h-14 w-14 text-destructive/80 mb-4" />
      <h1 className="text-2xl font-bold text-foreground">Acesso negado</h1>
      <p className="text-sm text-muted-foreground max-w-md mt-2">
        {user
          ? `O perfil vinculado (${user.fullName}) não tem permissão para este recurso ou módulo.`
          : "É necessário autenticação válida para continuar."}
      </p>
      <div className="flex gap-3 mt-8">
        {user ? (
          <>
            <Button variant="outline" onClick={() => logout(ROUTES.access.login)}>
              Sair e tentar outra conta
            </Button>
            <Button asChild>
              <Link to={ROUTES.access.login}>Ir ao login</Link>
            </Button>
          </>
        ) : (
          <Button asChild>
            <Link to={ROUTES.access.login}>Ir ao login</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
