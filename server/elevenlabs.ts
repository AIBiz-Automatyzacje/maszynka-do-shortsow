// Rozmowa z ElevenLabs: lektor z czasami słów, efekty dźwiękowe, lista głosów.
import type { Slowo } from "../src/typy";
import { fonetyzuj, type Fragment } from "./fonetyka";

const BAZA = "https://api.elevenlabs.io/v1";

export type Glos = { id: string; nazwa: string; kategoria?: string; podglad?: string };

async function sprawdz(res: Response, co: string) {
  if (res.ok) return;
  let szczegoly = "";
  try {
    const j = await res.json();
    szczegoly = j?.detail?.message || j?.detail?.status || JSON.stringify(j);
  } catch {
    szczegoly = await res.text().catch(() => "");
  }
  if (res.status === 401) throw new Error("ElevenLabs odrzucił klucz API. Sprawdź klucz w ustawieniach.");
  if (res.status === 402 || /quota/i.test(szczegoly)) throw new Error("Skończyły się znaki w Twoim planie ElevenLabs.");
  throw new Error(`${co} nie powiodło się (${res.status}): ${szczegoly}`);
}

export async function listaGlosow(klucz: string): Promise<Glos[]> {
  const res = await fetch(`${BAZA}/voices`, { headers: { "xi-api-key": klucz } });
  await sprawdz(res, "Pobranie głosów");
  const j = (await res.json()) as { voices: { voice_id: string; name: string; category?: string; preview_url?: string }[] };
  const kolejnosc = (k?: string) => (k === "cloned" ? 0 : k === "professional" ? 1 : k === "generated" ? 2 : 3);
  return j.voices
    .map((v) => ({ id: v.voice_id, nazwa: v.name, kategoria: v.category, podglad: v.preview_url }))
    .sort((a, b) => kolejnosc(a.kategoria) - kolejnosc(b.kategoria) || a.nazwa.localeCompare(b.nazwa));
}

export type WynikLektora = { audio: Buffer; slowa: Slowo[]; czas: number };

/** Generuje mowę i zwraca audio MP3 wraz z czasem każdego słowa. */
export async function generujLektora(opcje: {
  klucz: string;
  voiceId: string;
  tekst: string;
  model?: string;
  stabilnosc?: number;
  podobienstwo?: number;
  styl?: number;
}): Promise<WynikLektora> {
  // Lektor czyta zapis fonetyczny, napisy pokażą oryginał.
  const { dlaLektora, fragmenty } = fonetyzuj(opcje.tekst);
  const res = await fetch(`${BAZA}/text-to-speech/${opcje.voiceId}/with-timestamps?output_format=mp3_44100_128`, {
    method: "POST",
    headers: { "xi-api-key": opcje.klucz, "Content-Type": "application/json" },
    body: JSON.stringify({
      text: dlaLektora,
      model_id: opcje.model ?? "eleven_multilingual_v2",
      language_code: opcje.model?.startsWith("eleven_v3") ? undefined : "pl",
      voice_settings: {
        stability: opcje.stabilnosc ?? 0.5,
        similarity_boost: opcje.podobienstwo ?? 0.8,
        style: opcje.styl ?? 0.2,
        use_speaker_boost: true,
      },
    }),
  });
  await sprawdz(res, "Generowanie lektora");
  const j = (await res.json()) as {
    audio_base64: string;
    alignment: { characters: string[]; character_start_times_seconds: number[]; character_end_times_seconds: number[] } | null;
    normalized_alignment: { characters: string[]; character_start_times_seconds: number[]; character_end_times_seconds: number[] } | null;
  };
  const audio = Buffer.from(j.audio_base64, "base64");
  const al = j.alignment ?? j.normalized_alignment;
  const wymowione = al ? znakiNaSlowa(al.characters, al.character_start_times_seconds, al.character_end_times_seconds) : [];
  const slowa = przypiszDoOryginalu(wymowione, fragmenty);
  const czas = slowa.length ? slowa[slowa.length - 1].koniec : szacujCzasZMp3(audio);
  return { audio, slowa, czas };
}

function znakiNaSlowa(znaki: string[], starty: number[], konce: number[]): Slowo[] {
  const slowa: Slowo[] = [];
  let biezace = "";
  let start = 0;
  let koniec = 0;
  znaki.forEach((z, i) => {
    if (/\s/.test(z)) {
      if (biezace) slowa.push({ tekst: biezace, start, koniec });
      biezace = "";
    } else {
      if (!biezace) start = starty[i];
      biezace += z;
      koniec = konce[i];
    }
  });
  if (biezace) slowa.push({ tekst: biezace, start, koniec });
  return slowa.map((s) => ({ ...s, start: +s.start.toFixed(3), koniec: +s.koniec.toFixed(3) }));
}

/** Przybliżona długość MP3 128 kb/s, gdy brakuje czasów. */
function szacujCzasZMp3(buf: Buffer): number {
  return +(buf.length / 16000).toFixed(2);
}

/** Generuje krótki efekt dźwiękowy z opisu tekstowego. */
export async function generujEfekt(klucz: string, opis: string, sekundy = 1.5): Promise<Buffer> {
  const res = await fetch(`${BAZA}/sound-generation`, {
    method: "POST",
    headers: { "xi-api-key": klucz, "Content-Type": "application/json" },
    body: JSON.stringify({ text: opis, duration_seconds: Math.min(22, Math.max(0.5, sekundy)), prompt_influence: 0.4 }),
  });
  await sprawdz(res, "Generowanie efektu");
  return Buffer.from(await res.arrayBuffer());
}

/**
 * Przypisuje czasy zmierzone na zapisie fonetycznym do oryginalnych słów.
 * Przykład: „ej aj Akt" (3 słowa) wraca jako „AI Act" (2 słowa) z tym samym czasem.
 */
function przypiszDoOryginalu(wymowione: Slowo[], fragmenty: Fragment[]): Slowo[] {
  const zmienione = fragmenty.some((f) => f.oryginal !== f.fonetyka);
  if (!zmienione || wymowione.length === 0) return wymowione;

  const slowaZ = (t: string) => t.trim().split(/\s+/).filter(Boolean);
  const wynik: Slowo[] = [];
  let i = 0; // pozycja w liście wymówionych słów

  for (const f of fragmenty) {
    const oryginalne = slowaZ(f.oryginal);
    const fonetyczne = slowaZ(f.fonetyka);
    if (oryginalne.length === 0) continue;

    if (f.oryginal === f.fonetyka) {
      // Fragment bez podmiany: słowa odpowiadają sobie jeden do jednego.
      for (const slowo of oryginalne) {
        const w = wymowione[i++];
        if (!w) return wynik.length ? wynik : wymowione;
        wynik.push({ ...w, tekst: slowo });
      }
      continue;
    }

    // Fragment podmieniony: bierzemy czas całej grupy i dzielimy go między oryginalne słowa.
    const grupa = wymowione.slice(i, i + fonetyczne.length);
    i += fonetyczne.length;
    if (grupa.length === 0) return wynik.length ? wynik : wymowione;
    const start = grupa[0].start;
    const koniec = grupa[grupa.length - 1].koniec;
    const znakiRazem = oryginalne.reduce((n, s) => n + s.length, 0) || 1;
    let kursor = start;
    oryginalne.forEach((slowo, n) => {
      const udzial = (koniec - start) * (slowo.length / znakiRazem);
      const doKiedy = n === oryginalne.length - 1 ? koniec : kursor + udzial;
      wynik.push({ tekst: slowo, start: +kursor.toFixed(3), koniec: +doKiedy.toFixed(3) });
      kursor = doKiedy;
    });
  }

  // Gdyby coś się rozjechało, zostaw resztę bez zmian.
  if (i < wymowione.length) wynik.push(...wymowione.slice(i));
  return wynik;
}
