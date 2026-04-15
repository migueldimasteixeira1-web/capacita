import { Link } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import { useCapacitaSelector } from "@/services/capacitaStore";
import { useInstructorProfileForUser } from "@/hooks/useInstructorProfile";
import { ROUTES } from "@/constants/routes";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { courseLifecycleLabel } from "@/domain/rules";
import { InlineEmpty } from "@/components/system/PageStates";

export default function InstructorCoursesPage() {
  const { user } = useAuth();
  const profile = useInstructorProfileForUser(user);
  const courses = useCapacitaSelector((s) =>
    profile ? s.courses.filter((c) => c.primaryInstructorId === profile.id) : []
  );

  if (!profile) {
    return (
      <InlineEmpty
        title="Sem vínculo instrucional"
        description="Procure a coordenação do programa para associar seu usuário a um cadastro de instrutor."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Cursos designados</h1>
        <p className="page-subtitle">Somente turmas nas quais você figura como instrutor principal.</p>
      </div>

      {courses.length === 0 ? (
        <InlineEmpty title="Nenhuma turma ativa" description="Novas designações aparecerão automaticamente aqui." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {courses.map((c) => (
            <Card key={c.id} className="card-hover">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold leading-snug">{c.title}</h3>
                  <Badge variant="secondary" className="shrink-0 text-[10px]">
                    {courseLifecycleLabel(c.status)}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {c.workloadHours}h • {c.modality} • {new Date(c.displayDate).toLocaleDateString("pt-BR")}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Link
                    className="text-sm text-primary hover:underline"
                    to={ROUTES.instructor.course(c.id)}
                  >
                    Detalhes
                  </Link>
                  <span className="text-muted-foreground">·</span>
                  <Link
                    className="text-sm text-primary hover:underline"
                    to={ROUTES.instructor.participants(c.id)}
                  >
                    Participantes
                  </Link>
                  <span className="text-muted-foreground">·</span>
                  <Link
                    className="text-sm text-primary hover:underline"
                    to={ROUTES.instructor.document(c.id)}
                  >
                    Documento
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
