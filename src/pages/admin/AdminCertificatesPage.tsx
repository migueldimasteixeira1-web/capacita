import { Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useCapacitaSelector } from "@/services/capacitaStore";
import { useScopedAdminData } from "@/hooks/useScopedAdminData";
import { canIssueCertificate } from "@/domain/rules";
import { tryIssueCertificate } from "@/services/capacitaActions";
import { useAuth } from "@/auth/AuthContext";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { ROUTES } from "@/constants/routes";

export default function AdminCertificatesPage() {
  const { user } = useAuth();
  const all = useCapacitaSelector((s) => s);
  const { enrollments } = useScopedAdminData();

  const issued = all.certificates.filter((c) => enrollments.some((e) => e.id === c.enrollmentId));
  const apt = enrollments.filter((e) => canIssueCertificate(all, e.id).ok);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="page-title">Certificados</h1>
        <p className="page-subtitle">Emissão condicionada a regras objetivas de frequência e encerramento.</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Participante</TableHead>
                <TableHead className="hidden sm:table-cell">Curso</TableHead>
                <TableHead>Emissão</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {issued.map((c) => {
                const e = all.enrollments.find((x) => x.id === c.enrollmentId);
                const p = e ? all.users.find((u) => u.id === e.participantId) : undefined;
                return (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono text-xs">{c.code}</TableCell>
                    <TableCell className="font-medium text-sm">{p?.fullName}</TableCell>
                    <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                      {c.courseTitleSnapshot}
                    </TableCell>
                    <TableCell>
                      <Badge className="text-[10px] gap-1">
                        <Award className="h-3 w-3" />
                        {new Date(c.issuedAt).toLocaleDateString("pt-BR")}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div>
        <h2 className="section-title mb-3">Participantes aptos à emissão</h2>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Protocolo</TableHead>
                  <TableHead>Servidor</TableHead>
                  <TableHead>Curso</TableHead>
                  <TableHead className="text-right">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apt.map((e) => {
                  const p = all.users.find((u) => u.id === e.participantId);
                  const c = all.courses.find((x) => x.id === e.courseId);
                  return (
                    <TableRow key={e.id}>
                      <TableCell className="font-mono text-xs">{e.id}</TableCell>
                      <TableCell className="text-sm">{p?.fullName}</TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[220px] truncate">
                        {c?.title}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          disabled={!user}
                          onClick={() => {
                            const r = tryIssueCertificate({ enrollmentId: e.id, actorUserId: user!.id });
                            if (!r.ok) toast.error(r.reason);
                            else toast.success(`Certificado ${r.code} emitido.`);
                          }}
                        >
                          Emitir
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {apt.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-sm text-muted-foreground text-center py-8">
                      Nenhum participante elegível no momento.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <p className="text-xs text-muted-foreground mt-2">
          Participantes podem acompanhar em{" "}
          <Link className="text-primary hover:underline" to={ROUTES.portal.certificates}>
            Portal › Certificados
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
