import { useMemo, useState } from "react";
import { Check, X, AlertTriangle, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EnrollmentStatusBadge } from "@/components/shared/EnrollmentStatusBadge";
import { useScopedAdminData } from "@/hooks/useScopedAdminData";
import { ENROLLMENT_STATUS_LABEL } from "@/domain/rules";
import type { EnrollmentStatus as ES } from "@/domain/types";
import { setEnrollmentStatus } from "@/services/capacitaActions";
import { useAuth } from "@/auth/AuthContext";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const filters: ES[] = [
  "recebida",
  "em_validacao",
  "confirmada",
  "lista_espera",
  "indeferida",
  "cancelada",
];

export default function AdminEnrollmentsPage() {
  const { state, enrollments } = useScopedAdminData();
  const { user } = useAuth();
  const [active, setActive] = useState<ES | "todas">("todas");
  const [search, setSearch] = useState("");
  const [rejectOpen, setRejectOpen] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const filtered = useMemo(() => {
    return enrollments.filter((e) => {
      const ok = active === "todas" || e.status === active;
      const u = state.users.find((x) => x.id === e.participantId);
      const c = state.courses.find((x) => x.id === e.courseId);
      const match =
        (u?.fullName.toLowerCase().includes(search.toLowerCase()) ?? false) ||
        (c?.title.toLowerCase().includes(search.toLowerCase()) ?? false) ||
        e.id.toLowerCase().includes(search.toLowerCase());
      return ok && match;
    });
  }, [enrollments, active, search, state.users, state.courses]);

  function act(id: string, status: ES, reason?: string) {
    if (!user) return;
    setEnrollmentStatus({ enrollmentId: id, status, actorUserId: user.id, indeferimentoReason: reason });
    toast.success(`Status atualizado: ${ENROLLMENT_STATUS_LABEL[status]}`);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Inscrições</h1>
        <p className="page-subtitle">Validação documental e decisões institucionais.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-3">
        <Input
          placeholder="Buscar por servidor, curso ou protocolo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="lg:max-w-xs"
        />
        <div className="flex gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setActive("todas")}
            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
              active === "todas" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"
            }`}
          >
            Todas ({enrollments.length})
          </button>
          {filters.map((f) => (
            <button
              type="button"
              key={f}
              onClick={() => setActive(f)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                active === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
            >
              {ENROLLMENT_STATUS_LABEL[f]} ({enrollments.filter((e) => e.status === f).length})
            </button>
          ))}
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Protocolo</TableHead>
                <TableHead>Servidor</TableHead>
                <TableHead className="hidden md:table-cell">Curso</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((e) => {
                const u = state.users.find((x) => x.id === e.participantId);
                const c = state.courses.find((x) => x.id === e.courseId);
                return (
                  <TableRow key={e.id}>
                    <TableCell className="font-mono text-xs text-muted-foreground">{e.id}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{u?.fullName}</p>
                        <p className="text-xs text-muted-foreground">{u?.email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground max-w-[220px] truncate">
                      {c?.title}
                    </TableCell>
                    <TableCell>
                      <EnrollmentStatusBadge status={e.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end flex-wrap">
                        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                          <Link to={ROUTES.admin.enrollment(e.id)}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        {(e.status === "recebida" || e.status === "em_validacao") && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-success"
                              title="Confirmar"
                              onClick={() => act(e.id, "confirmada")}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-warning"
                              title="Manter em validação"
                              onClick={() => act(e.id, "em_validacao")}
                            >
                              <AlertTriangle className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              title="Indeferir"
                              onClick={() => {
                                setRejectOpen(e.id);
                                setRejectReason("");
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!rejectOpen} onOpenChange={() => setRejectOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Indeferimento</DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder="Descreva o motivo institucional (obrigatório)"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setRejectOpen(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (!rejectOpen) return;
                if (!rejectReason.trim()) {
                  toast.error("Informe a justificativa.");
                  return;
                }
                act(rejectOpen, "indeferida", rejectReason.trim());
                setRejectOpen(null);
              }}
            >
              Confirmar indeferimento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
