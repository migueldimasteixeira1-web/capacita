import { Link } from "react-router-dom";
import { EnrollmentStatusBadge } from "@/components/shared/EnrollmentStatusBadge";
import { useAuth } from "@/auth/AuthContext";
import { useCapacitaSelector } from "@/services/capacitaStore";
import { ROUTES } from "@/constants/routes";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InlineEmpty } from "@/components/system/PageStates";
import { Award } from "lucide-react";

export default function ParticipantHistoryPage() {
  const { user } = useAuth();
  const rows = useCapacitaSelector((s) =>
    s.enrollments
      .filter((e) => e.participantId === user?.id)
      .map((e) => ({
        e,
        course: s.courses.find((c) => c.id === e.courseId),
        cert: s.certificates.find((c) => c.enrollmentId === e.id),
      }))
      .sort((a, b) => b.e.submittedAt.localeCompare(a.e.submittedAt))
  );

  return (
    <main className="page-container max-w-4xl">
      <div className="mb-8">
        <h1 className="page-title">Histórico de capacitações</h1>
        <p className="page-subtitle">Linha do tempo das suas solicitações e certificações internas.</p>
      </div>

      {rows.length === 0 ? (
        <InlineEmpty title="Sem histórico" description="Suas participações aparecerão aqui após a primeira inscrição." />
      ) : (
        <div className="space-y-3">
          {rows.map(({ e, course, cert }) => (
            <Card key={e.id}>
              <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-foreground truncate">{course?.title ?? "—"}</p>
                    <EnrollmentStatusBadge status={e.status} />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Protocolo {e.id} • {new Date(e.submittedAt).toLocaleDateString("pt-BR")}
                  </p>
                  {cert && (
                    <p className="text-xs text-success flex items-center gap-1">
                      <Award className="h-3.5 w-3.5" /> Certificado {cert.code}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button asChild size="sm" variant="outline">
                    <Link to={ROUTES.portal.enrollment(e.id)}>Abrir</Link>
                  </Button>
                  {cert && (
                    <Button asChild size="sm">
                      <Link to={ROUTES.portal.certificate(e.id)}>Certificado</Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
