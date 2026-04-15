import { useParams } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import { useCapacitaSelector } from "@/services/capacitaStore";
import { useInstructorProfileForUser } from "@/hooks/useInstructorProfile";
import { instructorTeachesCourse } from "@/auth/permissions";
import { PageState } from "@/components/system/PageStates";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { EnrollmentStatusBadge } from "@/components/shared/EnrollmentStatusBadge";
import type { EnrollmentStatus } from "@/domain/types";

export default function InstructorParticipantsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const profile = useInstructorProfileForUser(user);
  const { course, rows } = useCapacitaSelector((s) => {
    const c = s.courses.find((x) => x.id === id);
    if (!c) return { course: undefined, rows: [] as { name: string; status: string; enr: string }[] };
    const list = s.enrollments
      .filter((e) => e.courseId === c.id && (e.status === "confirmada" || e.status === "lista_espera"))
      .map((e) => ({
        name: s.users.find((u) => u.id === e.participantId)?.fullName ?? "—",
        status: e.status as EnrollmentStatus,
        enr: e.id,
      }));
    return { course: c, rows: list };
  });

  if (!user || !profile || !course || !instructorTeachesCourse(user, course, profile.id)) {
    return <PageState title="Acesso restrito" />;
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="page-title">Participantes</h1>
        <p className="page-subtitle">{course.title}</p>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Servidor</TableHead>
                <TableHead>Protocolo</TableHead>
                <TableHead>Situação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.enr}>
                  <TableCell className="font-medium">{r.name}</TableCell>
                  <TableCell className="font-mono text-xs">{r.enr}</TableCell>
                  <TableCell>
                    <EnrollmentStatusBadge status={r.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
