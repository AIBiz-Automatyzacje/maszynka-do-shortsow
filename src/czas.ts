// Obliczanie długości scen i całej rolki. Używane przez Remotion, dashboard i serwer.
import type { Scena, Scenariusz } from "./typy";

export const FPS = 30;
export const PAUZA_PO_LEKTORZE = 0.5; // cisza po wypowiedzi, żeby scena nie ucinała ostatniego słowa
export const PRZEJSCIE_KLATKI = 12;
export const MIN_CZAS_SCENY = 2.2;
/** Ogon po ostatnim słowie całej rolki: widz zdąży przeczytać zakończenie. */
export const OGON_KONCOWY = 1.6;

/** Tempo lektora po polsku: 170 słów na minutę (zmierzone na klonie głosu). */
export const SLOW_NA_MINUTE = 170;
export const SLOW_NA_SEKUNDE = SLOW_NA_MINUTE / 60;

/** Ile słów lektora zmieści się w rolce o zadanej długości. */
export function budzetSlow(sekundy: number): number {
  return Math.round(sekundy * SLOW_NA_SEKUNDE * 0.85);
}

/** Szacunek długości wypowiedzi, gdy nie ma jeszcze nagrania. */
export function szacujCzasLektora(tekst: string): number {
  const slowa = tekst.trim().split(/\s+/).filter(Boolean).length;
  if (slowa === 0) return 0;
  return slowa / SLOW_NA_SEKUNDE + 0.3;
}

/** Liczy przerwy dłuższe niż 0,25 s. Więcej niż 3 na 10 sekund znaczy, że tekst jest posiekany. */
export function przerwyWMowie(slowa: { start: number; koniec: number }[]): number {
  let ile = 0;
  for (let i = 1; i < slowa.length; i++) if (slowa[i].start - slowa[i - 1].koniec > 0.25) ile++;
  return ile;
}

export function czasSceny(scena: Scena): number {
  const mowa = scena.audio ? scena.audio.czas : szacujCzasLektora(scena.lektor);
  const min = Math.max(MIN_CZAS_SCENY, scena.minCzas ?? 0);
  return Math.max(min, mowa + PAUZA_PO_LEKTORZE);
}

export function klatkiSceny(scena: Scena): number {
  return Math.max(1, Math.round(czasSceny(scena) * FPS));
}

export function maPrzejscie(scena: Scena): boolean {
  return (scena.przejscie ?? "fade") !== "brak";
}

export function klatkiCalosci(scenariusz: Scenariusz): number {
  const sceny = scenariusz.sceny;
  if (sceny.length === 0) return FPS * 2;
  let suma = 0;
  sceny.forEach((s, i) => {
    suma += klatkiSceny(s);
    if (i < sceny.length - 1 && maPrzejscie(s)) suma -= PRZEJSCIE_KLATKI;
  });
  return Math.max(FPS, suma + Math.round(OGON_KONCOWY * FPS));
}

export function czasCalosci(scenariusz: Scenariusz): number {
  return klatkiCalosci(scenariusz) / FPS;
}

export function formatujCzas(sek: number): string {
  const m = Math.floor(sek / 60);
  const s = Math.round(sek % 60);
  return m > 0 ? `${m}:${String(s).padStart(2, "0")}` : `${s} s`;
}
