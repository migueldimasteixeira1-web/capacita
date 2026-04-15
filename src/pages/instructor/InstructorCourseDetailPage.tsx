import { Link, useParams } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import { useCapacitaSelector } from "@/services/capacitaStore";
import { useInstructorProfileForUser } from "@/hooks/useInstructorProfile";
import { instructorTeachesCourse } from "@/auth/permissions";
import { ROUTES } from "@/constants/routes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageState } from "@/components/system/PageStates";
import { secretariatName } from "@/domain/selectors";

export default function InstructorCourseDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const profile = useInstructorProfileForUser(user);
  const course = useCapacitaSelector((s) => s.courses.find((c) => c.id === id));
  const state = useCapacitaSelector((s) => s);

  if (!user || !profile || !course || !instructorTeachesCourse(user, course, profile.id)) {
    return <PageState title="Curso não disponível" description="Você não possui designação nesta turma." />;
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="page-title">{course.title}</h1>
        <p className="text-sm text-muted-foreground">
          Secretaria gestora: {secretariatName(state, course.ownerSecretariatId)}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Visão operacional</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>{course.description}</p>
          <p>
            Carga horária: {course.workloadHours}h • Local/modalidade: {course.location} ({course.modality})
          </p>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Button asChild>
          <Link to={ROUTES.instructor.participants(course.id)}>Participantes confirmados</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to={ROUTES.instructor.document(course.id)}>Documento de designação</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link to={ROUTES.instructor.attendance(course.id)}>Frequência da turma</Link>
        </Button>
      </div>
    </div>
  );
}
