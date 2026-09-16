// Format scenariusza rolki. Ten sam plik czyta dashboard, serwer i Remotion.

export type Slowo = {
  tekst: string;
  start: number; // sekundy od początku sceny
  koniec: number;
};

export type AudioSceny = {
  plik: string; // ścieżka względem folderu projektu, np. audio/s1.mp3
  czas: number; // długość w sekundach
  slowa: Slowo[];
  hash: string; // skrót tekstu lektora, dla którego wygenerowano audio
};

export type EfektAudio = {
  plik: string;
  hash: string;
};

export type Punkt = {
  ikona?: string;
  tekst: string;
  /** Wyróżnienie kafelka: czerwony błąd albo zielone powodzenie. */
  stan?: "blad" | "ok";
  /** Mała pieczątka przy kafelku, np. „error”. */
  etykieta?: string;
};

export type Ekran =
  | { typ: "tytul"; naglowek: string; akcent?: string; dopisek?: string; etykieta?: string }
  | {
      typ: "lista";
      naglowek?: string;
      punkty: Punkt[];
      /** Czym połączone są kafelki: kropkowaną linią, strzałką, albo niczym. */
      polaczenie?: "kropki" | "strzalka" | "brak";
      /** Czy kafelki mają cały czas delikatnie pulsować. */
      pulsujace?: boolean;
    }
  | { typ: "karta"; ikona?: string; etykieta?: string; naglowek: string; tekst?: string }
  | { typ: "liczba"; wartosc: number; prefiks?: string; sufiks?: string; podpis: string }
  | {
      typ: "porownanie";
      lewo: { naglowek: string; punkty: string[]; zle?: boolean };
      prawo: { naglowek: string; punkty: string[]; zle?: boolean };
    }
  | { typ: "cta"; naglowek: string; przycisk: string; dopisek?: string }
  | {
      typ: "3d";
      ksztalt: "kostki" | "kula" | "torus" | "pierscienie" | "kartki";
      naglowek: string;
      etykieta?: string;
      dopisek?: string;
    }
  | { typ: "kod"; tytul?: string; linie: string[]; naglowek?: string }
  | {
      typ: "telefon";
      naglowek?: string;
      etykieta?: string;
      tytulEkranu?: string;
      powiadomienie?: { tytul: string; tekst: string };
      wiersze?: { ikona?: string; tytul: string; podtytul?: string }[];
      przycisk?: string;
    }
  | {
      typ: "czat";
      naglowek?: string;
      etykieta?: string;
      rozmowca?: string;
      wiadomosci: { odNas?: boolean; tekst: string }[];
    }
  | {
      typ: "przegladarka";
      naglowek?: string;
      etykieta?: string;
      adres: string;
      tytulStrony: string;
      opis?: string;
      obrazTekst?: string;
      przycisk?: string;
    }
  | {
      typ: "formularz";
      naglowek?: string;
      etykieta?: string;
      tytul?: string;
      pola: { etykieta: string; wartosc: string }[];
      przycisk: string;
      potwierdzenie?: string;
      dopisek?: string;
    };

export type TypEkranu = Ekran["typ"];

/**
 * Wszystkie typy ekranów w jednym miejscu.
 * Każdy, kto sprawdza poprawność sceny, korzysta z tej listy, żeby się nie rozjechać.
 */
export const TYPY_EKRANOW = [
  "tytul",
  "lista",
  "karta",
  "liczba",
  "porownanie",
  "cta",
  "3d",
  "kod",
  "telefon",
  "czat",
  "przegladarka",
  "formularz",
] as const satisfies readonly TypEkranu[];

export function czyZnanyTyp(typ: unknown): typ is TypEkranu {
  return typeof typ === "string" && (TYPY_EKRANOW as readonly string[]).includes(typ);
}

export type Przejscie = "fade" | "slide" | "wipe" | "brak";

export type Scena = {
  id: string;
  lektor: string; // co mówi lektor
  opis?: string; // co widać na ekranie, ludzkim językiem (edytuje użytkownik, Claude zamienia na `ekran`)
  ekran: Ekran; // co widać (struktura techniczna)
  przejscie?: Przejscie; // przejście DO następnej sceny (domyślnie fade)
  efekt?: string; // opis efektu dźwiękowego do wygenerowania, np. "krótki whoosh"
  minCzas?: number; // minimalna długość sceny w sekundach
  audio?: AudioSceny;
  efektAudio?: EfektAudio;
};

export type StatusProjektu = "scenariusz" | "lektor" | "gotowe";

export type Scenariusz = {
  id: string;
  tytul: string;
  zrodlo?: string; // link lub opis pomysłu
  docelowaDlugosc: number; // sekundy
  status: StatusProjektu;
  utworzono: string;
  zmieniono: string;
  napisy: boolean;
  uwagi?: string; // uwagi użytkownika dla Claude
  sceny: Scena[];
  plikMp4?: string;
};

export type PropsRolki = {
  scenariusz: Scenariusz;
  bazaUrl: string; // skąd pobierać pliki audio, np. http://localhost:4545/projekty/moja-rolka
};
