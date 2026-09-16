// Zapis fonetyczny anglicyzmów dla lektora ElevenLabs.
// Lektor czyta zapis fonetyczny, a napisy pokazują oryginalny tekst.

/** Pary: co napisane → jak przeczytać. Kolejność ma znaczenie (dłuższe frazy najpierw). */
const SLOWNIK: [RegExp, string][] = [
  // Frazy złożone przed pojedynczymi słowami
  [/\bAI Act\b/g, "ej aj Akt"],
  [/\bClaude Code\b/gi, "Klod Kod"],
  [/\bCLAUDE\.md\b/g, "Klod em de"],
  [/\bMailerLite\b/gi, "Mejler Lajt"],
  [/\bGoogle Sheets\b/gi, "Gugl Szits"],
  [/\bGoogle Drive\b/gi, "Gugl Drajw"],
  [/\bno-code\b/gi, "noł kod"],
  [/\blow-code\b/gi, "loł kod"],
  [/\bvibe coding\b/gi, "wajb koding"],
  [/\bprompt engineering\b/gi, "prompt endżinering"],

  // Marki i narzędzia
  [/\bn8n\b/gi, "en osiem en"],
  [/\bMake\b/g, "Mejk"],
  [/\bZapier\b/gi, "Zapjer"],
  [/\bAirtable\b/gi, "Erjtejbl"],
  [/\bNotion\b/gi, "Nołszyn"],
  [/\bSlack\b/gi, "Slek"],
  [/\bLinkedIn\b/gi, "linkdin"],
  [/\bAnthropic\b/gi, "Antropik"],
  [/\bOpenAI\b/gi, "Ołpen ej aj"],
  [/\bChatGPT\b/gi, "Czat dżi pi ti"],
  [/\bGemini\b/gi, "Dżemini"],
  [/\bFigma\b/gi, "Figma"],
  [/\bSupabase\b/gi, "Supabejs"],
  [/\bGitHub\b/gi, "Github"],
  [/\bCursor\b/gi, "Kursor"],

  // Skróty czytane literami
  [/\bAI\b/g, "ej aj"],
  [/\bAPI\b/g, "ej pi aj"],
  [/\bMCP\b/g, "em ce pe"],
  [/\bMVP\b/g, "em wi pi"],
  [/\bCRM\b/g, "ce er em"],
  [/\bSaaS\b/g, "sas"],
  [/\bUI\b/g, "u aj"],
  [/\bUX\b/g, "u iks"],
  [/\bPDF\b/g, "pe de ef"],
  [/\bCSV\b/g, "ce es wu"],
  [/\bLLM\b/g, "el el em"],
  [/\bRAG\b/g, "rag"],

  // Pojęcia techniczne
  [/\bwebhook(\w*)\b/gi, "łebhuk$1"],
  [/\bcheckbox(\w*)\b/gi, "czekboks$1"],
  [/\btimestamp(\w*)\b/gi, "tajmstamp$1"],
  [/\bcache'(\w+)\b/gi, "kesz$1"],
  [/\bcaching\b/gi, "keszing"],
  [/\bcache\b/gi, "kesz"],
  [/\bworkflow(\w*)\b/gi, "łorkfloł$1"],
  [/\btrigger(\w*)\b/gi, "trigger$1"],
  [/\bdeploy(\w*)\b/gi, "diploj$1"],
  [/\bframework(\w*)\b/gi, "frejmłork$1"],
  [/\bbackend\b/gi, "bekend"],
  [/\bfrontend\b/gi, "frontend"],
  [/\bdashboard(\w*)\b/gi, "daszbord$1"],
  [/\bcontent\b/gi, "kontent"],
  [/\bengagement\b/gi, "engejdżment"],
  [/\bshort(s|y|ach|ami|ów)?\b/gi, "szort$1"],
  [/\breel(s|e|ach|ami|ów)?\b/gi, "ril$1"],

  // Komendy ze znakiem / — czytane bez ukośnika
  [/\/(context|clear|compact|rewind|resume|rename|model|effort)\b/gi, "$1"],
  [/\bcontext\b/gi, "kontekst"],
  [/\bclear\b/gi, "klir"],
  [/\bcompact\b/gi, "kompakt"],
  [/\brewind\b/gi, "riłajnd"],
  [/\bresume\b/gi, "rizjum"],
  [/\brename\b/gi, "rinejm"],
  [/\beffort\b/gi, "efort"],
];

/** Fragment tekstu: oryginał i jego zapis fonetyczny (różne, gdy zadziałała podmiana). */
export type Fragment = { oryginal: string; fonetyka: string };

/**
 * Zamienia anglicyzmy na zapis fonetyczny.
 * Zwraca tekst dla lektora oraz listę fragmentów, dzięki której da się
 * przypisać czasy ze sfonetyzowanego nagrania z powrotem do oryginalnych słów.
 */
export function fonetyzuj(tekst: string): { dlaLektora: string; fragmenty: Fragment[] } {
  type Trafienie = { start: number; koniec: number; zamiennik: string };
  const trafienia: Trafienie[] = [];

  for (const [wzorzec, zamiana] of SLOWNIK) {
    const re = new RegExp(wzorzec.source, wzorzec.flags.includes("g") ? wzorzec.flags : wzorzec.flags + "g");
    let m: RegExpExecArray | null;
    while ((m = re.exec(tekst)) !== null) {
      if (m[0].length === 0) break;
      const start = m.index;
      const koniec = start + m[0].length;
      // Pomijaj miejsca już zajęte przez wcześniejszą (dłuższą) regułę.
      if (trafienia.some((t) => start < t.koniec && koniec > t.start)) continue;
      trafienia.push({ start, koniec, zamiennik: m[0].replace(wzorzec, zamiana) });
    }
  }

  trafienia.sort((a, b) => a.start - b.start);

  const fragmenty: Fragment[] = [];
  let pozycja = 0;
  for (const t of trafienia) {
    if (t.start > pozycja) {
      const przed = tekst.slice(pozycja, t.start);
      fragmenty.push({ oryginal: przed, fonetyka: przed });
    }
    fragmenty.push({ oryginal: tekst.slice(t.start, t.koniec), fonetyka: t.zamiennik });
    pozycja = t.koniec;
  }
  if (pozycja < tekst.length) {
    const reszta = tekst.slice(pozycja);
    fragmenty.push({ oryginal: reszta, fonetyka: reszta });
  }

  return { dlaLektora: fragmenty.map((f) => f.fonetyka).join(""), fragmenty };
}
