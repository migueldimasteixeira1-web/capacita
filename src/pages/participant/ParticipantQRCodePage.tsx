import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Shield } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/auth/AuthContext";
import { useCapacitaSelector } from "@/services/capacitaStore";
import { PageState } from "@/components/system/PageStates";

export default function ParticipantQRCodePage() {
  const { id } = useParams();
  const { user } = useAuth();
  const row = useCapacitaSelector((s) => {
    const e = s.enrollments.find((x) => x.id === id && x.participantId === user?.id);
    if (!e) return null;
    const course = s.courses.find((c) => c.id === e.courseId);
    return { e, course };
  });

  if (!row || row.e.status !== "confirmada") {
    return (
      <main className="page-container">
        <PageState title="QR Code indisponível" description="Confirme sua inscrição ou tente novamente mais tarde." />
        <Button asChild variant="outline" className="mt-4">
          <Link to={ROUTES.portal.enrollments}>Voltar</Link>
        </Button>
      </main>
    );
  }

  return (
    <main className="page-container max-w-lg mx-auto">
      <Link
        to={ROUTES.portal.enrollments}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" /> Inscrições
      </Link>

      <Card>
        <CardContent className="pt-8 pb-8 flex flex-col items-center text-center space-y-6">
          <div>
            <h1 className="text-xl font-bold text-foreground">Credencial de presença</h1>
            <p className="text-sm text-muted-foreground mt-1">{row.course?.title}</p>
          </div>

          <div className="p-6 bg-card rounded-xl border-2 border-dashed border-border">
            <QRCodeSVG value={row.e.qrToken} size={200} level="H" includeMargin />
          </div>

          <div className="space-y-1">
            <p className="text-sm font-mono text-muted-foreground">{row.e.qrToken}</p>
            <p className="text-xs text-muted-foreground">Token para conferência manual no painel do gestor</p>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted px-4 py-2 rounded-lg text-left">
            <Shield className="h-3.5 w-3.5 shrink-0" />
            Uso exclusivo em ambiente institucional. Não compartilhe capturas em redes públicas.
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
