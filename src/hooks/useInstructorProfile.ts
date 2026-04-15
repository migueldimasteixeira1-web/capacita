import { useCapacitaSelector } from "@/services/capacitaStore";
import type { UserAccount } from "@/domain/types";

export function useInstructorProfileForUser(user: UserAccount | null) {
  return useCapacitaSelector((s) => {
    if (!user) return null;
    return s.instructors.find((i) => i.userId === user.id) ?? null;
  });
}
