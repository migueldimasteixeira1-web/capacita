import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ROUTES } from "@/constants/routes";
import { useCapacitaSelector } from "@/services/capacitaStore";
import { useAuth } from "@/auth/AuthContext";
import { useState } from "react";
import {
  courseIsVisibleToParticipant,
  enrollmentOpenNow,
} from "@/domain/rules";
import { createEnrollment } from "@/services/capacitaActions";
import { toast } from "sonner";
import { PageState } from "@/components/system/PageStates";

export default function ParticipantEnrollmentFormPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const course = useCapacitaSelector((s) => s.courses.find((c) => c.id === id));
  const [accepted, setAccepted] = useState(false);
  const [done, setDone] = useState(false);

  if (!course || !user || !courseIsVisibleToParticipant(course)) {
    return (
      <main className="page-container">
        <PageState title="Oferta indisponível" description="Não foi possível localizar este curso." />
      </main>
    );
  }

  const canEnroll =
    course.status === "inscricoes_abertas" && enrollmentOpenNow(course, new Date());

  if (!canEnroll) {
    return (
      <main className="page-container max-w-xl">
        <PageState
          title="Inscrição indisponível"
          description="O período ou status do curso não permite novas solicitações."
        />
        <Button asChild variant="outline" className="mt-4">
          <Link to={ROUTES.portal.course(course.id)}>Voltar</Link>
        </Button>
      </main>
    );
  }

  if (done) {
    return (
      <main className="page-container max-w-lg mx-auto text-center py-16">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-success/10 mx-auto mb-4">
          <CheckCircle2 className="h-8 w-8 text-success" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Solicitação registrada</h1>
        <p className="text-muted-foreground mt-2">
          Sua inscrição foi recebida e seguirá para validação. Acompanhe o status em &quot;Minhas inscrições&quot;.
        </p>
        <div className="flex gap-3 justify-center pt-6 flex-wrap">
          <Button asChild>
            <Link to={ROUTES.portal.enrollments}>Minhas inscrições</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to={ROUTES.portal.courses}>Catálogo</Link>
          </Button>
        </div>
      </main>
    );
  }

  function submit() {
    if (!accepted) {
      toast.error("É necessário aceitar o tratamento de dados.");
      return;
    }
    const res = createEnrollment({ courseId: course.id, participant: user, actorUserId: user.id });
    if (!res.ok) {
      toast.error(res.reason);
      return;
    }
    if (res.enrollment.status === "lista_espera") {
      toast.message("Lista de espera", { description: "Sem vagas imediatas — você entrou na fila." });
    } else {
      toast.success("Inscrição recebida.");
    }
    setDone(true);
  }

  return (
    <main className="page-container max-w-2xl mx-auto">
      <Link
        to={ROUTES.portal.course(course.id)}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Link>

      <h1 className="page-title mb-1">Solicitação de inscrição</h1>
      <p className="page-subtitle mb-6">{course.title}</p>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Dados do participante (base institucional)</CardTitle>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-3 text-sm">
            <div>
              <Label className="text-muted-foreground">Nome</Label>
              <p className="font-medium">{user.fullName}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Matrícula</Label>
              <p className="font-medium">{user.registrationNumber}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">E-mail institucional</Label>
              <p className="font-medium break-all">{user.email}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Telefone</Label>
              <p className="font-medium">{user.phone ?? "—"}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Documentação exigida</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              Nesta demonstração, o envio físico/digital é simulado. Em produção, integre o repositório documental da
              prefeitura.
            </p>
            <ul className="list-disc pl-5 space-y-1">
              {course.requirements.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <label className="flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                className="mt-1 rounded border-input"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
              />
              <span className="text-muted-foreground leading-snug">
                Declaro veracidade das informações e ciência do tratamento de dados pessoais conforme a LGPD e normas
                internas da administração pública municipal.
              </span>
            </label>
          </CardContent>
        </Card>

        <Button size="lg" className="w-full" onClick={submit}>
          Enviar solicitação
        </Button>
      </div>
    </main>
  );
}
