import { BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useScopedAdminData } from "@/hooks/useScopedAdminData";
import { ENROLLMENT_STATUS_LABEL } from "@/domain/rules";
import type { EnrollmentStatus } from "@/domain/types";

const distribution: EnrollmentStatus[] = [
  "recebida",
  "em_validacao",
  "confirmada",
  "lista_espera",
  "indeferida",
  "cancelada",
];

export default function AdminReportsPage() {
  const { state, courses, enrollments } = useScopedAdminData();
  const total = enrollments.length;
  const confirmed = enrollments.filter((e) => e.status === "confirmada").length;
  const certs = state.certificates.filter((c) => enrollments.some((e) => e.id === c.enrollmentId)).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Relatórios</h1>
        <p className="page-subtitle">Indicadores consolidados do seu escopo administrativo.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-5 text-center">
            <p className="text-3xl font-bold">{total}</p>
            <p className="text-xs text-muted-foreground mt-1">Inscrições</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 text-center">
            <p className="text-3xl font-bold">{confirmed}</p>
            <p className="text-xs text-muted-foreground mt-1">Confirmadas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 text-center">
            <p className="text-3xl font-bold">{certs}</p>
            <p className="text-xs text-muted-foreground mt-1">Certificados emitidos</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              Inscrições por curso
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {courses.map((c) => {
              const count = enrollments.filter((e) => e.courseId === c.id).length;
              const pct = total > 0 ? (count / total) * 100 : 0;
              return (
                <div key={c.id} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground truncate max-w-[70%]">{c.title}</span>
                    <span className="text-muted-foreground">{count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Distribuição por status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {distribution.map((status) => {
                const count = enrollments.filter((e) => e.status === status).length;
                const pct = total > 0 ? (count / total) * 100 : 0;
                return (
                  <div key={status} className="flex items-center gap-3">
                    <span className="text-sm text-foreground w-32 truncate">
                      {ENROLLMENT_STATUS_LABEL[status]}
                    </span>
                    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full bg-info" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-sm text-muted-foreground w-8 text-right">{count}</span>
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
