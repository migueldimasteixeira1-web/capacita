import type { Course, UserAccount, UserRole } from "@/domain/types";

export const ADMIN_ROLES: UserRole[] = ["gestor", "admin_programa", "admin_tecnico"];

export function isAdminRole(role: UserRole): boolean {
  return ADMIN_ROLES.includes(role);
}

export function canAccessParticipantArea(user: UserAccount): boolean {
  return user.role === "participante";
}

export function canAccessInstructorArea(user: UserAccount): boolean {
  return user.role === "instrutor";
}

export function canAccessAdminArea(user: UserAccount): boolean {
  return isAdminRole(user.role);
}

/** Curso visível para operações do gestor (escopo por secretaria) */
export function courseInGestorScope(user: UserAccount, course: Course): boolean {
  if (user.role === "admin_programa" || user.role === "admin_tecnico") return true;
  if (user.role !== "gestor") return false;
  return user.managedSecretariatIds.includes(course.ownerSecretariatId);
}

export function filterCoursesForAdminUser(user: UserAccount, courses: Course[]): Course[] {
  if (user.role === "gestor") {
    return courses.filter((c) => courseInGestorScope(user, c));
  }
  return courses;
}

export function enrollmentVisibleToAdmin(user: UserAccount, course: Course | undefined): boolean {
  if (!course) return false;
  return courseInGestorScope(user, course);
}

export function instructorTeachesCourse(
  user: UserAccount,
  course: Course,
  instructorProfileIdForUser: string | null
): boolean {
  if (user.role !== "instrutor") return false;
  if (!instructorProfileIdForUser) return false;
  return course.primaryInstructorId === instructorProfileIdForUser;
}
