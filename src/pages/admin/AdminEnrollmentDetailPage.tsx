import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EnrollmentStatusBadge } from "@/components/shared/EnrollmentStatusBadge";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { useScopedAdminData } from "@/hooks/useScopedAdminData";
import { useAuth } from "@/auth/AuthContext";
import { enrollmentVisibleToAdmin } from "@/auth/permissions";
import { PageState } from "@/components/system/PageStates";
import { attendancePercentForEnrollment } from "@/domain/rules";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { setEnrollmentStatus } from "@/services/capacitaActions";
import { toast } from "sonner";

export default function AdminEnrollmentDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { state, enrollments } = useScopedAdminData();
  const enrollment = enrollments.find((e) => e.id === id);
  const course = enrollment ? state.courses.find((c) => c.id === enrollment.courseId) : undefined;
  const participant = enrollment ? state.users.find((u) => u.id === enrollment.participantId) : undefined;
  const [reason, setReason] = useState("");

  if (!user || !enrollment || !course) {
    return <PageState title="Inscrição não encontrada no escopo" />;
  }

  if (!enrollmentVisibleToAdmin(user, course)) {
    return <PageState title="Sem permissão" />;
  }

  const pct = attendancePercentForEnrollment(state, enrollment.id);

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs text-muted-foreground">Análise individual</p>
          <h1 className="page-title">{participant?.fullName}</h1>
          <p className="text-sm text-muted-foreground">{course.title}</p>
        </div>
        <EnrollmentStatusBadge status={enrollment.status} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dados da solicitação</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2 text-muted-foreground">
          <p>
            <span className="text-foreground font-medium">Protocolo:</span> {enrollment.id}
          </p>
          <p>
            <span className="text-foreground font-medium">E-mail:</span> {participant?.email}
          </p>
          <p>
            <span className="text-foreground font-medium">Presença consolidada:</span> {pct}% (mínimo exigido{" "}
            {course.minimumAttendancePercent}%)
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Documentação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {enrollment.documents.map((d) => (
            <div key={d.name} className="flex justify-between gap-2 border-b pb-2">
              <span>{d.name}</span>
              <span className="text-xs uppercase">{d.status}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Decisão</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => {
              setEnrollmentStatus({ enrollmentId: enrollment.id, status: "confirmada", actorUserId: user.id });
              toast.success("Inscrição confirmada.");
            }}>
              Confirmar
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setEnrollmentStatus({ enrollmentId: enrollment.id, status: "em_validacao", actorUserId: user.id });
                toast.message("Status: em validação");
              }}
            >
              Manter em validação
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setEnrollmentStatus({ enrollmentId: enrollment.id, status: "lista_espera", actorUserId: user.id });
                toast.success("Movido para lista de espera.");
              }}
            >
              Lista de espera
            </Button>
          </div>
          <Textarea placeholder="Justificativa para indeferimento" value={reason} onChange={(e) => setReason(e.target.value)} />
          <Button
            variant="destructive"
            onClick={() => {
              if (!reason.trim()) {
                toast.error("Justificativa obrigatória.");
                return;
              }
              setEnrollmentStatus({
                enrollmentId: enrollment.id,
                status: "indeferida",
                actorUserId: user.id,
                indeferimentoReason: reason.trim(),
              });
              toast.success("Indeferimento registrado.");
            }}
          >
            Indeferir com motivo
          </Button>
        </CardContent>
      </Card>

      <Button asChild variant="ghost">
        <Link to={ROUTES.admin.enrollments}>← Voltar à lista</Link>
      </Button>
    </div>
  );
}
