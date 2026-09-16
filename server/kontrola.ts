// Kontrola jakości rolki przed renderem: układ kadru i tempo.
// Wzorowane na bramce jakości ze starszego silnika: błędy blokują, ostrzeżenia tylko informują.
import { czyZnanyTyp, type Scena, type Scenariusz } from "../src/typy";
import { budzetSlow, czasCalosci, czasSceny, przerwyWMowie, SLOW_NA_SEKUNDE } from "../src/czas";

export type Uwaga = {
  waga: "blad" | "ostrzezenie";
  scena?: string;
  numer?: number;
  tekst: string;
};

const slowaW = (t: string) => t.trim().split(/\s+/).filter(Boolean).length;

/** Ile znaków tekstu trafia na ekran w danej scenie. */
function znakiNaEkranie(scena: Scena): number {
  const e = scena.ekran;
  const zlicz = (...t: (string | undefined)[]) => t.filter(Boolean).join(" ").length;
  switch (e.typ) {
    case "tytul":
      return zlicz(e.naglowek, e.dopisek, e.etykieta);
    case "lista":
      return zlicz(e.naglowek, ...e.punkty.map((p) => p.tekst));
    case "karta":
      return zlicz(e.naglowek, e.tekst, e.etykieta);
    case "liczba":
      return zlicz(e.podpis);
    case "porownanie":
      return zlicz(e.lewo.naglowek, ...e.lewo.punkty, e.prawo.naglowek, ...e.prawo.punkty);
    case "cta":
      return zlicz(e.naglowek, e.przycisk, e.dopisek);
    case "3d":
      return zlicz(e.naglowek, e.dopisek, e.etykieta);
    case "kod":
      return zlicz(e.naglowek, ...e.linie);
    case "telefon":
      return zlicz(e.naglowek, e.tytulEkranu, e.powiadomienie?.tytul, e.powiadomienie?.tekst, ...(e.wiersze ?? []).map((w) => w.tytul + (w.podtytul ?? "")), e.przycisk);
    case "czat":
      return zlicz(e.naglowek, ...e.wiadomosci.map((w) => w.tekst));
    case "przegladarka":
      return zlicz(e.naglowek, e.tytulStrony, e.opis, e.przycisk, e.obrazTekst);
    case "formularz":
      return zlicz(e.naglowek, e.tytul, ...e.pola.map((p) => p.etykieta + p.wartosc), e.przycisk, e.potwierdzenie);
  }
}

/** Sprawdza scenariusz i zwraca listę uwag. Błędy warto poprawić przed renderem. */
export function sprawdzScenariusz(s: Scenariusz): Uwaga[] {
  const uwagi: Uwaga[] = [];
  const dodaj = (waga: Uwaga["waga"], tekst: string, scena?: Scena, numer?: number) =>
    uwagi.push({ waga, tekst, scena: scena?.id, numer });

  if (s.sceny.length === 0) {
    dodaj("blad", "Scenariusz nie ma żadnej sceny.");
    return uwagi;
  }

  // --- Długość całości ---
  const czas = czasCalosci(s);
  if (czas > s.docelowaDlugosc * 1.15) {
    dodaj("blad", `Rolka trwa ${czas.toFixed(0)} s przy celu ${s.docelowaDlugosc} s. Skróć teksty albo usuń scenę.`);
  } else if (czas < s.docelowaDlugosc * 0.7) {
    dodaj("ostrzezenie", `Rolka trwa ${czas.toFixed(0)} s, czyli sporo poniżej celu ${s.docelowaDlugosc} s.`);
  }

  const slowaRazem = s.sceny.reduce((n, x) => n + slowaW(x.lektor), 0);
  const budzet = budzetSlow(s.docelowaDlugosc);
  if (slowaRazem > budzet * 1.15) {
    dodaj("ostrzezenie", `Lektor ma ${slowaRazem} słów, a budżet na ${s.docelowaDlugosc} s to około ${budzet}.`);
  }

  // --- Kompozycja rolki ---
  if (s.sceny[0].ekran.typ !== "tytul") {
    dodaj("ostrzezenie", "Pierwsza scena nie jest typu „duży napis”. Hak działa najlepiej jako mocne zdanie.", s.sceny[0], 1);
  }
  const koniec = s.sceny[s.sceny.length - 1];
  if (koniec.ekran.typ !== "cta") {
    dodaj("ostrzezenie", "Ostatnia scena nie jest zakończeniem z przyciskiem.", koniec, s.sceny.length);
  }
  const ile3d = s.sceny.filter((x) => x.ekran.typ === "3d").length;
  if (ile3d > 1) dodaj("ostrzezenie", `Masz ${ile3d} sceny 3D. W jednej rolce powinna być najwyżej jedna.`);
  const ileKod = s.sceny.filter((x) => x.ekran.typ === "kod").length;
  if (ileKod > 1) dodaj("ostrzezenie", `Masz ${ileKod} sceny z terminalem. W jednej rolce powinna być najwyżej jedna.`);

  // --- Scena po scenie ---
  s.sceny.forEach((scena, i) => {
    const numer = i + 1;
    const dl = czasSceny(scena);
    const slowa = slowaW(scena.lektor);

    if (!scena.lektor.trim()) dodaj("blad", `Scena ${numer} nie ma tekstu lektora.`, scena, numer);
    if (!czyZnanyTyp(scena.ekran?.typ)) dodaj("blad", `Scena ${numer} ma nieznany układ ekranu. Wybierz typ w szczegółach sceny.`, scena, numer);
    if (slowa > 32) dodaj("ostrzezenie", `Scena ${numer}: lektor mówi ${slowa} słów. Podziel ją na dwie.`, scena, numer);
    if (dl > 9) dodaj("ostrzezenie", `Scena ${numer} trwa ${dl.toFixed(1)} s. Powyżej dziewięciu sekund widz się nudzi.`, scena, numer);

    if (i > 0 && s.sceny[i - 1].ekran.typ === scena.ekran.typ && scena.ekran.typ !== "karta") {
      dodaj("ostrzezenie", `Sceny ${numer - 1} i ${numer} są tego samego typu. Zmień jedną dla urozmaicenia.`, scena, numer);
    }

    // Za dużo tekstu na ekranie: kadr robi się nieczytelny na telefonie.
    const znaki = znakiNaEkranie(scena);
    if (znaki > 220) dodaj("blad", `Scena ${numer}: za dużo tekstu na ekranie (${znaki} znaków). Skróć do hasła.`, scena, numer);
    else if (znaki > 160) dodaj("ostrzezenie", `Scena ${numer}: dużo tekstu na ekranie (${znaki} znaków).`, scena, numer);

    const e = scena.ekran;
    if (e.typ === "tytul") {
      if (e.naglowek.length > 70) dodaj("ostrzezenie", `Scena ${numer}: nagłówek ma ${e.naglowek.length} znaków, zmieści się około 70.`, scena, numer);
      if (e.akcent?.trim() && !e.naglowek.includes(e.akcent)) {
        dodaj("blad", `Scena ${numer}: wyróżnione słowa „${e.akcent}” nie występują w nagłówku, więc nic się nie podświetli.`, scena, numer);
      }
    }
    if (e.typ === "lista") {
      if (e.punkty.length > 4) dodaj("ostrzezenie", `Scena ${numer}: ${e.punkty.length} punktów. Cztery to maksimum na ekranie.`, scena, numer);
      if (e.punkty.some((p) => p.tekst.length > 44)) dodaj("ostrzezenie", `Scena ${numer}: któryś punkt jest za długi, zawinie się w dwie linie.`, scena, numer);
      const ikony = e.punkty.map((p) => p.ikona).filter(Boolean);
      if (ikony.length > 1 && new Set(ikony).size === 1) {
        dodaj("ostrzezenie", `Scena ${numer}: wszystkie punkty mają tę samą ikonę. Daj każdemu własną.`, scena, numer);
      }
    }
    if (e.typ === "kod") {
      if (e.linie.length > 4) dodaj("ostrzezenie", `Scena ${numer}: ${e.linie.length} linii w terminalu. Cztery to maksimum.`, scena, numer);
      const dluga = e.linie.find((l) => l.length > 38);
      if (dluga) dodaj("blad", `Scena ${numer}: linia „${dluga.slice(0, 30)}…” jest za długa i wyjdzie poza okno.`, scena, numer);
    }
    if (e.typ === "czat") {
      if (e.wiadomosci.length > 4) dodaj("ostrzezenie", `Scena ${numer}: ${e.wiadomosci.length} wiadomości. Cztery to maksimum na ekranie.`, scena, numer);
      const dluga = e.wiadomosci.find((w) => w.tekst.length > 70);
      if (dluga) dodaj("ostrzezenie", `Scena ${numer}: wiadomość „${dluga.tekst.slice(0, 30)}…” jest za długa jak na dymek.`, scena, numer);
    }
    if (e.typ === "telefon") {
      if ((e.wiersze?.length ?? 0) > 4) dodaj("ostrzezenie", `Scena ${numer}: na ekranie telefonu zmieszczą się cztery wiersze.`, scena, numer);
      if (!e.powiadomienie && !e.wiersze?.length && !e.przycisk) {
        dodaj("blad", `Scena ${numer}: telefon jest pusty. Dodaj powiadomienie, listę albo przycisk.`, scena, numer);
      }
    }
    if (e.typ === "formularz") {
      if (e.pola.length > 3) dodaj("ostrzezenie", `Scena ${numer}: ${e.pola.length} pola w formularzu. Trzy to maksimum.`, scena, numer);
      if (e.pola.some((p) => p.wartosc.length > 30)) dodaj("ostrzezenie", `Scena ${numer}: wartość w polu formularza jest za długa.`, scena, numer);
    }
    if (e.typ === "przegladarka" && e.tytulStrony.length > 60) {
      dodaj("ostrzezenie", `Scena ${numer}: tytuł strony ma ${e.tytulStrony.length} znaków, zmieści się około 60.`, scena, numer);
    }
    if (e.typ === "porownanie") {
      if (e.lewo.punkty.length > 3 || e.prawo.punkty.length > 3) {
        dodaj("ostrzezenie", `Scena ${numer}: w porównaniu zmieszczą się trzy punkty na stronę.`, scena, numer);
      }
    }

    // Jakość tekstu lektora
    if (/[—–]/.test(scena.lektor)) dodaj("ostrzezenie", `Scena ${numer}: długi myślnik w tekście lektora. Zamień na kropkę lub przecinek.`, scena, numer);
    if (/\b(szok|rewolucj|gamechanger|game changer|przełom)/i.test(scena.lektor)) {
      dodaj("ostrzezenie", `Scena ${numer}: słowo z listy zakazanych (szok, rewolucja, gamechanger).`, scena, numer);
    }
    if (/\d/.test(scena.lektor)) {
      dodaj("ostrzezenie", `Scena ${numer}: cyfra w tekście lektora. Lektor powinien mówić liczby słownie.`, scena, numer);
    }

    // Rytm nagranej mowy
    if (scena.audio?.slowa?.length) {
      const przerwy = przerwyWMowie(scena.audio.slowa);
      const na10s = (przerwy / Math.max(1, scena.audio.czas)) * 10;
      if (na10s > 3) {
        dodaj("ostrzezenie", `Scena ${numer}: lektor robi dużo pauz (${przerwy}). Tekst jest posiekany na krótkie zdania.`, scena, numer);
      }
    }
  });

  // Rytm zdań w całym scenariuszu
  const zdania = s.sceny.flatMap((x) => x.lektor.split(/(?<=[.!?])\s+/).filter((z) => z.trim().length > 0));
  const krotkie = zdania.filter((z) => slowaW(z) < 6).length;
  if (zdania.length >= 6 && krotkie / zdania.length > 0.34) {
    dodaj("ostrzezenie", `Ponad jedna trzecia zdań jest bardzo krótka (${krotkie} z ${zdania.length}). Lektor zabrzmi jak robot.`);
  }

  return uwagi;
}

/** Krótkie podsumowanie tekstem, do pokazania w dashboardzie. */
export function podsumowanie(s: Scenariusz) {
  const uwagi = sprawdzScenariusz(s);
  const slowaRazem = s.sceny.reduce((n, x) => n + slowaW(x.lektor), 0);
  return {
    uwagi,
    bledy: uwagi.filter((u) => u.waga === "blad").length,
    ostrzezenia: uwagi.filter((u) => u.waga === "ostrzezenie").length,
    slowa: slowaRazem,
    budzetSlow: budzetSlow(s.docelowaDlugosc),
    czas: +czasCalosci(s).toFixed(1),
    tempo: +(SLOW_NA_SEKUNDE * 60).toFixed(0),
  };
}
