import type {
  AppState,
  Course,
  Enrollment,
  EnrollmentStatus,
  InstitutionDocument,
  UserAccount,
} from "@/domain/types";
import {
  attendancePercentForEnrollment,
  canIssueCertificate,
  occupiedSlots,
  participantEligibleForCourse,
  withinCheckInWindow,
} from "@/domain/rules";
import { getCapacitaState, setCapacitaState } from "./capacitaStore";
import { onlyDigits } from "@/domain/normalize";

function nowIso() {
  return new Date().toISOString();
}

function pushAudit(
  state: AppState,
  actorUserId: string,
  action: string,
  entityType: string,
  entityId: string,
  detail?: string
): AppState {
  return {
    ...state,
    audit: [
      ...state.audit,
      {
        id: `aud-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        at: nowIso(),
        actorUserId,
        action,
        entityType,
        entityId,
        detail,
      },
    ],
  };
}

export function findUserByRegistrationOrCpf(login: string): UserAccount | undefined {
  const s = getCapacitaState();
  const digits = onlyDigits(login);
  return s.users.find(
    (u) =>
      u.registrationNumber.toLowerCase() === login.trim().toLowerCase() ||
      (digits.length === 11 && u.cpf === digits)
  );
}

export function setUserPassword(userId: string, passwordHash: string): void {
  setCapacitaState((prev) => ({
    ...prev,
    users: prev.users.map((u) =>
      u.id === userId
        ? { ...u, passwordHash, firstAccessCompleted: true, updatedAt: nowIso() }
        : u
    ),
  }));
}

export function createEnrollment(params: {
  courseId: string;
  participant: UserAccount;
  actorUserId: string;
}): { ok: true; enrollment: Enrollment } | { ok: false; reason: string } {
  const { courseId, participant, actorUserId } = params;
  const snap = getCapacitaState();
  const course = snap.courses.find((c) => c.id === courseId);
  if (!course) return { ok: false, reason: "Curso não encontrado." };

  const elig = participantEligibleForCourse(participant, course, snap);
  if (!elig.ok) return { ok: false, reason: elig.reason };

  const occ = occupiedSlots(snap, courseId);
  const status: EnrollmentStatus = occ >= course.spots ? "lista_espera" : "recebida";
  const id = `ENR-${Date.now()}`;
  const enrollment: Enrollment = {
    id,
    courseId,
    participantId: participant.id,
    status,
    submittedAt: nowIso(),
    documents: course.requirements.map((name) => ({ name, status: "pendente" as const })),
    qrToken: `QR-${id}-${courseId}`,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };

  setCapacitaState((prev) =>
    pushAudit(
      {
        ...prev,
        enrollments: [...prev.enrollments, enrollment],
      },
      actorUserId,
      "enrollment_created",
      "enrollment",
      enrollment.id,
      status
    )
  );
  return { ok: true, enrollment };
}

export function setEnrollmentStatus(params: {
  enrollmentId: string;
  status: EnrollmentStatus;
  actorUserId: string;
  indeferimentoReason?: string;
}): { ok: true } | { ok: false; reason: string } {
  const { enrollmentId, status, actorUserId, indeferimentoReason } = params;
  setCapacitaState((prev) => {
    const enr = prev.enrollments.find((e) => e.id === enrollmentId);
    if (!enr) return prev;
    const next: Enrollment = {
      ...enr,
      status,
      reviewedAt: nowIso(),
      reviewedByUserId: actorUserId,
      indeferimentoReason: status === "indeferida" ? indeferimentoReason : undefined,
      updatedAt: nowIso(),
    };
    return pushAudit(
      {
        ...prev,
        enrollments: prev.enrollments.map((e) => (e.id === enrollmentId ? next : e)),
      },
      actorUserId,
      "enrollment_status_changed",
      "enrollment",
      enrollmentId,
      status
    );
  });
  return { ok: true };
}

export function participantCheckInOut(params: {
  enrollmentId: string;
  sessionId: string;
  kind: "in" | "out";
  actorUserId: string;
  /** Quando true, ignora janela de horário (operação assistida pelo gestor). */
  force?: boolean;
}): { ok: true } | { ok: false; code: string; message: string } {
  const { enrollmentId, sessionId, kind, actorUserId, force } = params;
  const snap = getCapacitaState();
  const enr = snap.enrollments.find((e) => e.id === enrollmentId);
  if (!enr) return { ok: false, code: "not_found", message: "Inscrição não encontrada." };
  if (enr.status !== "confirmada") {
    return { ok: false, code: "not_confirmed", message: "Check-in disponível apenas para inscrições confirmadas." };
  }
  const session = snap.sessions.find((s) => s.id === sessionId && s.courseId === enr.courseId);
  if (!session) return { ok: false, code: "session", message: "Sessão inválida para este curso." };

  const now = new Date();
  if (!force && !withinCheckInWindow(session.date, session.startTime, session.endTime, now)) {
    return {
      ok: false,
      code: "outside_window",
      message: "Fora da janela de registro de presença para esta sessão.",
    };
  }

  const existing = snap.attendance.find(
    (a) => a.enrollmentId === enrollmentId && a.sessionId === sessionId
  );
  const ts = now.toISOString();

  if (kind === "out" && !existing?.checkInAt && !force) {
    return {
      ok: false,
      code: "no_checkin",
      message: "Check-out exige check-in prévio nesta sessão.",
    };
  }

  setCapacitaState((prev) => {
    if (existing) {
      const checkInAt = kind === "in" ? ts : existing.checkInAt;
      const checkOutAt = kind === "out" ? ts : existing.checkOutAt;
      const status =
        checkInAt && checkOutAt ? ("presente" as const) : checkInAt ? ("parcial" as const) : existing.status;
      const upd = {
        ...existing,
        checkInAt,
        checkOutAt,
        status,
        manualAdjustment: false,
      };
      return pushAudit(
        {
          ...prev,
          attendance: prev.attendance.map((a) => (a.id === existing.id ? upd : a)),
        },
        actorUserId,
        kind === "in" ? "check_in" : "check_out",
        "attendance",
        existing.id
      );
    }
    if (kind === "out" && force) {
      const rec = {
        id: `att-${enrollmentId}-${sessionId}`,
        enrollmentId,
        sessionId,
        checkInAt: ts,
        checkOutAt: ts,
        status: "presente" as const,
        manualAdjustment: false,
      };
      return pushAudit(
        { ...prev, attendance: [...prev.attendance, rec] },
        actorUserId,
        "check_out",
        "attendance",
        rec.id
      );
    }
    if (kind === "out") return prev;
    const rec = {
      id: `att-${enrollmentId}-${sessionId}`,
      enrollmentId,
      sessionId,
      checkInAt: ts,
      checkOutAt: null,
      status: "parcial" as const,
      manualAdjustment: false,
    };
    return pushAudit(
      { ...prev, attendance: [...prev.attendance, rec] },
      actorUserId,
      "check_in",
      "attendance",
      rec.id
    );
  });

  return { ok: true };
}

export function manualAdjustAttendance(params: {
  enrollmentId: string;
  sessionId: string;
  status: "presente" | "ausente" | "parcial";
  justification: string;
  actorUserId: string;
}): { ok: true } | { ok: false; reason: string } {
  const { enrollmentId, sessionId, status, justification, actorUserId } = params;
  if (!justification.trim()) return { ok: false, reason: "Justificativa obrigatória." };
  const snap = getCapacitaState();
  const existing = snap.attendance.find(
    (a) => a.enrollmentId === enrollmentId && a.sessionId === sessionId
  );
  setCapacitaState((prev) => {
    const base = existing ?? {
      id: `att-${enrollmentId}-${sessionId}`,
      enrollmentId,
      sessionId,
      checkInAt: null,
      checkOutAt: null,
      status: "nao_registrada" as const,
      manualAdjustment: false,
    };
    const next = {
      ...base,
      status,
      manualAdjustment: true,
      adjustmentJustification: justification,
      adjustedByUserId: actorUserId,
      adjustedAt: nowIso(),
    };
    const list = existing
      ? prev.attendance.map((a) => (a.id === existing.id ? next : a))
      : [...prev.attendance, next];
    return pushAudit(
      { ...prev, attendance: list },
      actorUserId,
      "attendance_manual",
      "attendance",
      next.id
    );
  });
  return { ok: true };
}

export function upsertCourse(
  course: Partial<Course> & { id?: string },
  actorUserId: string
): Course {
  const snap = getCapacitaState();
  const ts = nowIso();
  if (course.id && snap.courses.some((c) => c.id === course.id)) {
    let updated!: Course;
    setCapacitaState((prev) => {
      const next = prev.courses.map((c) => {
        if (c.id !== course.id) return c;
        updated = { ...c, ...course, updatedAt: ts };
        return updated;
      });
      return pushAudit({ ...prev, courses: next }, actorUserId, "course_updated", "course", course.id!);
    });
    return updated;
  }
  const id = String(Math.max(0, ...snap.courses.map((c) => Number(c.id))) + 1);
  const full: Course = {
    id,
    title: course.title ?? "Novo curso",
    description: course.description ?? "",
    category: course.category ?? "Geral",
    modality: course.modality ?? "presencial",
    workloadHours: course.workloadHours ?? 4,
    scheduleSummary: course.scheduleSummary ?? "",
    location: course.location ?? "",
    spots: course.spots ?? 20,
    enrollmentStart: course.enrollmentStart ?? ts,
    enrollmentEnd: course.enrollmentEnd ?? ts,
    eligibilityCriteria: course.eligibilityCriteria ?? "Servidores e comissionados.",
    minimumAttendancePercent: course.minimumAttendancePercent ?? 75,
    requirements: course.requirements ?? [],
    status: course.status ?? "rascunho",
    primaryInstructorId: course.primaryInstructorId ?? null,
    designationDocumentId: course.designationDocumentId ?? null,
    ownerSecretariatId: course.ownerSecretariatId ?? "sec-geral",
    displayDate: course.displayDate ?? new Date().toISOString().slice(0, 10),
    displayTimeRange: course.displayTimeRange ?? "09:00 - 12:00",
    createdAt: ts,
    updatedAt: ts,
  };
  setCapacitaState((prev) =>
    pushAudit({ ...prev, courses: [...prev.courses, full] }, actorUserId, "course_created", "course", id)
  );
  return full;
}

export function setCourseStatus(
  courseId: string,
  status: Course["status"],
  actorUserId: string
): void {
  setCapacitaState((prev) =>
    pushAudit(
      {
        ...prev,
        courses: prev.courses.map((c) =>
          c.id === courseId ? { ...c, status, updatedAt: nowIso() } : c
        ),
      },
      actorUserId,
      "course_status",
      "course",
      courseId,
      status
    )
  );
}

export function linkInstructorAndDesignation(params: {
  courseId: string;
  instructorId: string;
  actorUserId: string;
}): InstitutionDocument {
  const { courseId, instructorId, actorUserId } = params;
  const snap = getCapacitaState();
  const course = snap.courses.find((c) => c.id === courseId);
  const inst = snap.instructors.find((i) => i.id === instructorId);
  if (!course || !inst) throw new Error("Curso ou instrutor inválido.");

  const doc: InstitutionDocument = {
    id: `doc-${courseId}-${instructorId}`,
    kind: "portaria_designacao",
    title: `Portaria de designação — ${course.title}`,
    courseId,
    instructorId,
    body: `O Município, por intermédio da ${snap.secretariats.find((s) => s.id === course.ownerSecretariatId)?.name ?? "Secretaria competente"}, designa ${inst.fullName} (CPF ${inst.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.***.***-$4")}) como instrutor(a) responsável pelo curso "${course.title}", carga horária de ${course.workloadHours}h, conforme cronograma interno.\n\nEmitido em ${new Date().toLocaleDateString("pt-BR")} — documento institucional para fins de abono e registro funcional.`,
    generatedAt: nowIso(),
    generatedByUserId: actorUserId,
  };

  setCapacitaState((prev) =>
    pushAudit(
      {
        ...prev,
        documents: [...prev.documents.filter((d) => d.id !== doc.id), doc],
        courses: prev.courses.map((c) =>
          c.id === courseId
            ? {
                ...c,
                primaryInstructorId: instructorId,
                designationDocumentId: doc.id,
                updatedAt: nowIso(),
              }
            : c
        ),
      },
      actorUserId,
      "designation_generated",
      "document",
      doc.id
    )
  );
  return doc;
}

export function tryIssueCertificate(params: {
  enrollmentId: string;
  actorUserId: string;
}): { ok: true; code: string } | { ok: false; reason: string } {
  const snap = getCapacitaState();
  const check = canIssueCertificate(snap, params.enrollmentId);
  if (!check.ok) return check;
  const enr = snap.enrollments.find((e) => e.id === params.enrollmentId)!;
  const course = snap.courses.find((c) => c.id === enr.courseId)!;
  const user = snap.users.find((u) => u.id === enr.participantId)!;
  const code = `CERT-${new Date().getFullYear()}-${enr.id}-${course.id}`;
  const cert = {
    id: `cert-${enr.id}`,
    enrollmentId: enr.id,
    code,
    issuedAt: nowIso(),
    courseTitleSnapshot: course.title,
    participantNameSnapshot: user.fullName,
    workloadHoursSnapshot: course.workloadHours,
  };
  setCapacitaState((prev) =>
    pushAudit(
      { ...prev, certificates: [...prev.certificates, cert] },
      params.actorUserId,
      "certificate_issued",
      "certificate",
      cert.id
    )
  );
  return { ok: true, code };
}

export function getAttendanceInconsistencies(): {
  enrollmentId: string;
  courseTitle: string;
  participantName: string;
  percent: string;
  min: number;
}[] {
  const snap = getCapacitaState();
  const out: {
    enrollmentId: string;
    courseTitle: string;
    participantName: string;
    percent: string;
    min: number;
  }[] = [];
  for (const enr of snap.enrollments) {
    if (enr.status !== "confirmada") continue;
    const course = snap.courses.find((c) => c.id === enr.courseId);
    if (!course || course.status === "rascunho") continue;
    const p = attendancePercentForEnrollment(snap, enr.id);
    if (p < course.minimumAttendancePercent) {
      const u = snap.users.find((x) => x.id === enr.participantId);
      out.push({
        enrollmentId: enr.id,
        courseTitle: course.title,
        participantName: u?.fullName ?? "—",
        percent: String(p),
        min: course.minimumAttendancePercent,
      });
    }
  }
  return out;
}
