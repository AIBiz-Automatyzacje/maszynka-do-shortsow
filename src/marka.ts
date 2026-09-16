// Styl marki Akademii Automatyzacji przełożony na kadr pionowy.
// Proporcje ze strony przeskalowane około 2,6 raza: ramka 1 px daje 2 px, zaokrąglenie 14 px daje 38 px.
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadArchivo } from "@remotion/google-fonts/ArchivoBlack";
import { loadFont as loadCaveat } from "@remotion/google-fonts/Caveat";

const inter = loadInter("normal", {
  weights: ["400", "500", "600", "700", "800", "900"],
  subsets: ["latin", "latin-ext"],
});
const archivo = loadArchivo("normal", { weights: ["400"], subsets: ["latin", "latin-ext"] });
const caveat = loadCaveat("normal", { weights: ["500", "600", "700"], subsets: ["latin", "latin-ext"] });

export const CZCIONKA = {
  tekst: inter.fontFamily,
  naglowek: archivo.fontFamily,
  odreczna: caveat.fontFamily,
  kod: "Menlo, 'SF Mono', Consolas, monospace",
};

export const KOLOR = {
  paper: "#FAF8F4",
  paper2: "#F4F1EA",
  card: "#FFFFFF",
  ink: "#141414",
  inkSoft: "#3D3A34",
  muted: "#6E6A61",
  line: "#E5E1D8",
  lineStrong: "#D8D3C6",
  accent: "#E8590C",
  accentSoft: "#FBEADF",
  green: "#2F9E44",
  red: "#D93025",
};

// Kadr
export const SZEROKOSC = 1080;
export const WYSOKOSC = 1920;
export const FPS = 30;
export const SRODEK_X = SZEROKOSC / 2;

/**
 * Bezpieczne pole kadru. Górne 250 px i dolne 360 px zasłania interfejs
 * TikToka, Reels i Shorts, więc treść może żyć tylko między nimi.
 */
export const SAFE = { gora: 250, dol: 1560 };
export const MARGINES = 80;

// Kształty
export const PROMIEN = 38;
export const PROMIEN_MALY = 26;
export const RAMKA = 2;

/** Cień dwuwarstwowy: bliski styku i daleki od otoczenia. */
export const CIEN_KARTY = "0 3px 6px rgba(20,20,20,.05), 0 16px 48px rgba(20,20,20,.07)";
export const CIEN_UNIESIONY = "0 6px 10px rgba(20,20,20,.06), 0 36px 90px rgba(20,20,20,.12)";
/** Cień przesunięty bez rozmycia, w kolorze akcentu. Sygnatura marki na przyciskach. */
export const CIEN_NAKLEJKI = "8px 8px 0 rgba(232,89,12,.25)";

/** Skala pisma dla kadru 1080 px. */
export const PISMO = {
  liczba: 210,
  naglowekDuzy: 96,
  naglowek: 76,
  naglowekMaly: 62,
  cta: 64,
  chip: 52,
  tytulKarty: 48,
  tresc: 40,
  kicker: 36,
  meta: 32,
  kod: 32,
  drobne: 26,
};

/** Odstęp między osobnymi elementami sceny. Nic nie może się dotykać. */
export const ODSTEP = 60;
/** Zapas tekstu od krawędzi kafelka. */
export const ZAPAS_W_KAFELKU = 30;

// Tło
export const SIATKA_PX = 54;
export const SIATKA_DRYF_PX_S = 16;
