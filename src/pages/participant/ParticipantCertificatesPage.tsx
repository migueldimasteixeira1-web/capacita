import { Link } from "react-router-dom";
import { Award, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/auth/AuthContext";
import { useCapacitaSelector } from "@/services/capacitaStore";
import { ROUTES } from "@/constants/routes";
import { canIssueCertificate } from "@/domain/rules";
import { InlineEmpty } from "@/components/system/PageStates";

export default function ParticipantCertificatesPage() {
  const { user } = useAuth();
  const certs = useCapacitaSelector((s) =>
    s.certificates.filter((c) => {
      const e = s.enrollments.find((x) => x.id === c.enrollmentId);
      return e?.participantId === user?.id;
    })
  );

  const pending = useCapacitaSelector((s) => {
    return s.enrollments.filter((e) => {
      if (e.participantId !== user?.id) return false;
      const check = canIssueCertificate(s, e.id);
      return !check.ok && e.status === "confirmada";
    });
  });

  return (
    <main className="page-container">
      <div className="mb-8">
        <h1 className="page-title">Certificados</h1>
        <p className="page-subtitle">
          Documentos emitidos automaticamente após cumprimento das regras de presença e encerramento do curso.
        </p>
      </div>

      {pending.length > 0 && (
        <div className="mb-6 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-900 dark:text-amber-100">
          Há {pending.length} inscrição(ões) aguardando critérios para emissão (presença mínima ou encerramento).
        </div>
      )}

      {certs.length === 0 ? (
        <InlineEmpty
          title="Nenhum certificado disponível"
          description="Quando a coordenação concluir o curso e sua frequência atingir o mínimo exigido, o certificado aparecerá aqui."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {certs.map((cert) => (
            <Card key={cert.id} className="card-hover">
              <CardContent className="p-5 flex gap-4 items-start">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-success/10">
                  <Award className="h-6 w-6 text-success" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground text-sm">{cert.courseTitleSnapshot}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Emitido em {new Date(cert.issuedAt).toLocaleDateString("pt-BR")} • {cert.workloadHoursSnapshot}h
                  </p>
                  <p className="text-xs font-mono text-muted-foreground mt-1 break-all">{cert.code}</p>
                  <div className="flex gap-2 mt-3 flex-wrap">
                    <Button asChild variant="outline" size="sm" className="gap-1.5 text-xs">
                      <Link to={ROUTES.portal.certificate(cert.enrollmentId)}>Visualizar</Link>
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-1.5 text-xs" type="button" disabled>
                      <ExternalLink className="h-3.5 w-3.5" /> Validação pública (desativada)
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
