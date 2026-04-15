import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useCapacitaSelector } from "@/services/capacitaStore";
import { maskCpfForDisplay } from "@/domain/normalize";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";

export default function AdminInstructorsPage() {
  const instructors = useCapacitaSelector((s) => s.instructors);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Instrutores</h1>
        <p className="page-subtitle">Cadastro para designações, portarias e controle de acesso à área do instrutor.</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead className="hidden sm:table-cell">Especialidade</TableHead>
                <TableHead className="hidden md:table-cell">CPF</TableHead>
                <TableHead>Vínculo usuário</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {instructors.map((i) => (
                <TableRow key={i.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm">{i.fullName}</p>
                      <p className="text-xs text-muted-foreground sm:hidden">{i.specialty}</p>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">{i.specialty}</TableCell>
                  <TableCell className="hidden md:table-cell text-xs">{maskCpfForDisplay(i.cpf)}</TableCell>
                  <TableCell>
                    <Badge variant={i.userId ? "default" : "secondary"} className="text-[10px]">
                      {i.userId ? "Portal ativo" : "Externo / sem login"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={ROUTES.admin.instructor(i.id)}>Detalhar</Link>
                    </Button>
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
