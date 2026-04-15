import type { EnrollmentStatus } from "@/domain/types";
import { ENROLLMENT_STATUS_LABEL } from "@/domain/rules";
import { Circle } from "lucide-react";

const statusClasses: Record<EnrollmentStatus, string> = {
  recebida: "status-badge status-recebida",
  em_validacao: "status-badge status-em-validacao",
  confirmada: "status-badge status-confirmada",
  lista_espera: "status-badge status-lista-espera",
  indeferida: "status-badge status-indeferida",
  cancelada: "status-badge status-cancelada",
};

export function EnrollmentStatusBadge({ status }: { status: EnrollmentStatus }) {
  return (
    <span className={statusClasses[status]}>
      <Circle className="h-2 w-2 fill-current" />
      {ENROLLMENT_STATUS_LABEL[status]}
    </span>
  );
}
