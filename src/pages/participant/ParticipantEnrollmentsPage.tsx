import { Link } from "react-router-dom";
import { QrCode, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EnrollmentStatusBadge } from "@/components/shared/EnrollmentStatusBadge";
import { useCapacitaSelector } from "@/services/capacitaStore";
import { useAuth } from "@/auth/AuthContext";
import { ROUTES } from "@/constants/routes";
import { InlineEmpty } from "@/components/system/PageStates";

export default function ParticipantEnrollmentsPage() {
  const { user } = useAuth();
  const rows = useCapacitaSelector((s) =>
    s.enrollments
      .filter((e) => e.participantId === user?.id)
      .map((e) => ({
        e,
        course: s.courses.find((c) => c.id === e.courseId),
      }))
      .sort((a, b) => b.e.submittedAt.localeCompare(a.e.submittedAt))
  );

  return (
    <main className="page-container">
      <div className="mb-8">
        <h1 className="page-title">Minhas inscrições</h1>
        <p className="page-subtitle">Status de validação, confirmação e próximos passos operacionais.</p>
      </div>

      {rows.length === 0 ? (
        <InlineEmpty
          title="Sem inscrições registradas"
          description="Explore o catálogo para solicitar participação em uma capacitação autorizada."
        />
      ) : (
        <div className="space-y-4">
          {rows.map(({ e, course }) => (
            <Card key={e.id} className="card-hover">
              <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-foreground truncate">
                      {course?.title ?? "Curso removido"}
                    </h3>
                    <EnrollmentStatusBadge status={e.status} />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Protocolo {e.id} • Enviada em {new Date(e.submittedAt).toLocaleString("pt-BR")}
                  </p>
                  {e.status === "em_validacao" && (
                    <p className="text-sm text-amber-700 dark:text-amber-400">
                      Documentação em análise pela coordenação.
                    </p>
                  )}
                  {e.status === "indeferida" && e.indeferimentoReason && (
                    <p className="text-sm text-destructive">Motivo: {e.indeferimentoReason}</p>
                  )}
                  {e.status === "confirmada" && (
                    <p className="text-sm text-success">Inscrição confirmada — registre presença nas sessões indicadas.</p>
                  )}
                  {e.status === "lista_espera" && (
                    <p className="text-sm text-muted-foreground">
                      Lista de espera: você será notificado se houver vaga.
                    </p>
                  )}
                </div>
                <div className="flex gap-2 shrink-0 flex-wrap">
                  {e.status === "confirmada" && (
                    <Button asChild variant="outline" size="sm" className="gap-1.5">
                      <Link to={ROUTES.portal.qrcode(e.id)}>
                        <QrCode className="h-4 w-4" /> QR Code
                      </Link>
                    </Button>
                  )}
                  <Button asChild variant="ghost" size="sm" className="gap-1.5">
                    <Link to={ROUTES.portal.enrollment(e.id)}>
                      <Eye className="h-4 w-4" /> Detalhes
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
