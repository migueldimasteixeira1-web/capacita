import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useCapacitaSelector } from "@/services/capacitaStore";
import { maskCpfForDisplay } from "@/domain/normalize";
import { PageState } from "@/components/system/PageStates";
import { useAuth } from "@/auth/AuthContext";

export default function AdminUsersPage() {
  const { user } = useAuth();
  const users = useCapacitaSelector((s) => s.users);

  if (user?.role !== "admin_tecnico") {
    return <PageState title="Acesso restrito" description="Disponível apenas para administradores técnicos." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Usuários e perfis</h1>
        <p className="page-subtitle">Visão técnica da base (demonstração local — sincronize com IAM em produção).</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Matrícula</TableHead>
                <TableHead className="hidden md:table-cell">CPF</TableHead>
                <TableHead>Perfil</TableHead>
                <TableHead>Primeiro acesso</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium text-sm">{u.fullName}</TableCell>
                  <TableCell className="text-xs">{u.registrationNumber}</TableCell>
                  <TableCell className="hidden md:table-cell text-xs">{maskCpfForDisplay(u.cpf)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] capitalize">
                      {u.role.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs">{u.firstAccessCompleted ? "Concluído" : "Pendente"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
