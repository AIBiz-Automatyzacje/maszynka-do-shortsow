import type { Scenariusz } from "./typy";

/** Przykładowy scenariusz — pokazuje wszystkie typy scen. */
export const PRZYKLAD: Scenariusz = {
  id: "przyklad",
  tytul: "Przykład: wszystkie typy scen",
  zrodlo: "Wbudowany przykład",
  docelowaDlugosc: 45,
  status: "scenariusz",
  utworzono: "2026-09-11T08:00:00.000Z",
  zmieniono: "2026-09-11T08:00:00.000Z",
  napisy: true,
  sceny: [
    {
      id: "s1",
      lektor: "W osiem tygodni nauczymy Cię narzędzi AI, które dają realną przewagę.",
      ekran: { typ: "tytul", etykieta: "8 tygodni z AI", naglowek: "W 8 tygodni nauczymy Cię NARZĘDZI AI", akcent: "NARZĘDZI AI", dopisek: "które dają przewagę i możliwości" },
    },
    {
      id: "s2",
      lektor: "Zamiast klikać ręcznie, budujesz automatyzacje, aplikacje i agentów. Od zera.",
      ekran: {
        typ: "lista",
        naglowek: "Czego się nauczysz",
        punkty: [
          { ikona: "⚡", tekst: "Automatyzacje w n8n i Make" },
          { ikona: "🤖", tekst: "Agenci AI w Claude Code" },
          { ikona: "🚀", tekst: "Własne aplikacje bez kodowania" },
        ],
      },
      przejscie: "slide",
    },
    {
      id: "s3",
      lektor: "Ponad tysiąc dwieście osób już z nami pracuje.",
      ekran: { typ: "liczba", wartosc: 1210, sufiks: "+", podpis: "aktywnych użytkowników w społeczności" },
    },
    {
      id: "s4",
      lektor: "Różnica jest prosta. Bez systemu tracisz czas. Z systemem masz gotowe przepisy.",
      ekran: {
        typ: "porownanie",
        lewo: { naglowek: "Bez systemu", punkty: ["Godziny na YouTube", "Chaos w narzędziach", "Zero efektów"] },
        prawo: { naglowek: "Z Akademią", punkty: ["Gotowe przepisy", "Kursy krok po kroku", "Społeczność, która pomaga"] },
      },
    },
    {
      id: "s5",
      lektor: "Wszystko składa się w jeden działający system.",
      ekran: { typ: "3d", ksztalt: "kartki", naglowek: "Jeden system", dopisek: "zamiast dziesięciu narzędzi" },
      przejscie: "wipe",
    },
    {
      id: "s6",
      lektor: "Jedna komenda i agent robi robotę za Ciebie.",
      ekran: { typ: "kod", tytul: "claude", naglowek: "Tak to wygląda w praktyce", linie: ["Zrób raport z tego arkusza", "✓ Gotowe: raport.pdf"] },
    },
    {
      id: "s7",
      lektor: "Link znajdziesz w opisie. Do zobaczenia w Akademii!",
      ekran: { typ: "cta", naglowek: "Sprawdź ofertę", przycisk: "akademiaautomatyzacji.com", dopisek: "link w opisie" },
    },
  ],
};
