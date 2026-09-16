// Zapis i odczyt projektów oraz ustawień na dysku.
import fs from "node:fs";
import path from "node:path";
import type { Scenariusz, Scena } from "../src/typy";
import { hashTekstu } from "../src/hash";
export { hashTekstu };

export const KATALOG_GLOWNY = path.resolve(import.meta.dirname, "..");
export const KATALOG_PROJEKTOW = path.join(KATALOG_GLOWNY, "projekty");
export const KATALOG_DANYCH = path.join(KATALOG_GLOWNY, "dane");
const PLIK_USTAWIEN = path.join(KATALOG_DANYCH, "ustawienia.json");

export type Ustawienia = {
  elevenLabsApiKey?: string;
  voiceId?: string;
  voiceName?: string;
  model?: string;
  stabilnosc?: number;
  podobienstwo?: number;
  styl?: number;
};

fs.mkdirSync(KATALOG_PROJEKTOW, { recursive: true });
fs.mkdirSync(KATALOG_DANYCH, { recursive: true });

export function wczytajUstawienia(): Ustawienia {
  try {
    return JSON.parse(fs.readFileSync(PLIK_USTAWIEN, "utf8"));
  } catch {
    return {};
  }
}

export function zapiszUstawienia(u: Ustawienia) {
  fs.writeFileSync(PLIK_USTAWIEN, JSON.stringify(u, null, 2));
}

export function kluczApi(): string | undefined {
  return process.env.ELEVENLABS_API_KEY || wczytajUstawienia().elevenLabsApiKey;
}

export function slug(tekst: string): string {
  const mapa: Record<string, string> = { ą: "a", ć: "c", ę: "e", ł: "l", ń: "n", ó: "o", ś: "s", ź: "z", ż: "z" };
  return tekst
    .toLowerCase()
    .replace(/[ąćęłńóśźż]/g, (c) => mapa[c])
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60) || "rolka";
}

const POPRAWNY_ID = /^[a-z0-9][a-z0-9-]{0,79}$/;

/** Zwraca folder projektu. Odrzuca identyfikatory, które mogłyby wskazać poza folder projektów. */
export function katalogProjektu(id: string) {
  if (!POPRAWNY_ID.test(id)) throw new Error("Nieprawidłowa nazwa projektu.");
  const kat = path.resolve(KATALOG_PROJEKTOW, id);
  if (!kat.startsWith(path.resolve(KATALOG_PROJEKTOW) + path.sep)) throw new Error("Nieprawidłowa nazwa projektu.");
  return kat;
}

export function listaProjektow(): Scenariusz[] {
  if (!fs.existsSync(KATALOG_PROJEKTOW)) return [];
  return fs
    .readdirSync(KATALOG_PROJEKTOW)
    .filter((d) => POPRAWNY_ID.test(d) && fs.existsSync(path.join(KATALOG_PROJEKTOW, d, "scenariusz.json")))
    .map((d) => wczytajProjekt(d))
    .filter((p): p is Scenariusz => p !== null)
    .sort((a, b) => b.zmieniono.localeCompare(a.zmieniono));
}

export function wczytajProjekt(id: string): Scenariusz | null {
  if (!POPRAWNY_ID.test(id)) return null;
  const plik = path.join(katalogProjektu(id), "scenariusz.json");
  if (!fs.existsSync(plik)) return null;
  try {
    const s = JSON.parse(fs.readFileSync(plik, "utf8")) as Scenariusz;
    return uzupelnijStatus(s);
  } catch (e) {
    console.error(`Uszkodzony scenariusz ${id}:`, e);
    return null;
  }
}

export function zapiszProjekt(s: Scenariusz): Scenariusz {
  const kat = katalogProjektu(s.id);
  fs.mkdirSync(path.join(kat, "audio"), { recursive: true });
  s.zmieniono = new Date().toISOString();
  uzupelnijStatus(s);
  fs.writeFileSync(path.join(kat, "scenariusz.json"), JSON.stringify(s, null, 2));
  return s;
}

export function utworzProjekt(tytul: string, zrodlo?: string, docelowaDlugosc = 45): Scenariusz {
  let id = slug(tytul);
  let n = 2;
  while (fs.existsSync(katalogProjektu(id))) id = `${slug(tytul)}-${n++}`;
  const teraz = new Date().toISOString();
  return zapiszProjekt({
    id,
    tytul,
    zrodlo,
    docelowaDlugosc,
    status: "scenariusz",
    utworzono: teraz,
    zmieniono: teraz,
    napisy: true,
    sceny: [],
  });
}

export function audioAktualne(scena: Scena): boolean {
  return !!scena.audio && scena.audio.hash === hashTekstu(scena.lektor);
}

/** Najnowszy plik rolka*.mp4 w folderze projektu (każdy render tworzy osobny plik). */
export function najnowszyMp4(id: string): string | undefined {
  const kat = katalogProjektu(id);
  if (!fs.existsSync(kat)) return undefined;
  const pliki = fs
    .readdirSync(kat)
    .filter((f) => /^rolka.*\.mp4$/.test(f))
    .map((f) => ({ f, t: fs.statSync(path.join(kat, f)).mtimeMs }))
    .sort((a, b) => b.t - a.t);
  return pliki[0]?.f;
}

/** Status wynika ze stanu: wszystkie audio aktualne → "lektor"; jest też MP4 → "gotowe". */
function uzupelnijStatus(s: Scenariusz): Scenariusz {
  const mp4 = najnowszyMp4(s.id);
  const wszystkieAudio = s.sceny.length > 0 && s.sceny.every(audioAktualne);
  s.plikMp4 = mp4;
  s.status = mp4 && wszystkieAudio ? "gotowe" : wszystkieAudio ? "lektor" : "scenariusz";
  return s;
}
