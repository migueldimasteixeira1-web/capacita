import { useAuth } from "@/auth/AuthContext";
import { useCapacitaSelector } from "@/services/capacitaStore";
import { filterCoursesForAdminUser } from "@/auth/permissions";
import type { AppState } from "@/domain/types";

export function useScopedAdminData(): {
  state: AppState;
  courses: AppState["courses"];
  enrollments: AppState["enrollments"];
} {
  const { user } = useAuth();
  return useCapacitaSelector((s) => {
    if (!user) return { state: s, courses: [], enrollments: [] };
    const courses = filterCoursesForAdminUser(user, s.courses);
    const allowed = new Set(courses.map((c) => c.id));
    const enrollments = s.enrollments.filter((e) => allowed.has(e.courseId));
    return { state: s, courses, enrollments };
  });
}
