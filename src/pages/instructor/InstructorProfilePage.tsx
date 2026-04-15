import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/auth/AuthContext";
import { useInstructorProfileForUser } from "@/hooks/useInstructorProfile";
import { maskCpfForDisplay } from "@/domain/normalize";

export default function InstructorProfilePage() {
  const { user } = useAuth();
  const profile = useInstructorProfileForUser(user);

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="page-title">Perfil</h1>
        <p className="page-subtitle">Informações do seu usuário institucional e cadastro de instrução.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Usuário</CardTitle>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-3 text-sm">
          <div>
            <Label className="text-muted-foreground">Nome</Label>
            <p className="font-medium">{user?.fullName}</p>
          </div>
          <div>
            <Label className="text-muted-foreground">Matrícula</Label>
            <p className="font-medium">{user?.registrationNumber}</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cadastro de instrutor</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          {profile ? (
            <>
              <p>
                <span className="text-muted-foreground">Nome completo:</span> {profile.fullName}
              </p>
              <p>
                <span className="text-muted-foreground">CPF:</span> {maskCpfForDisplay(profile.cpf)}
              </p>
              <p>
                <span className="text-muted-foreground">Especialidade:</span> {profile.specialty}
              </p>
            </>
          ) : (
            <p className="text-muted-foreground">Sem vínculo ativo — procure a coordenação.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
