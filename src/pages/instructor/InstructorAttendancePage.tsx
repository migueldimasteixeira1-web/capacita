import { useParams } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import { useCapacitaSelector } from "@/services/capacitaStore";
import { useInstructorProfileForUser } from "@/hooks/useInstructorProfile";
import { instructorTeachesCourse } from "@/auth/permissions";
import { PageState } from "@/components/system/PageStates";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function InstructorAttendancePage() {
  const { id } = useParams();
  const { user } = useAuth();
  const profile = useInstructorProfileForUser(user);
  const snap = useCapacitaSelector((s) => s);
  const course = snap.courses.find((c) => c.id === id);

  if (!user || !profile || !course || !instructorTeachesCourse(user, course, profile.id)) {
    return <PageState title="Frequência indisponível" />;
  }

  const sessions = snap.sessions.filter((s) => s.courseId === course.id);
  const enrollments = snap.enrollments.filter((e) => e.courseId === course.id && e.status === "confirmada");

  return (
    <div className="space-y-4">
      <div>
        <h1 className="page-title">Frequência</h1>
        <p className="page-subtitle">Visão consolidada — ajustes manuais permanecem com a coordenação.</p>
      </div>

      {sessions.map((sess) => (
        <Card key={sess.id}>
          <CardContent className="p-0">
            <div className="px-4 py-3 border-b text-sm font-medium">
              {sess.label} — {new Date(sess.date).toLocaleDateString("pt-BR")} ({sess.startTime} – {sess.endTime})
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Participante</TableHead>
                  <TableHead>Check-in</TableHead>
                  <TableHead>Check-out</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {enrollments.map((e) => {
                  const p = snap.users.find((u) => u.id === e.participantId);
                  const rec = snap.attendance.find(
                    (a) => a.enrollmentId === e.id && a.sessionId === sess.id
                  );
                  return (
                    <TableRow key={e.id}>
                      <TableCell className="font-medium">{p?.fullName}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {rec?.checkInAt ? new Date(rec.checkInAt).toLocaleTimeString("pt-BR") : "—"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {rec?.checkOutAt ? new Date(rec.checkOutAt).toLocaleTimeString("pt-BR") : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-[10px]">
                          {rec?.status ?? "não registrada"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}

      {sessions.length === 0 && (
        <PageState title="Sem sessões" description="Calendário detalhado ainda não foi publicado." />
      )}
    </div>
  );
}
