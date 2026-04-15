import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ROUTES } from "@/constants/routes";
import { useScopedAdminData } from "@/hooks/useScopedAdminData";
import { useAuth } from "@/auth/AuthContext";
import { enrollmentVisibleToAdmin } from "@/auth/permissions";
import { courseLifecycleLabel } from "@/domain/rules";
import { instructorDisplayName, secretariatName } from "@/domain/selectors";
import { linkInstructorAndDesignation, setCourseStatus } from "@/services/capacitaActions";
import { useState } from "react";
import { toast } from "sonner";
import { EnrollmentStatusBadge } from "@/components/shared/EnrollmentStatusBadge";
import { PageState } from "@/components/system/PageStates";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function AdminCourseDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { state, courses, enrollments } = useScopedAdminData();
  const course = courses.find((c) => c.id === id);
  const fullCourse = state.courses.find((c) => c.id === id);
  const [instructorPick, setInstructorPick] = useState<string>(course?.primaryInstructorId ?? "");

  if (!user || !fullCourse || !course) {
    return <PageState title="Curso não encontrado no seu escopo" />;
  }

  if (!enrollmentVisibleToAdmin(user, fullCourse)) {
    return <PageState title="Sem permissão" />;
  }

  const courseEnrollments = enrollments.filter((e) => e.courseId === course.id);
  const doc = fullCourse.designationDocumentId
    ? state.documents.find((d) => d.id === fullCourse.designationDocumentId)
    : undefined;

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap gap-2 mb-2">
            <Badge>{courseLifecycleLabel(course.status)}</Badge>
            <Badge variant="outline">{course.modality}</Badge>
          </div>
          <h1 className="page-title">{course.title}</h1>
          <p className="text-sm text-muted-foreground">
            {secretariatName(state, course.ownerSecretariatId)} • Instrutor:{" "}
            {instructorDisplayName(state, course.primaryInstructorId)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to={ROUTES.admin.courseEdit(course.id)}>Editar conteúdo</Link>
          </Button>
          <Button
            size="sm"
            disabled={course.status !== "rascunho" && course.status !== "publicado"}
            onClick={() => {
              setCourseStatus(course.id, "inscricoes_abertas", user.id);
              toast.success("Curso publicado para inscrições.");
            }}
          >
            Abrir inscrições
          </Button>
          <Button
            size="sm"
            variant="secondary"
            disabled={course.status === "encerrado" || course.status === "cancelado"}
            onClick={() => {
              setCourseStatus(course.id, "encerrado", user.id);
              toast.success("Curso encerrado.");
            }}
          >
            Encerrar curso
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Designação do instrutor</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
            <div className="flex-1 space-y-2">
              <p className="text-xs text-muted-foreground">Selecione o instrutor responsável</p>
              <Select value={instructorPick} onValueChange={setInstructorPick}>
                <SelectTrigger>
                  <SelectValue placeholder="Instrutor" />
                </SelectTrigger>
                <SelectContent>
                  {state.instructors.map((i) => (
                    <SelectItem key={i.id} value={i.id}>
                      {i.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              type="button"
              disabled={!instructorPick}
              onClick={() => {
                linkInstructorAndDesignation({
                  courseId: course.id,
                  instructorId: instructorPick,
                  actorUserId: user.id,
                });
                toast.success("Portaria de designação gerada.");
              }}
            >
              Vincular e emitir documento
            </Button>
          </div>
          {doc && (
            <div className="rounded-md border bg-muted/40 p-3 text-xs text-muted-foreground whitespace-pre-wrap">
              {doc.body}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Inscrições do curso</CardTitle>
          <Button asChild variant="outline" size="sm">
            <Link to={ROUTES.admin.validation}>Fila de validação</Link>
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Participante</TableHead>
                <TableHead>Protocolo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courseEnrollments.map((e) => {
                const p = state.users.find((u) => u.id === e.participantId);
                return (
                  <TableRow key={e.id}>
                    <TableCell className="font-medium text-sm">{p?.fullName}</TableCell>
                    <TableCell className="font-mono text-xs">{e.id}</TableCell>
                    <TableCell>
                      <EnrollmentStatusBadge status={e.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="ghost" size="sm">
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
    </div>
  );
}
