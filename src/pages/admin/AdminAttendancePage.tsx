import { useMemo, useState } from "react";
import { QrCode, UserCheck, UserX, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useScopedAdminData } from "@/hooks/useScopedAdminData";
import { useAuth } from "@/auth/AuthContext";
import { participantCheckInOut, manualAdjustAttendance } from "@/services/capacitaActions";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getAttendanceInconsistencies } from "@/services/capacitaActions";

export default function AdminAttendancePage() {
  const { state, enrollments } = useScopedAdminData();
  const { user } = useAuth();
  const [scan, setScan] = useState("");
  const [sessionId, setSessionId] = useState<string>("");
  const [adj, setAdj] = useState<{
    enrollmentId: string;
    sessionId: string;
  } | null>(null);
  const [just, setJust] = useState("");

  const target = useMemo(() => {
    const t = scan.trim();
    if (!t) return null;
    return state.enrollments.find((e) => e.qrToken === t || e.id === t) ?? null;
  }, [scan, state.enrollments]);

  const sessionsForCourse = useMemo(() => {
    if (!target) return [];
    return state.sessions.filter((s) => s.courseId === target.courseId);
  }, [target, state.sessions]);

  const approved = enrollments.filter((e) => e.status === "confirmada");
  const inconsistencies = getAttendanceInconsistencies().filter((row) =>
    enrollments.some((e) => e.id === row.enrollmentId)
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Presença</h1>
        <p className="page-subtitle">
          Check-in/out com validação de janela; ajustes manuais exigem justificativa auditável.
        </p>
      </div>

      {inconsistencies.length > 0 && (
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="text-base text-destructive">Inconsistências de frequência</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            {inconsistencies.map((i) => (
              <div key={i.enrollmentId} className="flex justify-between gap-2 border-b pb-2">
                <span className="text-muted-foreground">
                  {i.participantName} — {i.courseTitle}
                </span>
                <span className="text-xs">
                  {i.percent}% / min {i.min}%
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <QrCode className="h-4 w-4 text-primary" />
              Registro assistido
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="Token ou protocolo" value={scan} onChange={(e) => setScan(e.target.value)} />
            <Select value={sessionId} onValueChange={setSessionId}>
              <SelectTrigger>
                <SelectValue placeholder="Sessão" />
              </SelectTrigger>
              <SelectContent>
                {sessionsForCourse.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.label} — {new Date(s.date).toLocaleDateString("pt-BR")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button
                className="flex-1"
                disabled={!target || !sessionId || !user}
                onClick={() => {
                  const r = participantCheckInOut({
                    enrollmentId: target!.id,
                    sessionId,
                    kind: "in",
                    actorUserId: user!.id,
                    force: true,
                  });
                  if (!r.ok) toast.error(r.message);
                  else toast.success("Check-in registrado (ajuste operacional).");
                }}
              >
                Check-in
              </Button>
              <Button
                className="flex-1"
                variant="secondary"
                disabled={!target || !sessionId || !user}
                onClick={() => {
                  const r = participantCheckInOut({
                    enrollmentId: target!.id,
                    sessionId,
                    kind: "out",
                    actorUserId: user!.id,
                    force: true,
                  });
                  if (!r.ok) toast.error(r.message);
                  else toast.success("Check-out registrado.");
                }}
              >
                Check-out
              </Button>
            </div>
            {target && (
              <p className="text-xs text-muted-foreground">
                Participante: {state.users.find((u) => u.id === target.participantId)?.fullName}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Painel rápido</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Participante</TableHead>
                  <TableHead className="hidden sm:table-cell">Curso</TableHead>
                  <TableHead>Check-in</TableHead>
                  <TableHead>Check-out</TableHead>
                  <TableHead className="text-right">Ajuste</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {approved.slice(0, 12).map((e) => {
                  const firstSession = state.sessions.find((s) => s.courseId === e.courseId);
                  const rec = firstSession
                    ? state.attendance.find(
                        (a) => a.enrollmentId === e.id && a.sessionId === firstSession.id
                      )
                    : undefined;
                  const p = state.users.find((u) => u.id === e.participantId);
                  const c = state.courses.find((x) => x.id === e.courseId);
                  return (
                    <TableRow key={e.id}>
                      <TableCell>
                        <p className="font-medium text-sm">{p?.fullName}</p>
                        <p className="text-[10px] font-mono text-muted-foreground">{e.qrToken}</p>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-sm text-muted-foreground truncate max-w-[200px]">
                        {c?.title}
                      </TableCell>
                      <TableCell>
                        {rec?.checkInAt ? (
                          <Badge variant="default" className="text-[10px] gap-1">
                            <UserCheck className="h-3 w-3" />
                            {new Date(rec.checkInAt).toLocaleTimeString("pt-BR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[10px] gap-1">
                            <Clock className="h-3 w-3" /> —
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {rec?.checkOutAt ? (
                          <Badge variant="default" className="text-[10px] gap-1">
                            <UserX className="h-3 w-3" />
                            {new Date(rec.checkOutAt).toLocaleTimeString("pt-BR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[10px] gap-1">
                            <Clock className="h-3 w-3" /> —
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={!firstSession}
                          onClick={() =>
                            firstSession &&
                            setAdj({ enrollmentId: e.id, sessionId: firstSession.id })
                          }
                        >
                          Ajustar
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

      <Dialog open={!!adj} onOpenChange={() => setAdj(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajuste manual de presença</DialogTitle>
          </DialogHeader>
          <Textarea value={just} onChange={(e) => setJust(e.target.value)} placeholder="Justificativa obrigatória" />
          <DialogFooter className="gap-2 flex-wrap">
            <Button variant="outline" onClick={() => setAdj(null)}>
              Cancelar
            </Button>
            <Button
              onClick={() => {
                if (!adj || !user) return;
                const r = manualAdjustAttendance({
                  enrollmentId: adj.enrollmentId,
                  sessionId: adj.sessionId,
                  status: "presente",
                  justification: just,
                  actorUserId: user.id,
                });
                if (!r.ok) toast.error(r.reason);
                else toast.success("Presença ajustada.");
                setAdj(null);
                setJust("");
              }}
            >
              Marcar presente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
