import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EnrollmentStatusBadge } from "@/components/shared/EnrollmentStatusBadge";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/auth/AuthContext";
import { useCapacitaSelector } from "@/services/capacitaStore";
import { PageState } from "@/components/system/PageStates";
import { attendancePercentForEnrollment } from "@/domain/rules";

export default function ParticipantEnrollmentDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const data = useCapacitaSelector((s) => {
    const e = s.enrollments.find((x) => x.id === id);
    if (!e || e.participantId !== user?.id) return null;
    return {
      e,
      course: s.courses.find((c) => c.id === e.courseId),
      pct: attendancePercentForEnrollment(s, e.id),
    };
  });

  if (!data) {
    return (
      <main className="page-container">
        <PageState title="Inscrição não encontrada" />
        <Button asChild variant="outline" className="mt-4">
          <Link to={ROUTES.portal.enrollments}>Voltar</Link>
        </Button>
      </main>
    );
  }

  const { e, course, pct } = data;

  return (
    <main className="page-container max-w-3xl">
      <Link
        to={ROUTES.portal.enrollments}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" /> Inscrições
      </Link>

      <div className="flex flex-wrap items-center gap-3 mb-2">
        <h1 className="page-title">Detalhe da inscrição</h1>
        <EnrollmentStatusBadge status={e.status} />
      </div>
      <p className="text-muted-foreground mb-6">{course?.title}</p>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Resumo</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2 text-muted-foreground">
            <p>
              <span className="text-foreground font-medium">Protocolo:</span> {e.id}
            </p>
            <p>
              <span className="text-foreground font-medium">Token presença:</span>{" "}
              <span className="font-mono text-xs">{e.qrToken}</span>
            </p>
            <p>
              <span className="text-foreground font-medium">Presença consolidada:</span> {pct}% (referência do curso)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Documentação declarada</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {e.documents.map((d) => (
              <div key={d.name} className="flex justify-between gap-2">
                <span className="text-muted-foreground">{d.name}</span>
                <span className="text-xs font-medium uppercase">{d.status}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link to={ROUTES.portal.attendance(e.id)}>Registrar presença</Link>
          </Button>
          {e.status === "confirmada" && (
            <Button asChild variant="outline">
              <Link to={ROUTES.portal.qrcode(e.id)}>Abrir QR Code</Link>
            </Button>
          )}
        </div>
      </div>
    </main>
  );
}
