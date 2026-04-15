import type { AppState, Course, Enrollment, EnrollmentStatus, UserAccount } from "./types";
import { onlyDigits } from "./normalize";

export const ENROLLMENT_STATUS_LABEL: Record<EnrollmentStatus, string> = {
  recebida: "Recebida",
  em_validacao: "Em validação",
  confirmada: "Confirmada",
  lista_espera: "Lista de espera",
  indeferida: "Indeferida",
  cancelada: "Cancelada",
};

export function courseIsVisibleToParticipant(course: Course): boolean {
  return (
    course.status === "inscricoes_abertas" ||
    course.status === "em_execucao" ||
    course.status === "encerrado"
  );
}

export function enrollmentOpenNow(course: Course, now: Date): boolean {
  if (course.status !== "inscricoes_abertas") return false;
  const start = new Date(course.enrollmentStart);
  const end = new Date(course.enrollmentEnd);
  return now >= start && now <= end;
}

/** Vagas ocupadas por confirmados + em validação + recebidas (não lista espera) */
export function occupiedSlots(state: AppState, courseId: string): number {
  return state.enrollments.filter(
    (e) =>
      e.courseId === courseId &&
      e.status !== "lista_espera" &&
      e.status !== "indeferida" &&
      e.status !== "cancelada"
  ).length;
}

export function participantEligibleForCourse(
  participant: UserAccount,
  course: Course,
  state: AppState
): { ok: true } | { ok: false; reason: string } {
  if (participant.role !== "participante") {
    return { ok: false, reason: "Apenas participantes podem se inscrever neste fluxo." };
  }
  const dup = state.enrollments.some(
    (e) =>
      e.participantId === participant.id &&
      e.courseId === course.id &&
      e.status !== "indeferida" &&
      e.status !== "cancelada"
  );
  if (dup) return { ok: false, reason: "Já existe inscrição ativa para este curso." };
  return { ok: true };
}

/** Janela:30 min antes do início até fim da sessão */
export function withinCheckInWindow(
  sessionDate: string,
  startTime: string,
  endTime: string,
  now: Date
): boolean {
  const start = new Date(`${sessionDate}T${startTime}:00`);
  const end = new Date(`${sessionDate}T${endTime}:00`);
  const open = new Date(start.getTime() - 30 * 60 * 1000);
  return now >= open && now <= end;
}

export function attendancePercentForEnrollment(
  state: AppState,
  enrollmentId: string
): number {
  const enr = state.enrollments.find((e) => e.id === enrollmentId);
  if (!enr) return 0;
  const sessions = state.sessions.filter((s) => s.courseId === enr.courseId);
  if (sessions.length === 0) return 0;
  let present = 0;
  for (const sess of sessions) {
    const rec = state.attendance.find(
      (a) => a.enrollmentId === enrollmentId && a.sessionId === sess.id
    );
    if (rec?.status === "presente") present += 1;
    if (rec?.status === "parcial") present += 0.5;
  }
  return Math.round((present / sessions.length) * 100);
}

export function canIssueCertificate(
  state: AppState,
  enrollmentId: string
): { ok: true } | { ok: false; reason: string } {
  const enr = state.enrollments.find((e) => e.id === enrollmentId);
  if (!enr) return { ok: false, reason: "Inscrição não encontrada." };
  if (enr.status !== "confirmada") {
    return { ok: false, reason: "Certificado exige inscrição confirmada." };
  }
  const course = state.courses.find((c) => c.id === enr.courseId);
  if (!course) return { ok: false, reason: "Curso não encontrado." };
  if (course.status !== "encerrado") {
    return { ok: false, reason: "Certificado disponível apenas após encerramento oficial do curso." };
  }
  const pct = attendancePercentForEnrollment(state, enrollmentId);
  if (pct < course.minimumAttendancePercent) {
    return {
      ok: false,
      reason: `Presença mínima não atingida (${pct}% / exigido ${course.minimumAttendancePercent}%).`,
    };
  }
  if (state.certificates.some((c) => c.enrollmentId === enrollmentId)) {
    return { ok: false, reason: "Certificado já emitido." };
  }
  return { ok: true };
}

export function validateInstitutionalIdentity(
  user: UserAccount,
  cpfInput: string,
  birthDateInput: string
): boolean {
  return onlyDigits(cpfInput) === user.cpf && birthDateInput === user.birthDate;
}

export function courseLifecycleLabel(status: Course["status"]): string {
  const m: Record<Course["status"], string> = {
    rascunho: "Rascunho",
    publicado: "Publicado",
    inscricoes_abertas: "Inscrições abertas",
    em_execucao: "Em execução",
    encerrado: "Encerrado",
    cancelado: "Cancelado",
  };
  return m[status];
}
