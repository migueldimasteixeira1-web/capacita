import { Link, useParams } from "react-router-dom";
import { Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/auth/AuthContext";
import { useCapacitaSelector } from "@/services/capacitaStore";
import { PageState } from "@/components/system/PageStates";

export default function ParticipantCertificateViewPage() {
  const { enrollmentId } = useParams();
  const { user } = useAuth();
  const cert = useCapacitaSelector((s) => {
    const c = s.certificates.find((x) => x.enrollmentId === enrollmentId);
    const e = s.enrollments.find((x) => x.id === enrollmentId);
    if (!c || e?.participantId !== user?.id) return null;
    return { c, e };
  });

  if (!cert) {
    return (
      <main className="page-container">
        <PageState
          title="Certificado indisponível"
          description="O documento não foi emitido ou você não tem permissão para visualizá-lo."
        />
        <Button asChild variant="outline" className="mt-4">
          <Link to={ROUTES.portal.certificates}>Voltar</Link>
        </Button>
      </main>
    );
  }

  return (
    <main className="page-container max-w-3xl space-y-6">
      <Button asChild variant="ghost" size="sm">
        <Link to={ROUTES.portal.certificates}>← Voltar</Link>
      </Button>

      <Card className="border-2 border-primary/20">
        <CardContent className="p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Award className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Certificado institucional</p>
              <h1 className="text-xl font-bold">{cert.c.courseTitleSnapshot}</h1>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 text-sm border-t pt-6">
            <div>
              <p className="text-muted-foreground">Participante</p>
              <p className="font-medium">{cert.c.participantNameSnapshot}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Carga horária</p>
              <p className="font-medium">{cert.c.workloadHoursSnapshot} horas</p>
            </div>
            <div>
              <p className="text-muted-foreground">Código de autenticidade</p>
              <p className="font-mono text-xs break-all">{cert.c.code}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Emissão</p>
              <p className="font-medium">{new Date(cert.c.issuedAt).toLocaleString("pt-BR")}</p>
            </div>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed">
            Documento gerado pelo sistema interno Capacita para fins de comprovação junto à chefia e órgãos de controle.
            A validade depende das normas internas aplicáveis a cada secretaria.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
