import type { Ekran } from "./typy";

/** Opis ekranu ludzkim językiem — gdy scena nie ma jeszcze własnego opisu. */
export function opisEkranu(e: Ekran): string {
  switch (e.typ) {
    case "tytul":
      return `Duży napis „${e.naglowek}”${e.akcent ? `, wyróżnione słowa „${e.akcent}”` : ""}${e.dopisek ? `, odręczny dopisek „${e.dopisek}”` : ""}${e.etykieta ? `, mała etykieta „${e.etykieta}”` : ""}.`;
    case "lista":
      return `${e.naglowek ? `Nagłówek „${e.naglowek}” i lista` : "Lista"} ${e.punkty.length} kafelków: ${e.punkty.map((p) => `${p.ikona ? p.ikona + " " : ""}${p.tekst}`).join("; ")}.`;
    case "karta":
      return `Jedna karta${e.ikona ? ` z ikoną ${e.ikona}` : ""}: „${e.naglowek}”${e.tekst ? `, pod spodem „${e.tekst}”` : ""}${e.etykieta ? `, etykieta „${e.etykieta}”` : ""}.`;
    case "liczba":
      return `Wielka liczba ${e.prefiks ?? ""}${e.wartosc}${e.sufiks ?? ""} nabijająca się licznikiem, podpis „${e.podpis}”.`;
    case "porownanie":
      return `Porównanie: „${e.lewo.naglowek}” (${e.lewo.punkty.join(", ")}) kontra „${e.prawo.naglowek}” (${e.prawo.punkty.join(", ")}).`;
    case "cta":
      return `Zakończenie: napis „${e.naglowek}”, pomarańczowy przycisk „${e.przycisk}”${e.dopisek ? `, dopisek „${e.dopisek}”` : ""}.`;
    case "3d": {
      const nazwy: Record<string, string> = {
        kostki: "latające kostki 3D",
        kula: "kula 3D",
        torus: "obracający się węzeł 3D",
        pierscienie: "pierścienie 3D",
        kartki: "kartki papieru w przestrzeni 3D",
      };
      return `Animacja 3D (${nazwy[e.ksztalt] ?? e.ksztalt}) pod napisem „${e.naglowek}”${e.dopisek ? `, dopisek „${e.dopisek}”` : ""}.`;
    }
    case "kod":
      return `Okno terminala${e.naglowek ? ` pod nagłówkiem „${e.naglowek}”` : ""}, wpisuje się: ${e.linie.map((l) => `„${l}”`).join(", ")}.`;
    case "telefon": {
      const czesci: string[] = [];
      if (e.powiadomienie) czesci.push(`powiadomienie „${e.powiadomienie.tytul}: ${e.powiadomienie.tekst}”`);
      if (e.wiersze?.length) czesci.push(`lista: ${e.wiersze.map((w) => w.tytul).join(", ")}`);
      if (e.przycisk) czesci.push(`przycisk „${e.przycisk}”`);
      return `Makieta telefonu${e.naglowek ? ` pod nagłówkiem „${e.naglowek}”` : ""}${czesci.length ? `, na ekranie ${czesci.join("; ")}` : ""}.`;
    }
    case "czat":
      return `Rozmowa na czacie${e.rozmowca ? ` z „${e.rozmowca}”` : ""}: ${e.wiadomosci
        .map((w) => `${w.odNas ? "my" : "oni"}: „${w.tekst}”`)
        .join("; ")}.`;
    case "przegladarka":
      return `Okno przeglądarki z adresem ${e.adres}, tytuł „${e.tytulStrony}”${e.opis ? `, opis „${e.opis}”` : ""}${
        e.przycisk ? `, przycisk „${e.przycisk}”` : ""
      }.`;
    case "formularz":
      return `Formularz${e.tytul ? ` „${e.tytul}”` : ""} wypełniany na żywo: ${e.pola
        .map((p) => `${p.etykieta}: ${p.wartosc}`)
        .join(", ")}, potem kliknięcie „${e.przycisk}”${e.potwierdzenie ? ` i potwierdzenie „${e.potwierdzenie}”` : ""}.`;
  }
}
