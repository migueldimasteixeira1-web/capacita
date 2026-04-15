import { useParams } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import { useCapacitaSelector } from "@/services/capacitaStore";
import { useInstructorProfileForUser } from "@/hooks/useInstructorProfile";
import { instructorTeachesCourse } from "@/auth/permissions";
import { PageState } from "@/components/system/PageStates";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function InstructorDocumentPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const profile = useInstructorProfileForUser(user);
  const { course, doc } = useCapacitaSelector((s) => {
    const c = s.courses.find((x) => x.id === id);
    const d = c?.designationDocumentId
      ? s.documents.find((x) => x.id === c.designationDocumentId)
      : undefined;
    return { course: c, doc: d };
  });

  if (!user || !profile || !course || !instructorTeachesCourse(user, course, profile.id)) {
    return <PageState title="Documento indisponível" />;
  }

  if (!doc) {
    return (
      <PageState
        title="Documento ainda não emitido"
        description="A coordenação precisa gerar a portaria de designação/abono neste curso."
      />
    );
  }

  return (
    <div className="space-y-4 max-w-3xl">
      <div>
        <h1 className="page-title">Documento institucional</h1>
        <p className="page-subtitle">{doc.title}</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base text-sm text-muted-foreground">
            Emitido em {new Date(doc.generatedAt).toLocaleString("pt-BR")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="whitespace-pre-wrap text-sm font-sans text-muted-foreground leading-relaxed">
            {doc.body}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
