import { Link } from "react-router-dom";
import { ClipboardList, GraduationCap, Award, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/auth/AuthContext";
import { useCapacitaSelector } from "@/services/capacitaStore";
import { courseIsVisibleToParticipant } from "@/domain/rules";

export default function ParticipantHomePage() {
  const { user } = useAuth();
  const coursesOpen = useCapacitaSelector((s) =>
    s.courses.filter(
      (c) => c.status === "inscricoes_abertas" && courseIsVisibleToParticipant(c)
    ).length
  );
  const myEnrollments = useCapacitaSelector(
    (s) => s.enrollments.filter((e) => e.participantId === user?.id).length
  );
  const certs = useCapacitaSelector(
    (s) => s.certificates.filter((c) => s.enrollments.find((e) => e.id === c.enrollmentId)?.participantId === user?.id).length
  );

  return (
    <main className="page-container max-w-5xl">
      <div className="mb-10">
        <h1 className="page-title">Portal do servidor</h1>
        <p className="page-subtitle">
          Olá, {user?.fullName}. Acompanhe cursos internos, inscrições e certificados emitidos pela gestão de capacitação.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3 mb-10">
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{coursesOpen}</p>
              <p className="text-xs text-muted-foreground">Cursos com inscrições abertas</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-11 w-11 rounded-xl bg-info/10 flex items-center justify-center text-info">
              <ClipboardList className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{myEnrollments}</p>
              <p className="text-xs text-muted-foreground">Suas inscrições ativas</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-11 w-11 rounded-xl bg-success/10 flex items-center justify-center text-success">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{certs}</p>
              <p className="text-xs text-muted-foreground">Certificados disponíveis</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Card className="border-dashed">
          <CardContent className="p-6 flex flex-col gap-4">
            <div>
              <h2 className="section-title">Nova capacitação</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Consulte editais internos, requisitos e prazos de inscrição.
              </p>
            </div>
            <Button asChild className="gap-2 w-fit">
              <Link to={ROUTES.portal.courses}>
                Ver cursos disponíveis <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="border-dashed">
          <CardContent className="p-6 flex flex-col gap-4">
            <div>
              <h2 className="section-title">Acompanhamento</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Status de validação, presença e certificação ficam centralizados aqui.
              </p>
            </div>
            <Button asChild variant="secondary" className="gap-2 w-fit">
              <Link to={ROUTES.portal.enrollments}>
                Minhas inscrições <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
