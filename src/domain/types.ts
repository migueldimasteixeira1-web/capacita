/** Perfis institucionais — controle de acesso por menor privilégio */
export type UserRole =
  | "participante"
  | "instrutor"
  | "gestor"
  | "admin_programa"
  | "admin_tecnico";

export type CourseLifecycleStatus =
  | "rascunho"
  | "publicado"
  | "inscricoes_abertas"
  | "em_execucao"
  | "encerrado"
  | "cancelado";

export type CourseModality = "presencial" | "online" | "hibrido";

export type EnrollmentStatus =
  | "recebida"
  | "em_validacao"
  | "confirmada"
  | "lista_espera"
  | "indeferida"
  | "cancelada";

export type SessionAttendanceStatus = "nao_registrada" | "presente" | "ausente" | "parcial";

export type DocumentKind = "portaria_designacao" | "declaracao_abono" | "outro";

export interface Secretariat {
  id: string;
  name: string;
  code: string;
}

export interface UserAccount {
  id: string;
  registrationNumber: string;
  cpf: string;
  fullName: string;
  email: string;
  phone?: string;
  secretariatId: string;
  role: UserRole;
  /** Hash SHA-256 hex; null quando exige primeiro acesso */
  passwordHash: string | null;
  firstAccessCompleted: boolean;
  /** YYYY-MM-DD — validação de primeiro acesso */
  birthDate: string;
  /** Gestor: escopo por secretaria(s). Admin: ignorado. */
  managedSecretariatIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface InstructorProfile {
  id: string;
  userId: string | null;
  fullName: string;
  cpf: string;
  email: string;
  specialty: string;
  createdAt: string;
}

export interface CourseSession {
  id: string;
  courseId: string;
  label: string;
  date: string;
  startTime: string;
  endTime: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  modality: CourseModality;
  workloadHours: number;
  /** Texto ou bullet list para cronograma institucional */
  scheduleSummary: string;
  location: string;
  spots: number;
  enrollmentStart: string;
  enrollmentEnd: string;
  /** Critérios textuais de elegibilidade */
  eligibilityCriteria: string;
  /** 0–100 — presença mínima para certificado */
  minimumAttendancePercent: number;
  requirements: string[];
  status: CourseLifecycleStatus;
  primaryInstructorId: string | null;
  designationDocumentId: string | null;
  /** Secretaria gestora do curso (escopo do gestor) */
  ownerSecretariatId: string;
  /** Exibição: período principal do curso */
  displayDate: string;
  displayTimeRange: string;
  createdAt: string;
  updatedAt: string;
}

export interface Enrollment {
  id: string;
  courseId: string;
  participantId: string;
  status: EnrollmentStatus;
  submittedAt: string;
  reviewedAt?: string;
  reviewedByUserId?: string;
  indeferimentoReason?: string;
  documents: { name: string; status: "pendente" | "aprovado" | "rejeitado" }[];
  qrToken: string;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceRecord {
  id: string;
  enrollmentId: string;
  sessionId: string;
  checkInAt: string | null;
  checkOutAt: string | null;
  status: SessionAttendanceStatus;
  manualAdjustment: boolean;
  adjustmentJustification?: string;
  adjustedByUserId?: string;
  adjustedAt?: string;
}

export interface Certificate {
  id: string;
  enrollmentId: string;
  code: string;
  issuedAt: string;
  courseTitleSnapshot: string;
  participantNameSnapshot: string;
  workloadHoursSnapshot: number;
}

export interface InstitutionDocument {
  id: string;
  kind: DocumentKind;
  title: string;
  courseId: string | null;
  instructorId: string | null;
  /** Conteúdo texto para visualização (sem PDF binário nesta base) */
  body: string;
  generatedAt: string;
  generatedByUserId: string;
}

export interface AuditEntry {
  id: string;
  at: string;
  actorUserId: string;
  action: string;
  entityType: string;
  entityId: string;
  detail?: string;
}

export interface AppState {
  secretariats: Secretariat[];
  users: UserAccount[];
  instructors: InstructorProfile[];
  courses: Course[];
  sessions: CourseSession[];
  enrollments: Enrollment[];
  attendance: AttendanceRecord[];
  certificates: Certificate[];
  documents: InstitutionDocument[];
  audit: AuditEntry[];
}
