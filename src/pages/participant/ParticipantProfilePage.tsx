import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/auth/AuthContext";
import { useCapacitaSelector } from "@/services/capacitaStore";
import { secretariatName } from "@/domain/selectors";
import { maskCpfForDisplay } from "@/domain/normalize";

export default function ParticipantProfilePage() {
  const { user } = useAuth();
  const sec = useCapacitaSelector((s) => (user ? secretariatName(s, user.secretariatId) : "—"));

  if (!user) return null;

  return (
    <main className="page-container max-w-2xl space-y-6">
      <div>
        <h1 className="page-title">Perfil institucional</h1>
        <p className="page-subtitle">Dados mantidos pela administração municipal. Em caso de divergência, contate o RH.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Identificação</CardTitle>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-4 text-sm">
          <div>
            <Label className="text-muted-foreground">Nome</Label>
            <p className="font-medium">{user.fullName}</p>
          </div>
          <div>
            <Label className="text-muted-foreground">Matrícula</Label>
            <p className="font-medium">{user.registrationNumber}</p>
          </div>
          <div>
            <Label className="text-muted-foreground">CPF</Label>
            <p className="font-medium tracking-wide">{maskCpfForDisplay(user.cpf)}</p>
          </div>
          <div>
            <Label className="text-muted-foreground">Nascimento</Label>
            <p className="font-medium">{new Date(user.birthDate).toLocaleDateString("pt-BR")}</p>
          </div>
          <div className="sm:col-span-2">
            <Label className="text-muted-foreground">E-mail</Label>
            <p className="font-medium break-all">{user.email}</p>
          </div>
          <div>
            <Label className="text-muted-foreground">Secretaria de lotação</Label>
            <p className="font-medium">{sec}</p>
          </div>
          <div>
            <Label className="text-muted-foreground">Perfil de acesso</Label>
            <p className="font-medium capitalize">{user.role.replace("_", " ")}</p>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
