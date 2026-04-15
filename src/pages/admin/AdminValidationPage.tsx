import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EnrollmentStatusBadge } from "@/components/shared/EnrollmentStatusBadge";
import { Button } from "@/components/ui/button";
import { useScopedAdminData } from "@/hooks/useScopedAdminData";
import { ROUTES } from "@/constants/routes";
import { InlineEmpty } from "@/components/system/PageStates";

export default function AdminValidationPage() {
  const { state, enrollments } = useScopedAdminData();
  const queue = enrollments.filter((e) => e.status === "recebida" || e.status === "em_validacao");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Fila de validação</h1>
        <p className="page-subtitle">Priorize solicitações recebidas e em análise documental.</p>
      </div>

      {queue.length === 0 ? (
        <InlineEmpty title="Fila vazia" description="Não há protocolos aguardando decisão no seu escopo." />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Protocolo</TableHead>
                  <TableHead>Servidor</TableHead>
                  <TableHead>Curso</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {queue.map((e) => {
                  const u = state.users.find((x) => x.id === e.participantId);
                  const c = state.courses.find((x) => x.id === e.courseId);
                  return (
                    <TableRow key={e.id}>
                      <TableCell className="font-mono text-xs">{e.id}</TableCell>
                      <TableCell className="font-medium text-sm">{u?.fullName}</TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[240px] truncate">
                        {c?.title}
                      </TableCell>
                      <TableCell>
                        <EnrollmentStatusBadge status={e.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button asChild size="sm">
                          <Link to={ROUTES.admin.enrollment(e.id)}>Analisar</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
