import { BookOpen, ClipboardCheck, Award, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EnrollmentStatusBadge } from "@/components/shared/EnrollmentStatusBadge";
import { Link } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { useScopedAdminData } from "@/hooks/useScopedAdminData";

export default function AdminDashboard() {
  const { state, courses, enrollments } = useScopedAdminData();

  const openCourses = courses.filter((c) => c.status === "inscricoes_abertas").length;
  const pendingVal = enrollments.filter((e) => e.status === "recebida" || e.status === "em_validacao").length;
  const certs = state.certificates.length;

  const recent = [...enrollments]
    .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))
    .slice(0, 6);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Painel operacional</h1>
        <p className="page-subtitle">Indicadores da sua área de gestão no programa de capacitação.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-11 w-11 rounded-xl bg-muted flex items-center justify-center text-primary">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{openCourses}</p>
              <p className="text-xs text-muted-foreground">Cursos com inscrições abertas</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-11 w-11 rounded-xl bg-muted flex items-center justify-center text-info">
              <ClipboardCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{enrollments.length}</p>
              <p className="text-xs text-muted-foreground">Inscrições no escopo</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-11 w-11 rounded-xl bg-muted flex items-center justify-center text-warning">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{pendingVal}</p>
              <p className="text-xs text-muted-foreground">Fila de validação</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-11 w-11 rounded-xl bg-muted flex items-center justify-center text-success">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{certs}</p>
              <p className="text-xs text-muted-foreground">Certificados emitidos (geral)</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Últimas inscrições</CardTitle>
            <Link to={ROUTES.admin.enrollments} className="text-xs text-primary hover:underline">
              Ver todas
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recent.map((e) => {
                const u = state.users.find((x) => x.id === e.participantId);
                const c = state.courses.find((x) => x.id === e.courseId);
                return (
                  <div key={e.id} className="flex items-center justify-between gap-3 text-sm">
                    <div className="min-w-0">
                      <p className="font-medium text-foreground truncate">{u?.fullName}</p>
                      <p className="text-xs text-muted-foreground truncate">{c?.title}</p>
                    </div>
                    <EnrollmentStatusBadge status={e.status} />
                  </div>
                );
              })}
              {recent.length === 0 && (
                <p className="text-sm text-muted-foreground">Sem inscrições no escopo.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ocupação por curso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {courses.slice(0, 6).map((c) => {
                const occ = state.enrollments.filter(
                  (e) =>
                    e.courseId === c.id &&
                    e.status !== "lista_espera" &&
                    e.status !== "indeferida" &&
                    e.status !== "cancelada"
                ).length;
                const pct = c.spots > 0 ? Math.min(100, (occ / c.spots) * 100) : 0;
                return (
                  <div key={c.id} className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-foreground truncate max-w-[70%]">{c.title}</span>
                      <span className="text-muted-foreground shrink-0">
                        {occ}/{c.spots}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
