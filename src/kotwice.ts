// Przypinanie animacji do słów lektora.
// Element wchodzi dokładnie wtedy, gdy lektor mówi o nim, a nie po sztywnej liczbie klatek.
import type { Slowo } from "./typy";
import { FPS } from "./czas";

/** Przerwa, powyżej której uznajemy, że lektor zrobił oddech. */
const PRZERWA_ODDECHU = 0.18;

/**
 * Wyznacza klatki wejścia dla kolejnych elementów sceny.
 * Dzieli wypowiedź na tyle części, ile jest elementów, i w każdej wybiera moment
 * po naturalnym oddechu lektora. Bez nagrania wraca do równych odstępów.
 */
export function kotwice(ile: number, slowa: Slowo[] | undefined, opcje?: { start?: number; odstep?: number }): number[] {
  const start = opcje?.start ?? 8;
  const odstep = opcje?.odstep ?? 14;
  if (ile <= 0) return [];
  if (!slowa || slowa.length < ile + 1) {
    return Array.from({ length: ile }, (_, i) => start + i * odstep);
  }

  const koniecMowy = slowa[slowa.length - 1].koniec;
  const wynik: number[] = [];
  for (let i = 0; i < ile; i++) {
    // Idealny moment: równo rozłożony na czasie wypowiedzi, z lekkim wyprzedzeniem.
    const cel = (koniecMowy * i) / ile;
    let najlepszy = slowa[0];
    let najlepszaOcena = Infinity;
    slowa.forEach((s, n) => {
      const przerwa = n === 0 ? 1 : s.start - slowa[n - 1].koniec;
      // Kara za odległość od celu, nagroda za wejście po oddechu.
      const ocena = Math.abs(s.start - cel) - (przerwa > PRZERWA_ODDECHU ? 0.35 : 0);
      if (ocena < najlepszaOcena) {
        najlepszaOcena = ocena;
        najlepszy = s;
      }
    });
    // Obraz wyprzedza głos o trzy klatki, inaczej wygląda na spóźniony.
    wynik.push(Math.max(0, Math.round(najlepszy.start * FPS) - 3));
  }

  // Elementy muszą wchodzić po kolei i nie zlewać się w jedno.
  for (let i = 1; i < wynik.length; i++) {
    if (wynik[i] < wynik[i - 1] + 5) wynik[i] = wynik[i - 1] + 5;
  }
  return wynik;
}

/** Klatka, na której pada konkretne słowo z wypowiedzi (do wyróżnień). */
export function klatkaSlowa(slowa: Slowo[] | undefined, szukane: string): number | null {
  if (!slowa) return null;
  const czyste = (t: string) => t.toLowerCase().replace(/[.,!?…:;"„”]/g, "");
  const cel = czyste(szukane).split(/\s+/)[0];
  const trafione = slowa.find((s) => czyste(s.tekst) === cel);
  return trafione ? Math.round(trafione.start * FPS) : null;
}
