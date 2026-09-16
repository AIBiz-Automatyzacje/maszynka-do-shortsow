/** Prosty skrót tekstu — ten sam po stronie serwera i dashboardu (do sprawdzania, czy audio jest aktualne). */
export function hashTekstu(tekst: string): string {
  const t = tekst.trim();
  let h1 = 5381;
  let h2 = 52711;
  for (let i = 0; i < t.length; i++) {
    const c = t.charCodeAt(i);
    h1 = (h1 * 33) ^ c;
    h2 = (h2 * 33) ^ c;
  }
  return ((h1 >>> 0).toString(16) + (h2 >>> 0).toString(16)).padStart(16, "0");
}
