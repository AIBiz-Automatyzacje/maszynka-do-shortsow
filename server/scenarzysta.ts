// Pisanie scenariusza przez Claude Code uruchamiane w tle (bez klucza API — na koncie użytkownika).
import { execFile } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { czyZnanyTyp, TYPY_EKRANOW, type Ekran, type Scena, type Scenariusz } from "../src/typy";
import { hashTekstu } from "../src/hash";
import { opisEkranu } from "../src/opis";
import { KATALOG_DANYCH } from "./magazyn";
import { budzetSlow } from "../src/czas";
import { pobierzStrone } from "./pobieranie";

export type StanPisania = {
  stan: "pisze" | "gotowe" | "blad";
  komunikat?: string;
  start: number;
  koniec?: number;
};

const stany = new Map<string, StanPisania>();

export const stanPisania = (id: string) => stany.get(id);
export const trwaPisanie = (id: string) => stany.get(id)?.stan === "pisze";

const TYPY = TYPY_EKRANOW as readonly string[];

/** Znajduje program `claude` (Claude Code). */
function sciezkaClaude(): string {
  const kandydaci = [
    process.env.CLAUDE_BIN,
    path.join(os.homedir(), ".local", "bin", "claude"),
    "/opt/homebrew/bin/claude",
    "/usr/local/bin/claude",
  ].filter(Boolean) as string[];
  for (const k of kandydaci) if (fs.existsSync(k)) return k;
  return "claude";
}

/** Pobiera treść artykułu spod linku i zamienia HTML na czysty tekst. */
async function pobierzTresc(zrodlo: string): Promise<{ tekst: string; zLinku: boolean }> {
  const link = zrodlo.trim().match(/https?:\/\/\S+/)?.[0];
  if (!link) return { tekst: zrodlo, zLinku: false };
  let html = await pobierzStrone(link);
  html = html.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?<\/style>/gi, "").replace(/<nav[\s\S]*?<\/nav>/gi, "").replace(/<footer[\s\S]*?<\/footer>/gi, "");
  const glowna = html.match(/<(article|main)[\s\S]*?<\/\1>/i)?.[0] ?? html;
  const tekst = glowna
    .replace(/<(br|p|div|li|h[1-6]|tr)[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n+/g, "\n")
    .trim();
  const reszta = zrodlo.replace(link, "").trim();
  return { tekst: (reszta ? `Uwagi autora: ${reszta}\n\n` : "") + tekst.slice(0, 14000), zLinku: true };
}

/** Pełna lista tego, co silnik potrafi narysować. Claude nie może obiecać niczego spoza niej. */
const SPECYFIKACJA_EKRANOW = `
{ "typ": "tytul", "naglowek": "...", "akcent": "dosłowny fragment nagłówka do zakreślenia pomarańczem", "etykieta": "krótki podpis nad tytułem", "dopisek": "odręczna uwaga" }
{ "typ": "lista", "naglowek": "krótki", "polaczenie": "kropki|strzalka|brak", "pulsujace": true, "punkty": [{ "ikona": "⚡", "tekst": "...", "stan": "blad|ok", "etykieta": "error" }] }
{ "typ": "karta", "ikona": "💡", "etykieta": "pieczątka", "naglowek": "...", "tekst": "zdanie rozwinięcia" }
{ "typ": "liczba", "wartosc": 80, "prefiks": "", "sufiks": "%", "podpis": "czego dotyczy liczba" }
{ "typ": "porownanie", "lewo": { "naglowek": "Bez tego", "punkty": ["..."] }, "prawo": { "naglowek": "Z tym", "punkty": ["..."] } }
{ "typ": "3d", "ksztalt": "kostki|kula|torus|pierscienie|kartki", "naglowek": "...", "etykieta": "...", "dopisek": "..." }
{ "typ": "kod", "tytul": "terminal", "naglowek": "...", "linie": ["...", "..."] }
{ "typ": "cta", "naglowek": "...", "przycisk": "akademiaautomatyzacji.com", "dopisek": "link w opisie" }
{ "typ": "telefon", "naglowek": "...", "tytulEkranu": "...", "powiadomienie": { "tytul": "...", "tekst": "..." }, "wiersze": [{ "ikona": "📩", "tytul": "...", "podtytul": "..." }], "przycisk": "..." }
{ "typ": "czat", "naglowek": "...", "rozmowca": "Klient", "wiadomosci": [{ "tekst": "..." }, { "odNas": true, "tekst": "..." }] }
{ "typ": "przegladarka", "naglowek": "...", "adres": "akademiaautomatyzacji.com", "tytulStrony": "...", "opis": "...", "obrazTekst": "podpis w miejscu grafiki", "przycisk": "..." }
{ "typ": "formularz", "naglowek": "...", "tytul": "...", "pola": [{ "etykieta": "E-mail", "wartosc": "anna@firma.pl" }], "przycisk": "Zapisz się", "potwierdzenie": "Miejsce zarezerwowane" }

Silnik robi sam, bez podawania w JSON: wjazdy elementów w rytm lektora, kołysanie kart, uderzenie kamery na wejściu sceny, pisanie tekstu litera po literze w terminalu i formularzu, kursor klikający przycisk w formularzu, licznik nabijający wielką liczbę, zakreślanie pola "akcent" pomarańczem.
Silnik NIE potrafi: dowolnych strzałek między elementami (jedynie "polaczenie" w liście), obracania pojedynczych kafelków, wykresów, map, zdjęć, własnych kolorów poza stanem "blad" i "ok", tekstu pod kątem.`;

function zasady(dlugosc: number) {
  const slowa = budzetSlow(dlugosc);
  const sceny = Math.max(3, Math.min(12, Math.round(dlugosc / 8)));
  return `
Piszesz scenariusz pionowej rolki (Reels, TikTok, YouTube Shorts) dla marki Akademia Automatyzacji: kursy Claude Code, n8n i Make oraz społeczność. Odbiorca to osoba nietechniczna albo półtechniczna, która chce automatyzować swoją pracę.

BUDŻET (trzymaj się ściśle)
Długość docelowa ${dlugosc} s. Łącznie NIE WIĘCEJ niż ${slowa} słów lektora — policz je. Scen: ${sceny} (±1). Lepiej krócej niż dłużej; rolka dłuższa od celu to błąd.

STRUKTURA (w tej kolejności)
1. HAK, 1–2 zdania. Temat musi paść w pierwszych dwóch sekundach. Zbuduj kontrast: co widz dziś myśli (A) kontra jak jest naprawdę (B). Zanim napiszesz hak, ustal sobie A i B; jeśli nie umiesz ich nazwać, hak nie ma silnika.
2. SETUP, 2–3 zdania. Kto i jaki problem. Konkret zamiast ogólnika: czas, miejsce, bohater w działaniu.
3. ROZWINIĘCIE, największa część. Mechanizm krok po kroku. Musi paść co najmniej jeden zwrot „ale". Sprawdź spójniki: między zdaniami ma pasować „ale" albo „dlatego", nigdy „i potem".
4. PUENTA. Domknięcie obietnicy z haka. Najważniejsze zdanie postaw po najdłuższym zdaniu.
5. SZCZERA UWAGA, 1 zdanie. Koszt, ograniczenie albo czego to nie załatwia. Obowiązkowe.
6. ZAKOŃCZENIE, 1–2 zdania. Jedno zadanie dla widza. Zero pożegnań. Ostatnie zdanie ma płynnie przechodzić w hak, żeby rolka dobrze się zapętlała.

JAK PISZE KACPER (ton głosu marki)
- Mówisz wprost do jednej osoby. Przy instrukcji „Wy" (Wam, Wasz), przy korzyści „Ty". Czas teraźniejszy, strona czynna.
- Naturalne zwroty: „No i teraz tak", „I już tłumaczę dlaczego", „Zaraz Wam pokażę", „Czyli lecimy dalej", „I to tyle", „No i super".
- Słowo „sobie" przy czasownikach: „przejdźmy sobie", „zapiszemy sobie".
- Nowy termin tłumacz od razu przez „czyli" albo „to po prostu…", z jedną metaforą z biura albo z domu.
- Zdrobnienia są mile widziane: apka, prompcik, raporcik.
- Mów też o własnych błędach i o kosztach. Szczerość buduje zaufanie.

JAK NIE PISAĆ
- Zero słów: szok, rewolucja, gamechanger, przełom. Zero wykrzykników w seriach.
- Zero presji czasowej i sztucznego niedoboru.
- Zero długich myślników. Używaj kropki, przecinka, dwukropka albo krótkiego myślnika.
- Zero korpomowy i strony biernej. Zero ramy kursowej („witajcie w kolejnej lekcji").
- Zero odwołań do tego, czego nie widać („tutaj po lewej").
- Liczby w mowie lektora zapisuj słownie („ponad tysiąc dwieście"), na ekranie mogą być cyframi.

RYTM WYPOWIEDZI (od tego zależy, czy lektor brzmi jak człowiek)
- Najwyżej jedna trzecia zdań może być krótsza niż sześć słów. Seria krótkich zdań brzmi jak robot.
- Mieszaj długości. Po długim zdaniu postaw krótkie, i to jest wtedy uderzenie.
- Interpunkcja steruje intonacją: znak zapytania zawiesza głos, kropka resetuje, wielokropek robi pauzę.
- Na scenę 10–25 słów. Jedna myśl na scenę.

CO WIDAĆ NA EKRANIE
- Tekst na ekranie to skrót przekazu, nie zapis tego, co mówi lektor. Ma być krótszy i hasłowy.
- Na ekranie 5–9 słów. Nigdy całe zdanie lektora.
- Mieszaj typy scen. Nie stawiaj dwóch takich samych obok siebie.
- Liczby pokazuj typem „liczba". Kontrast typem „porownanie". Wyliczenia typem „lista" (3–4 krótkie punkty). Jedną myśl typem „karta".
- Makiety pokazują rzecz w działaniu, więc używaj ich zamiast opisywania słowami: „telefon" gdy mowa o powiadomieniu albo aplikacji, „czat" gdy ktoś pisze wiadomość, „przegladarka" gdy odsyłasz do artykułu albo strony, „formularz" gdy chodzi o zapis albo wypełnianie danych. Najwyżej dwie makiety w rolce.
- Scena „przegladarka" z przyciskiem świetnie działa tuż przed zakończeniem, gdy odsyłasz do wpisu na blogu.
- Wiadomości na czacie: maks. cztery, każda do 70 znaków. Pola formularza: maks. trzy. Wiersze na telefonie: maks. cztery.
- W liście kafelków możesz oznaczyć kafelek jako błąd ("stan": "blad", czerwony) albo powodzenie ("stan": "ok", zielony) i dodać pieczątkę ("etykieta": "error"). Kafelki łączy się strzałką ("polaczenie": "strzalka") i można kazać im pulsować ("pulsujace": true).
- Najwyżej jedna scena „3d" i jedna „kod" w całej rolce. „kod" tylko wtedy, gdy naprawdę chodzi o komendę albo prompt; linie po maksymalnie 38 znaków, najwyżej 4 linie.
- Scena 1 to typ „tytul" z polem „akcent" będącym dosłownym fragmentem pola „naglowek".
- Ostatnia scena to zawsze typ „cta" z przyciskiem „akademiaautomatyzacji.com".
- W polu „ikona" jedno proste emoji.

TYPY EKRANÓW (pole "ekran")${SPECYFIKACJA_EKRANOW}

KAŻDA SCENA
{ "id": "s1", "lektor": "co mówi lektor", "opis": "jedno zdanie po polsku, co widać na ekranie, zrozumiałe dla laika", "ekran": {...}, "przejscie": "fade|slide|wipe|brak", "efekt": "krótki opis dźwięku po angielsku, opcjonalnie" }

Pole "opis" musi zgadzać się z polem "ekran" i jest obowiązkowe.
Efektów dźwiękowych dawaj najwyżej co drugiej scenie. Sprawdzone opisy: "short fast airy whoosh, clean, no reverb tail", "soft cartoon pop, small UI card appearing", "single soft mouse click, UI tick", "short bright success chime", "fast mechanical keyboard typing burst".

ODPOWIEDZ WYŁĄCZNIE poprawnym JSON: { "tytul": "krótki tytuł roboczy", "sceny": [ ... ] }. Żadnego tekstu przed ani po. Bez markdownu.`;
}

function wyciagnijJson(tekst: string): unknown {
  const bezFence = tekst.replace(/```(?:json)?/gi, "").trim();
  const start = bezFence.indexOf("{");
  const koniec = bezFence.lastIndexOf("}");
  if (start < 0 || koniec < 0) throw new Error("Claude nie zwrócił JSON.");
  return JSON.parse(bezFence.slice(start, koniec + 1));
}

function sprawdzSceny(dane: unknown): { tytul?: string; sceny: Scena[]; naprawione: number[] } {
  const d = dane as { tytul?: string; sceny?: unknown };
  if (!d || !Array.isArray(d.sceny) || d.sceny.length === 0) throw new Error("Odpowiedź nie zawiera scen.");
  const naprawione: number[] = [];
  const sceny: Scena[] = d.sceny.map((s, i) => {
    const sc = s as Partial<Scena>;
    const lektor = String(sc.lektor ?? "").trim();
    let ekran = sc.ekran;
    // Pojedyncza scena z nieznanym typem nie może przekreślić całego scenariusza.
    // Zamieniamy ją na kartę i mówimy o tym w podsumowaniu.
    if (!ekran || typeof ekran !== "object" || !czyZnanyTyp((ekran as { typ?: unknown }).typ)) {
      naprawione.push(i + 1);
      ekran = zapasowaKarta(ekran, sc.opis, lektor);
    }
    return {
      id: typeof sc.id === "string" && /^[a-z0-9-]+$/i.test(sc.id) ? sc.id : `s${i + 1}`,
      lektor,
      opis: typeof sc.opis === "string" && sc.opis.trim() ? sc.opis.trim() : opisEkranu(ekran),
      ekran,
      przejscie: ["fade", "slide", "wipe", "brak"].includes(sc.przejscie as string) ? sc.przejscie : undefined,
      efekt: typeof sc.efekt === "string" ? sc.efekt : undefined,
    };
  });
  // Unikalne id
  const uzyte = new Set<string>();
  sceny.forEach((s, i) => {
    if (uzyte.has(s.id)) s.id = `s${i + 1}-${Math.random().toString(36).slice(2, 5)}`;
    uzyte.add(s.id);
  });
  return { tytul: typeof d.tytul === "string" ? d.tytul : undefined, sceny, naprawione };
}

/** Ratunkowa karta z treści, którą udało się odczytać z uszkodzonej sceny. */
function zapasowaKarta(ekran: unknown, opis: string | undefined, lektor: string): Ekran {
  const e = (ekran ?? {}) as Record<string, unknown>;
  const tekstem = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : undefined);
  const naglowek =
    tekstem(e.naglowek) ?? tekstem(e.tytul) ?? tekstem(e.tytulStrony) ?? tekstem(opis)?.slice(0, 60) ?? lektor.split(/[.!?]/)[0].slice(0, 60) ?? "Do uzupełnienia";
  return { typ: "karta", naglowek, tekst: tekstem(e.tekst) ?? tekstem(e.opis) ?? undefined, ikona: "💡" };
}

function uruchomClaude(prompt: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const cwd = path.join(KATALOG_DANYCH, "claude-cwd");
    fs.mkdirSync(cwd, { recursive: true });
    const dziecko = execFile(
      sciezkaClaude(),
      ["-p", "--model", "claude-fable-5-1", "--output-format", "json", "--max-turns", "1", "--tools", ""],
      { cwd, maxBuffer: 20 * 1024 * 1024, timeout: 240000, env: { ...process.env, CLAUDECODE: undefined } },
      (err, stdout, stderr) => {
        if (err) {
          const opis = stderr?.toString().trim() || err.message;
          if (/not logged in|login|authenticate/i.test(opis)) return reject(new Error("Claude Code nie jest zalogowane. Otwórz Claude Code i zaloguj się."));
          return reject(new Error(`Claude Code zwróciło błąd: ${opis.slice(0, 400)}`));
        }
        try {
          const j = JSON.parse(stdout.toString()) as { result?: string; is_error?: boolean };
          if (j.is_error) return reject(new Error(`Claude: ${j.result ?? "nieznany błąd"}`));
          resolve(j.result ?? "");
        } catch {
          resolve(stdout.toString());
        }
      },
    );
    dziecko.stdin?.end(prompt);
  });
}

/** Pisze nowy scenariusz (tryb "nowy") albo poprawia istniejący według pola `uwagi` (tryb "poprawki"). */
export async function napiszScenariusz(
  projekt: Scenariusz,
  tryb: "nowy" | "poprawki",
  zapisz: (p: Scenariusz) => Scenariusz,
): Promise<void> {
  const stan: StanPisania = { stan: "pisze", start: Date.now(), komunikat: tryb === "nowy" ? "Czytam źródło…" : "Claude czyta Twoje uwagi…" };
  stany.set(projekt.id, stan);
  try {
    let prompt = zasady(projekt.docelowaDlugosc) + "\n\n";
    if (tryb === "nowy") {
      if (!projekt.zrodlo?.trim()) throw new Error("Podaj link albo opis pomysłu w polu Źródło.");
      const { tekst, zLinku } = await pobierzTresc(projekt.zrodlo);
      if (!tekst.trim()) throw new Error("Nie udało się odczytać treści źródła.");
      stan.komunikat = "Claude pisze scenariusz…";
      prompt += zLinku ? `TREŚĆ ARTYKUŁU (źródło rolki):\n${tekst}` : `POMYSŁ NA ROLKĘ OD AUTORA:\n${tekst}`;
      prompt += `\n\nTytuł roboczy projektu: ${projekt.tytul}`;
    } else {
      if (!projekt.uwagi?.trim()) throw new Error("Pole „Uwagi dla Claude” jest puste.");
      if (!projekt.sceny.length) throw new Error("Nie ma jeszcze scen do poprawienia. Najpierw napisz scenariusz.");
      stan.komunikat = "Claude poprawia scenariusz…";
      const sceny = projekt.sceny.map(({ audio, efektAudio, ...s }) => ({ ...s, opis: s.opis ?? opisEkranu(s.ekran) }));
      prompt += `OBECNY SCENARIUSZ:\n${JSON.stringify({ tytul: projekt.tytul, sceny }, null, 1)}\n\nUWAGI AUTORA DO WPROWADZENIA:\n${projekt.uwagi}\n\nWprowadź uwagi. Sceny, których uwagi nie dotyczą, zostaw DOSŁOWNIE bez zmian (ten sam id, ten sam tekst lektora), żeby nie trzeba było nagrywać lektora od nowa. Zwróć cały scenariusz.`;
      if (projekt.zrodlo) prompt += `\n\n(Źródło rolki: ${projekt.zrodlo})`;
    }

    const odpowiedz = await uruchomClaude(prompt);
    const { tytul, sceny, naprawione } = sprawdzSceny(wyciagnijJson(odpowiedz));

    // Zachowaj audio dla scen, których lektor się nie zmienił.
    for (const s of sceny) {
      const stara = projekt.sceny.find((x) => x.id === s.id);
      if (stara?.audio && stara.audio.hash === hashTekstu(s.lektor)) s.audio = stara.audio;
      if (stara?.efektAudio && stara.efekt === s.efekt) s.efektAudio = stara.efektAudio;
    }
    projekt.sceny = sceny;
    if (tryb === "nowy" && tytul && /^nowa rolka$|^rolka$/i.test(projekt.tytul.trim())) projekt.tytul = tytul;
    if (tryb === "poprawki") projekt.uwagi = "";
    zapisz(projekt);

    stan.stan = "gotowe";
    stan.koniec = Date.now();
    stan.komunikat =
      `Gotowe: ${sceny.length} scen w ${Math.round((stan.koniec - stan.start) / 1000)} s` +
      (naprawione.length ? `. Sceny ${naprawione.join(", ")} wymagają poprawienia, bo Claude użył nieznanego układu.` : "");
  } catch (e) {
    stan.stan = "blad";
    stan.koniec = Date.now();
    stan.komunikat = e instanceof Error ? e.message : String(e);
    console.error(`Błąd pisania scenariusza ${projekt.id}:`, e);
  }
}

/** Przebudowuje ekran jednej sceny na podstawie zmienionego opisu (lektor zostaje bez zmian). */
export async function poprawScene(projekt: Scenariusz, scenaId: string, zapisz: (p: Scenariusz) => Scenariusz): Promise<void> {
  const numer = projekt.sceny.findIndex((s) => s.id === scenaId) + 1;
  const stan: StanPisania = { stan: "pisze", start: Date.now(), komunikat: `Claude przebudowuje scenę ${numer}…` };
  stany.set(projekt.id, stan);
  try {
    const scena = projekt.sceny.find((s) => s.id === scenaId);
    if (!scena) throw new Error("Nie ma takiej sceny.");
    if (!scena.opis?.trim()) throw new Error("Opis sceny jest pusty.");
    const prompt = `Przebudowujesz JEDNĄ scenę pionowej rolki dla marki Akademia Automatyzacji (kadr 1080x1920).

ZADANIE: scena numer ${numer} z ${projekt.sceny.length}. Tekst lektora zostaje DOSŁOWNIE taki sam, zmieniasz wyłącznie to, co widać na ekranie.

LEKTOR TEJ SCENY: ${scena.lektor}

CZEGO CHCE AUTOR: ${scena.opis}

OBECNY EKRAN: ${JSON.stringify(scena.ekran)}

DOSTĘPNE UKŁADY I WSZYSTKIE ICH POLA${SPECYFIKACJA_EKRANOW}

ZASADY
- Wybierz układ, który najwierniej odda prośbę autora. Prośba o czerwone wyróżnienie błędu to lista z "stan": "blad" i pieczątką "etykieta". Prośba o strzałki to "polaczenie": "strzalka". Prośba o pulsowanie to "pulsujace": true.
- Używaj wyłącznie pól z listy powyżej. Nie wymyślaj nowych pól ani nowych typów.
- Pole "opis" musi opisywać DOKŁADNIE to, co narysuje silnik z Twojego JSON-a. Nie obiecuj efektów, których nie ma w polach, bo autor przeczyta co innego, niż zobaczy.
- Jeśli prośba jest w części niewykonalna, zrób najbliższą możliwą wersję i dopisz w polu "opis", czego nie dało się zrobić.
- Na ekranie 5–9 słów w elemencie. Bez długich myślników.

ODPOWIEDZ WYŁĄCZNIE JSON: { "opis": "jedno zdanie o tym, co widać", "ekran": {...} }`;

    const odp = wyciagnijJson(await uruchomClaude(prompt)) as { opis?: string; ekran?: Scena["ekran"] };
    if (!odp.ekran || !czyZnanyTyp(odp.ekran.typ)) {
      throw new Error(`Claude zwrócił nieznany układ ekranu. Dozwolone: ${TYPY.join(", ")}.`);
    }
    scena.ekran = odp.ekran;
    scena.opis = typeof odp.opis === "string" && odp.opis.trim() ? odp.opis.trim() : opisEkranu(odp.ekran);
    zapisz(projekt);
    stan.stan = "gotowe";
    stan.koniec = Date.now();
    stan.komunikat = `Scena ${numer} przebudowana.`;
  } catch (e) {
    stan.stan = "blad";
    stan.koniec = Date.now();
    stan.komunikat = e instanceof Error ? e.message : String(e);
  }
}
