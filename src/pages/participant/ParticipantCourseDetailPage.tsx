import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, MapPin, User, FileText, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ROUTES } from "@/constants/routes";
import { useCapacitaSelector } from "@/services/capacitaStore";
import {
  courseIsVisibleToParticipant,
  courseLifecycleLabel,
  enrollmentOpenNow,
  occupiedSlots,
} from "@/domain/rules";
import { instructorDisplayName, secretariatName } from "@/domain/selectors";
import { PageState } from "@/components/system/PageStates";

export default function ParticipantCourseDetailPage() {
  const { id } = useParams();
  const { course, state } = useCapacitaSelector((s) => ({
    course: s.courses.find((c) => c.id === id),
    state: s,
  }));

  if (!course || !courseIsVisibleToParticipant(course)) {
    return (
      <main className="page-container">
        <PageState title="Curso não encontrado" description="Verifique o link ou retorne ao catálogo." />
        <div className="flex justify-center mt-4">
          <Button asChild variant="outline">
            <Link to={ROUTES.portal.courses}>Voltar</Link>
          </Button>
        </div>
      </main>
    );
  }

  const occ = occupiedSlots(state, course.id);
  const spotsLeft = Math.max(0, course.spots - occ);
  const now = new Date();
  const enrollWindow = enrollmentOpenNow(course, now);
  const canEnroll = course.status === "inscricoes_abertas" && enrollWindow;

  return (
    <main className="page-container">
      <Link
        to={ROUTES.portal.courses}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar ao catálogo
      </Link>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge variant="secondary">{course.category}</Badge>
              <Badge>{course.modality}</Badge>
              <Badge variant="outline">{courseLifecycleLabel(course.status)}</Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{course.title}</h1>
            <p className="mt-3 text-muted-foreground leading-relaxed">{course.description}</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Informações operacionais</CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4 text-sm">
              <div className="flex gap-3">
                <Calendar className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Referência</p>
                  <p className="text-muted-foreground">
                    {new Date(course.displayDate).toLocaleDateString("pt-BR", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Clock className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Carga e horário</p>
                  <p className="text-muted-foreground">
                    {course.workloadHours} horas • {course.displayTimeRange}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Local / modalidade</p>
                  <p className="text-muted-foreground">{course.location}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <User className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Instrução</p>
                  <p className="text-muted-foreground">
                    {instructorDisplayName(state, course.primaryInstructorId)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ListChecks className="h-4 w-4" /> Elegibilidade e presença
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>{course.eligibilityCriteria}</p>
              <p>
                Presença mínima exigida para certificação:{" "}
                <span className="font-medium text-foreground">{course.minimumAttendancePercent}%</span> das sessões
                registradas.
              </p>
              <p className="text-xs">
                Secretaria gestora: {secretariatName(state, course.ownerSecretariatId)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Documentação</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {course.requirements.map((req) => (
                  <li key={req} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4 text-primary shrink-0" />
                    {req}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-muted-foreground">Ocupação</span>
                  <span className="font-medium">
                    {occ}/{course.spots}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${Math.min(100, (occ / course.spots) * 100)}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {spotsLeft > 0 ? `${spotsLeft} vagas livres` : "Sem vagas — possível lista de espera"}
                </p>
              </div>

              {!canEnroll && (
                <p className="text-xs text-amber-700 dark:text-amber-400 bg-amber-500/10 rounded-md p-3">
                  {course.status !== "inscricoes_abertas"
                    ? "Inscrições não estão abertas para este curso."
                    : !enrollWindow
                      ? "Fora do período de inscrição institucional."
                      : "Não é possível inscrever-se neste momento."}
                </p>
              )}

              {canEnroll ? (
                <Button asChild className="w-full" size="lg">
                  <Link to={ROUTES.portal.enroll(course.id)}>Solicitar inscrição</Link>
                </Button>
              ) : (
                <Button className="w-full" size="lg" disabled>
                  Solicitar inscrição
                </Button>
              )}
              <p className="text-[11px] text-muted-foreground text-center leading-snug">
                Ao enviar, sua solicitação passará por validação da coordenação. O sistema não garante vaga automática.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
