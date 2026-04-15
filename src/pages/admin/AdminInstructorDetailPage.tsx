import { Link, useParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ROUTES } from "@/constants/routes";
import { useScopedAdminData } from "@/hooks/useScopedAdminData";
import { maskCpfForDisplay } from "@/domain/normalize";
import { PageState } from "@/components/system/PageStates";
import { EnrollmentStatusBadge } from "@/components/shared/EnrollmentStatusBadge";

export default function AdminInstructorDetailPage() {
  const { id } = useParams();
  const { state, instructors, courses, enrollments } = useScopedAdminData();
  const instructor = instructors.find((item) => item.id === id);

  if (!instructor) {
    return <PageState title="Instrutor não encontrado" description="Verifique o identificador ou volte à lista." />;
  }

  const assignedCourses = courses.filter((course) => course.primaryInstructorId === instructor.id);

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs text-muted-foreground">Cadastro institucional</p>
          <h1 className="page-title">{instructor.fullName}</h1>
          <p className="text-sm text-muted-foreground">{instructor.specialty}</p>
        </div>
        <Badge variant={instructor.userId ? "default" : "secondary"}>
          {instructor.userId ? "Perfil com acesso ao portal" : "Instrutor externo"}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dados de designação</CardTitle>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-3 text-sm">
          <p>
            <span className="font-medium text-foreground">CPF: </span>
            <span className="text-muted-foreground">{maskCpfForDisplay(instructor.cpf)}</span>
          </p>
          <p>
            <span className="font-medium text-foreground">E-mail: </span>
            <span className="text-muted-foreground">{instructor.email}</span>
          </p>
          <p>
            <span className="font-medium text-foreground">Vínculo de usuário: </span>
            <span className="text-muted-foreground">{instructor.userId ?? "Sem vínculo"}</span>
          </p>
          <p>
            <span className="font-medium text-foreground">Cursos no escopo: </span>
            <span className="text-muted-foreground">{assignedCourses.length}</span>
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cursos designados</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Curso</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Inscrições</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignedCourses.map((course) => {
                const courseEnrollments = enrollments.filter((item) => item.courseId === course.id);
                return (
                  <TableRow key={course.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{course.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(course.displayDate).toLocaleDateString("pt-BR")} • {course.displayTimeRange}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {course.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex flex-wrap gap-2">
                        {courseEnrollments.slice(0, 3).map((item) => (
                          <EnrollmentStatusBadge key={item.id} status={item.status} />
                        ))}
                        {courseEnrollments.length === 0 && (
                          <span className="text-xs text-muted-foreground">Sem inscrições</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={ROUTES.admin.course(course.id)}>Abrir curso</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {assignedCourses.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-sm text-muted-foreground">
                    Nenhum curso vinculado no escopo administrativo atual.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Button asChild variant="outline" size="sm">
        <Link to={ROUTES.admin.instructors}>Voltar para instrutores</Link>
      </Button>
    </div>
  );
}
