import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/constants/routes";
import { useScopedAdminData } from "@/hooks/useScopedAdminData";
import { useAuth } from "@/auth/AuthContext";
import { enrollmentVisibleToAdmin } from "@/auth/permissions";
import { upsertCourse } from "@/services/capacitaActions";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageState } from "@/components/system/PageStates";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { CourseModality, CourseLifecycleStatus } from "@/domain/types";

export default function AdminCourseEditPage() {
  const { id } = useParams();
  const location = useLocation();
  const isNew = location.pathname.endsWith("/cursos/novo");
  const navigate = useNavigate();
  const { user } = useAuth();
  const { state, courses } = useScopedAdminData();
  const course = id ? courses.find((c) => c.id === id) : undefined;
  const full = id ? state.courses.find((c) => c.id === id) : undefined;

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    modality: "presencial" as CourseModality,
    workloadHours: 4,
    location: "",
    spots: 20,
    eligibility: "",
    minAtt: 75,
    schedule: "",
    displayDate: "",
    displayTime: "",
    enrollmentStart: "",
    enrollmentEnd: "",
    status: "rascunho" as CourseLifecycleStatus,
  });

  useEffect(() => {
    if (isNew || !course) return;
    setForm({
      title: course.title,
      description: course.description,
      category: course.category,
      modality: course.modality,
      workloadHours: course.workloadHours,
      location: course.location,
      spots: course.spots,
      eligibility: course.eligibilityCriteria,
      minAtt: course.minimumAttendancePercent,
      schedule: course.scheduleSummary,
      displayDate: course.displayDate,
      displayTime: course.displayTimeRange,
      enrollmentStart: course.enrollmentStart.slice(0, 10),
      enrollmentEnd: course.enrollmentEnd.slice(0, 10),
      status: course.status,
    });
  }, [course, isNew]);

  useEffect(() => {
    if (!isNew || !user) return;
    const today = new Date().toISOString().slice(0, 10);
    setForm((prev) => ({
      ...prev,
      title: prev.title || "Nova capacitação (rascunho)",
      displayDate: prev.displayDate || today,
      enrollmentStart: prev.enrollmentStart || today,
      enrollmentEnd: prev.enrollmentEnd || today,
      displayTime: prev.displayTime || "09:00 - 12:00",
    }));
  }, [isNew, user]);

  if (!user) {
    return <PageState title="Sessão necessária" />;
  }

  if (!isNew) {
    if (!full || !course) {
      return <PageState title="Curso não encontrado" />;
    }
    if (!enrollmentVisibleToAdmin(user, full)) {
      return <PageState title="Sem permissão" />;
    }
  }

  function save() {
    const payload = {
      title: form.title,
      description: form.description,
      category: form.category,
      modality: form.modality,
      workloadHours: form.workloadHours,
      location: form.location,
      spots: form.spots,
      eligibilityCriteria: form.eligibility,
      minimumAttendancePercent: form.minAtt,
      scheduleSummary: form.schedule,
      displayDate: form.displayDate,
      displayTimeRange: form.displayTime,
      enrollmentStart: new Date(form.enrollmentStart + "T00:00:00").toISOString(),
      enrollmentEnd: new Date(form.enrollmentEnd + "T23:59:59").toISOString(),
      status: form.status,
      ownerSecretariatId: isNew ? user.secretariatId : full!.ownerSecretariatId,
    };

    if (isNew) {
      const created = upsertCourse(payload, user.id);
      toast.success("Curso criado.");
      navigate(ROUTES.admin.course(created.id));
      return;
    }

    upsertCourse({ id: course!.id, ...payload }, user.id);
    toast.success("Curso atualizado.");
    navigate(ROUTES.admin.course(course!.id));
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="page-title">{isNew ? "Novo curso" : "Editar curso"}</h1>
        <Button asChild variant="ghost" size="sm">
          <Link to={isNew ? ROUTES.admin.courses : ROUTES.admin.course(course!.id)}>Cancelar</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dados gerais</CardTitle>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2 space-y-2">
            <Label>Título</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="sm:col-span-2 space-y-2">
            <Label>Descrição</Label>
            <Textarea
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Categoria</Label>
            <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Modalidade</Label>
            <Select
              value={form.modality}
              onValueChange={(v) => setForm({ ...form, modality: v as CourseModality })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="presencial">Presencial</SelectItem>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="hibrido">Híbrido</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Carga horária</Label>
            <Input
              type="number"
              value={form.workloadHours}
              onChange={(e) => setForm({ ...form, workloadHours: Number(e.target.value) })}
            />
          </div>
          <div className="space-y-2">
            <Label>Vagas</Label>
            <Input
              type="number"
              value={form.spots}
              onChange={(e) => setForm({ ...form, spots: Number(e.target.value) })}
            />
          </div>
          <div className="sm:col-span-2 space-y-2">
            <Label>Local / plataforma</Label>
            <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          </div>
          <div className="sm:col-span-2 space-y-2">
            <Label>Critérios de elegibilidade</Label>
            <Textarea
              rows={3}
              value={form.eligibility}
              onChange={(e) => setForm({ ...form, eligibility: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Presença mínima (%)</Label>
            <Input
              type="number"
              value={form.minAtt}
              onChange={(e) => setForm({ ...form, minAtt: Number(e.target.value) })}
            />
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={form.status}
              onValueChange={(v) => setForm({ ...form, status: v as CourseLifecycleStatus })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rascunho">Rascunho</SelectItem>
                <SelectItem value="publicado">Publicado</SelectItem>
                <SelectItem value="inscricoes_abertas">Inscrições abertas</SelectItem>
                <SelectItem value="em_execucao">Em execução</SelectItem>
                <SelectItem value="encerrado">Encerrado</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="sm:col-span-2 space-y-2">
            <Label>Cronograma (texto)</Label>
            <Textarea
              rows={3}
              value={form.schedule}
              onChange={(e) => setForm({ ...form, schedule: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Data exibida</Label>
            <Input type="date" value={form.displayDate} onChange={(e) => setForm({ ...form, displayDate: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Faixa de horário exibida</Label>
            <Input
              value={form.displayTime}
              onChange={(e) => setForm({ ...form, displayTime: e.target.value })}
              placeholder="09:00 - 12:00"
            />
          </div>
          <div className="space-y-2">
            <Label>Início inscrições</Label>
            <Input
              type="date"
              value={form.enrollmentStart}
              onChange={(e) => setForm({ ...form, enrollmentStart: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Fim inscrições</Label>
            <Input
              type="date"
              value={form.enrollmentEnd}
              onChange={(e) => setForm({ ...form, enrollmentEnd: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" asChild>
          <Link to={isNew ? ROUTES.admin.courses : ROUTES.admin.course(course!.id)}>Voltar</Link>
        </Button>
        <Button onClick={save}>{isNew ? "Criar rascunho" : "Salvar alterações"}</Button>
      </div>
    </div>
  );
}
