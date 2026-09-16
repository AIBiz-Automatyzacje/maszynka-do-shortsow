// Krzywe ruchu i helpery animacji. Wszystko jest funkcją klatki, więc render jest powtarzalny.
import { interpolate } from "remotion";

/** Krzywe czasowe. Wejścia szybkie na starcie, wyjścia szybkie na końcu. */
export const E = {
  lin: (p: number) => p,
  outCubic: (p: number) => 1 - Math.pow(1 - p, 3),
  outQuint: (p: number) => 1 - Math.pow(1 - p, 5),
  outExpo: (p: number) => (p >= 1 ? 1 : 1 - Math.pow(2, -10 * p)),
  /** Lekkie przestrzelenie celu, daje sprężystość bez fizyki. */
  outBack: (p: number) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2);
  },
  inCubic: (p: number) => p * p * p,
  inQuart: (p: number) => p * p * p * p,
  inOutCubic: (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2),
};

export type Krzywa = (p: number) => number;

/** Postęp od 0 do 1 między dwiema klatkami, z krzywą. */
export function postep(frame: number, odKlatki: number, doKlatki: number, krzywa: Krzywa = E.outQuint): number {
  if (doKlatki <= odKlatki) return frame >= doKlatki ? 1 : 0;
  const p = Math.min(1, Math.max(0, (frame - odKlatki) / (doKlatki - odKlatki)));
  return krzywa(p);
}

/** Wartość przechodząca od a do b między klatkami. */
export function od(frame: number, odKlatki: number, doKlatki: number, a: number, b: number, krzywa: Krzywa = E.outQuint) {
  return interpolate(postep(frame, odKlatki, doKlatki, krzywa), [0, 1], [a, b]);
}

export type Styl = { opacity: number; transform: string };

/** Wjazd elementu: pojawia się i podnosi. Domyślnie 13 klatek, czyli 0,43 s. */
export function wjazd(frame: number, opoznienie = 0, dystans = 90, klatki = 13): Styl {
  const p = postep(frame, opoznienie, opoznienie + klatki, E.outQuint);
  const o = postep(frame, opoznienie, opoznienie + 6, E.lin);
  return { opacity: o, transform: `translateY(${dystans * (1 - p)}px)` };
}

/** Wjazd z boku z przechyłem 3D. Do kart i kafelków w serii. */
export function wjazdZBoku(frame: number, opoznienie = 0, zPrawej = true, klatki = 13): Styl {
  const p = postep(frame, opoznienie, opoznienie + klatki, E.outQuint);
  const o = postep(frame, opoznienie, opoznienie + 6, E.lin);
  const x = (zPrawej ? 1 : -1) * 620 * (1 - p);
  const ry = (zPrawej ? -1 : 1) * 12 * (1 - p);
  return { opacity: o, transform: `translateX(${x}px) rotateY(${ry}deg)` };
}

/** Wyskok z przestrzeleniem. Do pojedynczych mocnych elementów. */
export function pop(frame: number, opoznienie = 0, klatki = 11): Styl {
  const p = postep(frame, opoznienie, opoznienie + klatki, E.outBack);
  const o = postep(frame, opoznienie, opoznienie + 4, E.lin);
  return { opacity: o, transform: `scale(${0.6 + 0.4 * p})` };
}

/** Przybicie pieczątki: zjeżdża ze skalą i obraca się do pozycji. */
export function stempel(frame: number, opoznienie = 0, obrot = -3, klatki = 11): Styl {
  const p = postep(frame, opoznienie, opoznienie + klatki, E.outBack);
  const o = postep(frame, opoznienie, opoznienie + 4, E.lin);
  return { opacity: o, transform: `scale(${0.5 + 0.5 * p}) rotate(${obrot * (2 - p)}deg)` };
}

/**
 * Delikatne kołysanie. Dwie rozjechane częstotliwości, żeby ruch nie wyglądał mechanicznie.
 * Element żyjący na ekranie dłużej niż dwie sekundy musi mieć własne życie.
 */
export function sway(frame: number, fps: number, amplituda = 1.5, okres = 2.6, faza = 0): string {
  const f = (2 * Math.PI * (frame / fps)) / okres + faza;
  return `translateY(${0.8 * amplituda * Math.sin(f * 0.63)}px) rotateY(${amplituda * Math.sin(f)}deg)`;
}

/** Lekki puls skali, do przycisków i akcentów. */
export function puls(frame: number, fps: number, sila = 0.02, okres = 1.6): number {
  return 1 + sila * Math.sin((2 * Math.PI * (frame / fps)) / okres);
}

/**
 * Uderzenie kamery: szybkie zbliżenie i powolny powrót.
 * Suma wszystkich uderzeń dodaje się do skali kadru.
 */
export function punch(frame: number, fps: number, naKlatkach: number[], sila = 0.035): number {
  let suma = 0;
  const wejscie = Math.round(0.1 * fps);
  const wyjscie = Math.round(0.45 * fps);
  for (const k of naKlatkach) {
    if (frame < k) continue;
    const wzrost = postep(frame, k, k + wejscie, E.outCubic);
    const spadek = 1 - postep(frame, k + wejscie, k + wejscie + wyjscie, E.inOutCubic);
    suma += sila * wzrost * spadek;
  }
  return 1 + suma;
}

/** Ile klatek trwa sekunda ułamkowa. */
export const sek = (s: number, fps = 30) => Math.round(s * fps);
