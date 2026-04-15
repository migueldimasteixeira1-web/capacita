import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/auth/AuthContext";
import { useCapacitaSelector } from "@/services/capacitaStore";
import { participantCheckInOut } from "@/services/capacitaActions";
import { withinCheckInWindow } from "@/domain/rules";
import { PageState } from "@/components/system/PageStates";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function ParticipantAttendancePage() {
  const { id } = useParams();
  const { user } = useAuth();
  const snap = useCapacitaSelector((s) => s);

  const enrollment = snap.enrollments.find((e) => e.id === id && e.participantId === user?.id);
  const course = enrollment ? snap.courses.find((c) => c.id === enrollment.courseId) : undefined;
  const sessions = enrollment
    ? snap.sessions.filter((x) => x.courseId === enrollment.courseId)
    : [];

  if (!enrollment || !course) {
    return (
      <main className="page-container">
        <PageState title="Inscrição inválida" />
 </main>
    );
  }

  if (enrollment.status !== "confirmada") {
    return (
      <main className="page-container max-w-lg">
        <PageState
          title="Presença indisponível"
          description="Somente inscrições confirmadas podem registrar frequência."
        />
        <Button asChild variant="outline" className="mt-4">
          <Link to={ROUTES.portal.enrollment(enrollment.id)}>Voltar</Link>
        </Button>
      </main>
    );
  }

  const now = new Date();

  if (sessions.length === 0) {
    return (
      <main className="page-container max-w-3xl space-y-6">
        <Link
          to={ROUTES.portal.enrollment(enrollment.id)}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>
        <PageState
          title="Sem sessões cadastradas"
          description="Coordenação ainda não publicou o calendário detalhado."
        />
      </main>
    );
  }

  return (
    <main className="page-container max-w-3xl space-y-6">
      <Link
        to={ROUTES.portal.enrollment(enrollment.id)}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Link>

      <div>
        <h1 className="page-title">Registro de presença</h1>
        <p className="page-subtitle">{course.title}</p>
      </div>

      <div className="space-y-4">
        {sessions.map((sess) => {
          const rec = snap.attendance.find(
            (a) => a.enrollmentId === enrollment.id && a.sessionId === sess.id
          );
          const windowOk = withinCheckInWindow(sess.date, sess.startTime, sess.endTime, now);
          return (
            <Card key={sess.id}>
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-base">{sess.label}</CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(sess.date).toLocaleDateString("pt-BR")} • {sess.startTime} – {sess.endTime}
                  </p>
                </div>
                <Badge variant={windowOk ? "default" : "secondary"}>
                  {windowOk ? "Janela aberta" : "Fora da janela"}
                </Badge>
              </CardHeader>
              <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>
                    Check-in:{" "}
                    {rec?.checkInAt
                      ? new Date(rec.checkInAt).toLocaleString("pt-BR")
                      : "não registrado"}
                  </p>
                  <p>
                    Check-out:{" "}
                    {rec?.checkOutAt
                      ? new Date(rec.checkOutAt).toLocaleString("pt-BR")
                      : "não registrado"}
                  </p>
                  <p className="text-xs">Status consolidado: {rec?.status ?? "não registrada"}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    disabled={!windowOk || !!rec?.checkInAt}
                    onClick={() => {
                      const r = participantCheckInOut({
                        enrollmentId: enrollment.id,
                        sessionId: sess.id,
                        kind: "in",
                        actorUserId: user!.id,
                      });
                      if (!r.ok) toast.error(r.message);
                      else toast.success("Check-in registrado.");
                    }}
                  >
                    Check-in
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={!windowOk || !rec?.checkInAt || !!rec?.checkOutAt}
                    onClick={() => {
                      const r = participantCheckInOut({
                        enrollmentId: enrollment.id,
                        sessionId: sess.id,
                        kind: "out",
                        actorUserId: user!.id,
                      });
                      if (!r.ok) toast.error(r.message);
                      else toast.success("Check-out registrado.");
                    }}
                  >
                    Check-out
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </main>
  );
}
