export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

export function formatCpfMask(digits: string): string {
  const d = onlyDigits(digits).slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

export function maskCpfForDisplay(cpfDigits: string): string {
  const d = onlyDigits(cpfDigits);
  if (d.length !== 11) return "•••.•••.•••-••";
  return `***.***.${d.slice(6, 9)}-${d.slice(9)}`;
}
