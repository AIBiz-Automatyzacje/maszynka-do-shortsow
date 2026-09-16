import type { Scenariusz } from "../src/typy";

export const SERWER = "http://localhost:4545";

export type Status = {
  maKlucz: boolean;
  kluczZEnv: boolean;
  voiceId?: string;
  voiceName?: string;
  model: string;
  stabilnosc: number;
  podobienstwo: number;
  styl: number;
  katalogProjektow: string;
};

export type Glos = { id: string; nazwa: string; kategoria?: string; podglad?: string };

export type WpisGalerii = { projektId: string; tytul: string; plik: string; rozmiar: number; data: string };

export type Uwaga = { waga: "blad" | "ostrzezenie"; scena?: string; numer?: number; tekst: string };
export type Kontrola = {
  uwagi: Uwaga[];
  bledy: number;
  ostrzezenia: number;
  slowa: number;
  budzetSlow: number;
  czas: number;
  tempo: number;
};

export type StanPisania = { stan: "brak" | "pisze" | "gotowe" | "blad"; komunikat?: string };

export type StanRenderu = {
  stan: "czeka" | "przygotowanie" | "renderowanie" | "gotowe" | "blad";
  postep: number;
  komunikat?: string;
  plik?: string;
};

async function zapytaj<T>(sciezka: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${SERWER}${sciezka}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    });
  } catch {
    throw new Error("Nie mogę połączyć się z serwerem maszynki. Czy jest uruchomiony?");
  }
  const dane = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(dane?.blad ?? `Błąd ${res.status}`);
  return dane as T;
}

export const api = {
  status: () => zapytaj<Status>("/api/status"),
  zapiszUstawienia: (u: Partial<Status> & { elevenLabsApiKey?: string }) =>
    zapytaj<{ ok: true }>("/api/ustawienia", { method: "PUT", body: JSON.stringify(u) }),
  glosy: () => zapytaj<Glos[]>("/api/glosy"),

  projekty: () => zapytaj<Scenariusz[]>("/api/projekty"),
  projekt: (id: string) => zapytaj<Scenariusz>(`/api/projekty/${id}`),
  nowyProjekt: (tytul: string, zrodlo?: string, docelowaDlugosc?: number) =>
    zapytaj<Scenariusz>("/api/projekty", { method: "POST", body: JSON.stringify({ tytul, zrodlo, docelowaDlugosc }) }),
  zapiszProjekt: (s: Scenariusz) => zapytaj<Scenariusz>(`/api/projekty/${s.id}`, { method: "PUT", body: JSON.stringify(s) }),
  usunProjekt: (id: string) => zapytaj<{ ok: true }>(`/api/projekty/${id}`, { method: "DELETE" }),
  otworzFolder: (id: string) => zapytaj<{ ok: true }>(`/api/projekty/${id}/otworz-folder`, { method: "POST" }),

  lektorSceny: (id: string, scenaId: string) => zapytaj<Scenariusz>(`/api/projekty/${id}/lektor/${scenaId}`, { method: "POST" }),
  lektorWszystkich: (id: string, wszystkie = false) =>
    zapytaj<Scenariusz>(`/api/projekty/${id}/lektor`, { method: "POST", body: JSON.stringify({ wszystkie }) }),
  efektSceny: (id: string, scenaId: string) => zapytaj<Scenariusz>(`/api/projekty/${id}/efekt/${scenaId}`, { method: "POST", body: "{}" }),

  napiszScenariusz: (id: string, tryb: "nowy" | "poprawki") =>
    zapytaj<StanPisania>(`/api/projekty/${id}/scenariusz`, { method: "POST", body: JSON.stringify({ tryb }) }),
  poprawScene: (id: string, scenaId: string, opis: string) =>
    zapytaj<StanPisania>(`/api/projekty/${id}/scena/${scenaId}/popraw`, { method: "POST", body: JSON.stringify({ opis }) }),
  stanPisania: (id: string) => zapytaj<StanPisania>(`/api/projekty/${id}/scenariusz`),

  kontrola: (id: string) => zapytaj<Kontrola>(`/api/projekty/${id}/kontrola`),

  galeria: () => zapytaj<WpisGalerii[]>("/api/galeria"),
  usunRolke: (id: string, plik: string) => zapytaj<{ ok: true }>(`/api/projekty/${id}/rolki/${plik}`, { method: "DELETE" }),

  startRenderu: (id: string) => zapytaj<StanRenderu>(`/api/projekty/${id}/render`, { method: "POST" }),
  stanRenderu: (id: string) => zapytaj<StanRenderu>(`/api/projekty/${id}/render`),
};

export const urlPliku = (id: string, plik: string) => `${SERWER}/projekty/${id}/${plik}`;
