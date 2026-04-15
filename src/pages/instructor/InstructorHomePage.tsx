import { Link } from "react-router-dom";
import { BookOpen, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/auth/AuthContext";
import { useCapacitaSelector } from "@/services/capacitaStore";
import { useInstructorProfileForUser } from "@/hooks/useInstructorProfile";

export default function InstructorHomePage() {
  const { user } = useAuth();
  const profile = useInstructorProfileForUser(user);
  const count = useCapacitaSelector(
    (s) =>
      s.courses.filter((c) => c.primaryInstructorId && c.primaryInstructorId === profile?.id).length
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="page-title">Área do instrutor</h1>
        <p className="page-subtitle">
          {profile
            ? `${profile.fullName} — acompanhe turmas designadas e documentação institucional.`
            : "Perfil de instrutor não vinculado a um cadastro interno."}
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <BookOpen className="h-8 w-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">{count}</p>
              <p className="text-xs text-muted-foreground">Cursos com sua designação principal</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <FileText className="h-4 w-4" /> Documentação
            </div>
            <p className="text-xs text-muted-foreground">
              Portarias de designação e declarações de abono ficam disponíveis por curso, após geração pela coordenação.
            </p>
            <Button asChild size="sm" variant="outline" className="w-fit">
              <Link to={ROUTES.instructor.courses}>Ver cursos</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
