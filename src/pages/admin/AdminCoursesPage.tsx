import { Plus, Eye, Edit2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { courseLifecycleLabel } from "@/domain/rules";
import { Link, useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { useScopedAdminData } from "@/hooks/useScopedAdminData";
export default function AdminCoursesPage() {
  const { courses, state } = useScopedAdminData();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="page-title">Cursos</h1>
          <p className="page-subtitle">Cadastro, publicação e encerramento das ofertas.</p>
        </div>
        <Button className="gap-2" onClick={() => navigate(ROUTES.admin.courseNew)}>
          <Plus className="h-4 w-4" /> Novo rascunho
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Curso</TableHead>
                <TableHead className="hidden sm:table-cell">Início</TableHead>
                <TableHead className="hidden md:table-cell">Secretaria</TableHead>
                <TableHead>Ocupação</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((course) => {
                const occ = state.enrollments.filter(
                  (e) =>
                    e.courseId === course.id &&
                    e.status !== "lista_espera" &&
                    e.status !== "indeferida" &&
                    e.status !== "cancelada"
                ).length;
                const sec = state.secretariats.find((s) => s.id === course.ownerSecretariatId);
                return (
                  <TableRow key={course.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground text-sm">{course.title}</p>
                        <p className="text-xs text-muted-foreground sm:hidden">
                          {new Date(course.displayDate).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                      {new Date(course.displayDate).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {sec?.code ?? "—"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {occ}/{course.spots}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-[10px]">
                        {courseLifecycleLabel(course.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end">
                        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                          <Link to={ROUTES.admin.course(course.id)}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                          <Link to={ROUTES.admin.courseEdit(course.id)}>
                            <Edit2 className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
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
