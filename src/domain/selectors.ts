import type { AppState } from "./types";

export function instructorDisplayName(state: AppState, instructorId: string | null): string {
  if (!instructorId) return "A designar pela coordenação";
  return state.instructors.find((i) => i.id === instructorId)?.fullName ?? "—";
}

export function secretariatName(state: AppState, id: string): string {
  return state.secretariats.find((s) => s.id === id)?.name ?? id;
}
