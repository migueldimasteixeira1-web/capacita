/** Hash simples no cliente para demo — em produção usar provedor de auth (ex.: Supabase). */
export async function hashPassword(plain: string): Promise<string> {
  const enc = new TextEncoder().encode(plain);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  const h = await hashPassword(plain);
  return h === hash;
}
