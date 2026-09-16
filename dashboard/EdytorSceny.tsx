import React, { useEffect, useState } from "react";
import type { Ekran, Przejscie, Punkt, Scena, TypEkranu } from "../src/typy";
import { czasSceny, formatujCzas } from "../src/czas";
import { urlPliku } from "./api";
import { opisEkranu } from "../src/opis";
import { EFEKTY_GOTOWE } from "../src/efekty";
import { fonetyzuj } from "../src/fonetyka";
import { ArrowDown, ArrowUp, ChevronDown, ChevronUp, Mic, Monitor, RefreshCw, Sparkles, X } from "lucide-react";

const I = { className: "ikona", strokeWidth: 1.75 } as const;

export const NAZWY_TYPOW: Record<TypEkranu, string> = {
  tytul: "Duży napis",
  lista: "Lista kafelków",
  karta: "Jedna karta",
  liczba: "Wielka liczba",
  porownanie: "Porównanie",
  cta: "Zakończenie z przyciskiem",
  "3d": "Element 3D",
  kod: "Okno terminala",
  telefon: "Makieta telefonu",
  czat: "Rozmowa na czacie",
  przegladarka: "Okno przeglądarki",
  formularz: "Formularz wypełniany na żywo",
};

const NAZWY_PRZEJSC: Record<Przejscie, string> = {
  fade: "Przenikanie",
  slide: "Przesunięcie",
  wipe: "Wycieranie",
  brak: "Bez przejścia (cięcie)",
};

/** Domyślna zawartość ekranu przy zmianie typu — zachowuje tytuł, jeśli się da. */
export function domyslnyEkran(typ: TypEkranu, poprzedni?: Ekran): Ekran {
  const naglowek = (poprzedni && "naglowek" in poprzedni && poprzedni.naglowek) || "Nagłówek";
  switch (typ) {
    case "tytul":
      return { typ, naglowek, akcent: "", dopisek: "" };
    case "lista":
      return { typ, naglowek, punkty: [{ tekst: "Pierwszy punkt" }, { tekst: "Drugi punkt" }, { tekst: "Trzeci punkt" }] };
    case "karta":
      return { typ, naglowek, tekst: "", ikona: "💡" };
    case "liczba":
      return { typ, wartosc: 100, sufiks: "%", podpis: "podpis pod liczbą" };
    case "porownanie":
      return { typ, lewo: { naglowek: "Źle", punkty: ["..."] }, prawo: { naglowek: "Dobrze", punkty: ["..."] } };
    case "cta":
      return { typ, naglowek, przycisk: "akademiaautomatyzacji.com", dopisek: "link w opisie" };
    case "3d":
      return { typ, ksztalt: "kostki", naglowek, dopisek: "" };
    case "kod":
      return { typ, tytul: "terminal", naglowek, linie: ["pierwsza linia", "druga linia"] };
    case "telefon":
      return {
        typ,
        naglowek,
        powiadomienie: { tytul: "Nowe zgłoszenie", tekst: "Klient czeka na odpowiedź" },
        wiersze: [{ ikona: "📩", tytul: "Wiadomość", podtytul: "przed chwilą" }],
        przycisk: "Odpowiedz",
      };
    case "czat":
      return {
        typ,
        naglowek,
        rozmowca: "Klient",
        wiadomosci: [
          { tekst: "Dzień dobry, mam pytanie" },
          { odNas: true, tekst: "Już odpisuję" },
        ],
      };
    case "przegladarka":
      return {
        typ,
        naglowek,
        adres: "akademiaautomatyzacji.com",
        tytulStrony: "Tytuł artykułu",
        opis: "",
        przycisk: "Czytaj dalej",
      };
    case "formularz":
      return {
        typ,
        naglowek,
        tytul: "Zapis na szkolenie",
        pola: [
          { etykieta: "Imię", wartosc: "Anna" },
          { etykieta: "E-mail", wartosc: "anna@firma.pl" },
        ],
        przycisk: "Zapisz się",
        potwierdzenie: "Miejsce zarezerwowane",
      };
  }
}

type Props = {
  scena: Scena;
  numer: number;
  aktywna: boolean;
  projektId: string;
  audioAktualne: boolean;
  zajete: boolean;
  onZmiana: (s: Scena) => void;
  onUsun: () => void;
  onPrzesun: (kierunek: -1 | 1) => void;
  onLektor: () => void;
  onEfekt: () => void;
  onPopraw: (opis: string) => void;
  onKlik: () => void;
};

export const EdytorSceny: React.FC<Props> = ({ scena, numer, aktywna, projektId, audioAktualne, zajete, onZmiana, onUsun, onPrzesun, onLektor, onEfekt, onPopraw, onKlik }) => {
  const [szczegoly, setSzczegoly] = useState(false);
  const opisZapisany = scena.opis ?? opisEkranu(scena.ekran);
  const [opis, setOpis] = useState(opisZapisany);
  useEffect(() => setOpis(opisZapisany), [opisZapisany]);
  const opisZmieniony = opis.trim() !== opisZapisany.trim();
  // Anglicyzmy trafiają do lektora w zapisie fonetycznym, a napisy pokazują oryginał.
  const wymowa = fonetyzuj(scena.lektor).dlaLektora;
  const innaWymowa = wymowa.trim() !== scena.lektor.trim();
  const ustawEkran = (ekran: Ekran) => onZmiana({ ...scena, ekran, opis: opisEkranu(ekran) });
  const stanAudio = !scena.audio ? "brak" : audioAktualne ? "ok" : "nieaktualne";
  const opisAudio = stanAudio === "brak" ? "Lektor niewygenerowany" : stanAudio === "ok" ? `Lektor gotowy (${formatujCzas(scena.audio!.czas)})` : "Tekst zmieniony — wygeneruj ponownie";

  return (
    <div className={`scena ${aktywna ? "aktywna" : ""}`} onClick={onKlik}>
      <div className="rail">
        <span className="numer">{numer}</span>
        <button className="btn maly cichy ikonowy" title="Przesuń wyżej" aria-label="Przesuń wyżej" onClick={() => onPrzesun(-1)}><ArrowUp {...I} /></button>
        <button className="btn maly cichy ikonowy" title="Przesuń niżej" aria-label="Przesuń niżej" onClick={() => onPrzesun(1)}><ArrowDown {...I} /></button>
        <button className="btn maly cichy ikonowy niebezpieczny" title="Usuń scenę" aria-label="Usuń scenę" onClick={() => confirm(`Usunąć scenę ${numer}?`) && onUsun()}><X {...I} /></button>
      </div>
      <div className="karta cialo">
        <div className="naglowek-sceny">
          <span className="typ">{NAZWY_TYPOW[scena.ekran.typ]}</span>
          <span className="male">około {formatujCzas(czasSceny(scena))}</span>
          <span className="rozciagnij" />
          <button className="btn maly cichy" onClick={() => setSzczegoly((v) => !v)}>
            Szczegóły {szczegoly ? <ChevronUp {...I} /> : <ChevronDown {...I} />}
          </button>
        </div>

        <div className="pole lektor-pole">
          <label><Mic {...I} style={{ width: 14, height: 14 }} /> Co mówi lektor</label>
          <textarea value={scena.lektor} onChange={(e) => onZmiana({ ...scena, lektor: e.target.value })} placeholder="Tekst, który przeczyta lektor" />
        </div>

        {innaWymowa && (
          <p className="male podpowiedz-wymowy" title="Napisy pokażą Twój zapis, lektor przeczyta wersję fonetyczną">
            Lektor przeczyta: {wymowa}
          </p>
        )}

        <div className="audio-pasek">
          <span className={`kropka ${stanAudio}`} />
          <span className="male">{opisAudio}</span>
          {scena.audio && <audio key={scena.audio.plik} controls src={urlPliku(projektId, scena.audio.plik)} />}
          <button className="btn maly" disabled={zajete || !scena.lektor.trim()} onClick={onLektor}>
            {stanAudio === "brak" ? <Mic {...I} /> : <RefreshCw {...I} />} {stanAudio === "brak" ? "Generuj lektora" : "Generuj ponownie"}
          </button>
        </div>

        <div className="pole opis-pole">
          <label><Monitor {...I} style={{ width: 14, height: 14 }} /> Co widać na ekranie</label>
          <textarea value={opis} onChange={(e) => setOpis(e.target.value)} placeholder="Opisz słowami, co ma być na ekranie" />
        </div>
        <div className="pasek-akcji">
          <button className={`btn maly ${opisZmieniony ? "glowny" : ""}`} disabled={zajete || !opis.trim()} onClick={() => onPopraw(opis)} title="Claude przebuduje ekran tej sceny według opisu">
            <Sparkles {...I} /> Popraw scenę
          </button>
          {opisZmieniony && <span className="male">Opis zmieniony. Kliknij, żeby Claude przebudował ekran.</span>}
        </div>

        {szczegoly && (
          <div className="szczegoly">
            <div className="pole">
              <label>Typ ekranu</label>
              <select value={scena.ekran.typ} onChange={(e) => ustawEkran(domyslnyEkran(e.target.value as TypEkranu, scena.ekran))}>
                {Object.entries(NAZWY_TYPOW).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <FormularzEkranu ekran={scena.ekran} onZmiana={ustawEkran} />
          </div>
        )}

      <div className="wiersz dwa" style={{ marginTop: 4 }}>
        <div className="pole">
          <label>Przejście do następnej sceny</label>
          <select value={scena.przejscie ?? "fade"} onChange={(e) => onZmiana({ ...scena, przejscie: e.target.value as Przejscie })}>
            {Object.entries(NAZWY_PRZEJSC).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <div className="pole">
          <label>Efekt dźwiękowy (opcjonalnie)</label>
          <div style={{ display: "flex", gap: 6 }}>
            <input
              list="efekty-gotowe"
              value={scena.efekt ?? ""}
              onChange={(e) => onZmiana({ ...scena, efekt: e.target.value })}
              placeholder="wybierz z listy albo opisz własny"
            />
            <datalist id="efekty-gotowe">
              {EFEKTY_GOTOWE.map((e) => (
                <option key={e.nazwa} value={e.opis}>
                  {e.nazwa} — {e.kiedy}
                </option>
              ))}
            </datalist>
            <button className="btn maly" disabled={zajete || !scena.efekt?.trim()} onClick={onEfekt} title="Wygeneruj efekt w ElevenLabs">
              {scena.efektAudio ? <RefreshCw {...I} /> : "Generuj"}
            </button>
          </div>
          {scena.efektAudio && <audio controls src={urlPliku(projektId, scena.efektAudio.plik)} style={{ height: 28, marginTop: 4, width: "100%" }} />}
        </div>
      </div>
      </div>
    </div>
  );
};

const Pole: React.FC<{ label: string; value: string | number | undefined; onChange: (v: string) => void; placeholder?: string; typ?: string; wielolinia?: boolean }> = ({ label, value, onChange, placeholder, typ = "text", wielolinia }) => (
  <div className="pole">
    <label>{label}</label>
    {wielolinia ? (
      <textarea value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    ) : (
      <input type={typ} value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    )}
  </div>
);

const ListaTekstow: React.FC<{ label: string; wartosci: string[]; onChange: (v: string[]) => void }> = ({ label, wartosci, onChange }) => (
  <div className="pole">
    <label>{label}</label>
    <div className="punkty-edycja">
      {wartosci.map((w, i) => (
        <div key={i} style={{ display: "flex", gap: 6 }}>
          <input value={w} onChange={(e) => onChange(wartosci.map((x, j) => (j === i ? e.target.value : x)))} style={{ flex: 1 }} />
          <button className="btn maly cichy ikonowy" aria-label="Usuń" onClick={() => onChange(wartosci.filter((_, j) => j !== i))}><X {...I} /></button>
        </div>
      ))}
      <button className="btn maly" onClick={() => onChange([...wartosci, ""])}>Dodaj</button>
    </div>
  </div>
);

const FormularzEkranu: React.FC<{ ekran: Ekran; onZmiana: (e: Ekran) => void }> = ({ ekran, onZmiana }) => {
  switch (ekran.typ) {
    case "tytul":
      return (
        <>
          <Pole label="Nagłówek" value={ekran.naglowek} onChange={(v) => onZmiana({ ...ekran, naglowek: v })} />
          <div className="wiersz dwa">
            <Pole label="Słowa do wyróżnienia (fragment nagłówka)" value={ekran.akcent} onChange={(v) => onZmiana({ ...ekran, akcent: v })} placeholder="np. NARZĘDZI AI" />
            <Pole label="Mała etykieta nad tytułem" value={ekran.etykieta} onChange={(v) => onZmiana({ ...ekran, etykieta: v })} placeholder="np. Akademia Automatyzacji" />
          </div>
          <Pole label="Odręczny dopisek" value={ekran.dopisek} onChange={(v) => onZmiana({ ...ekran, dopisek: v })} placeholder="np. które dają przewagę" />
        </>
      );
    case "lista":
      return (
        <>
          <Pole label="Nagłówek (opcjonalnie)" value={ekran.naglowek} onChange={(v) => onZmiana({ ...ekran, naglowek: v })} />
          <div className="pole">
            <label>Punkty (ikona + tekst)</label>
            <div className="punkty-edycja">
              {ekran.punkty.map((p, i) => (
                <div className="punkt" key={i}>
                  <input value={p.ikona ?? ""} placeholder="✅" onChange={(e) => onZmiana({ ...ekran, punkty: zmien(ekran.punkty, i, { ...p, ikona: e.target.value }) })} />
                  <input value={p.tekst} onChange={(e) => onZmiana({ ...ekran, punkty: zmien(ekran.punkty, i, { ...p, tekst: e.target.value }) })} />
                  <button className="btn maly cichy ikonowy" aria-label="Usuń punkt" onClick={() => onZmiana({ ...ekran, punkty: ekran.punkty.filter((_, j) => j !== i) })}><X {...I} /></button>
                </div>
              ))}
              <button className="btn maly" onClick={() => onZmiana({ ...ekran, punkty: [...ekran.punkty, { tekst: "" }] })}>Dodaj punkt</button>
            </div>
          </div>
        </>
      );
    case "karta":
      return (
        <>
          <div className="wiersz dwa">
            <Pole label="Ikona (emoji)" value={ekran.ikona} onChange={(v) => onZmiana({ ...ekran, ikona: v })} />
            <Pole label="Etykieta (opcjonalnie)" value={ekran.etykieta} onChange={(v) => onZmiana({ ...ekran, etykieta: v })} />
          </div>
          <Pole label="Nagłówek karty" value={ekran.naglowek} onChange={(v) => onZmiana({ ...ekran, naglowek: v })} />
          <Pole label="Tekst pod nagłówkiem" value={ekran.tekst} onChange={(v) => onZmiana({ ...ekran, tekst: v })} wielolinia />
        </>
      );
    case "liczba":
      return (
        <>
          <div className="wiersz trzy">
            <Pole label="Przed liczbą" value={ekran.prefiks} onChange={(v) => onZmiana({ ...ekran, prefiks: v })} placeholder="np. ~" />
            <Pole label="Liczba" typ="number" value={ekran.wartosc} onChange={(v) => onZmiana({ ...ekran, wartosc: Number(v) || 0 })} />
            <Pole label="Za liczbą" value={ekran.sufiks} onChange={(v) => onZmiana({ ...ekran, sufiks: v })} placeholder="np. %, +, zł" />
          </div>
          <Pole label="Podpis" value={ekran.podpis} onChange={(v) => onZmiana({ ...ekran, podpis: v })} />
        </>
      );
    case "porownanie":
      return (
        <div className="wiersz dwa">
          <div>
            <Pole label="Lewa strona — nagłówek (źle)" value={ekran.lewo.naglowek} onChange={(v) => onZmiana({ ...ekran, lewo: { ...ekran.lewo, naglowek: v } })} />
            <ListaTekstow label="Punkty" wartosci={ekran.lewo.punkty} onChange={(p) => onZmiana({ ...ekran, lewo: { ...ekran.lewo, punkty: p } })} />
          </div>
          <div>
            <Pole label="Prawa strona — nagłówek (dobrze)" value={ekran.prawo.naglowek} onChange={(v) => onZmiana({ ...ekran, prawo: { ...ekran.prawo, naglowek: v } })} />
            <ListaTekstow label="Punkty" wartosci={ekran.prawo.punkty} onChange={(p) => onZmiana({ ...ekran, prawo: { ...ekran.prawo, punkty: p } })} />
          </div>
        </div>
      );
    case "cta":
      return (
        <>
          <Pole label="Nagłówek" value={ekran.naglowek} onChange={(v) => onZmiana({ ...ekran, naglowek: v })} />
          <div className="wiersz dwa">
            <Pole label="Tekst na przycisku" value={ekran.przycisk} onChange={(v) => onZmiana({ ...ekran, przycisk: v })} />
            <Pole label="Odręczny dopisek" value={ekran.dopisek} onChange={(v) => onZmiana({ ...ekran, dopisek: v })} />
          </div>
        </>
      );
    case "3d":
      return (
        <>
          <div className="pole">
            <label>Kształt 3D</label>
            <select value={ekran.ksztalt} onChange={(e) => onZmiana({ ...ekran, ksztalt: e.target.value as typeof ekran.ksztalt })}>
              <option value="kostki">Latające kostki</option>
              <option value="kula">Kula</option>
              <option value="torus">Węzeł</option>
              <option value="pierscienie">Pierścienie</option>
            </select>
          </div>
          <Pole label="Nagłówek" value={ekran.naglowek} onChange={(v) => onZmiana({ ...ekran, naglowek: v })} />
          <Pole label="Odręczny dopisek" value={ekran.dopisek} onChange={(v) => onZmiana({ ...ekran, dopisek: v })} />
        </>
      );
    case "kod":
      return (
        <>
          <div className="wiersz dwa">
            <Pole label="Nagłówek nad oknem" value={ekran.naglowek} onChange={(v) => onZmiana({ ...ekran, naglowek: v })} />
            <Pole label="Tytuł okna" value={ekran.tytul} onChange={(v) => onZmiana({ ...ekran, tytul: v })} />
          </div>
          <ListaTekstow label="Linie w oknie (pisane na żywo)" wartosci={ekran.linie} onChange={(l) => onZmiana({ ...ekran, linie: l })} />
        </>
      );
    case "telefon":
      return (
        <>
          <div className="wiersz dwa">
            <Pole label="Nagłówek nad telefonem" value={ekran.naglowek} onChange={(v) => onZmiana({ ...ekran, naglowek: v })} />
            <Pole label="Tytuł na ekranie telefonu" value={ekran.tytulEkranu} onChange={(v) => onZmiana({ ...ekran, tytulEkranu: v })} />
          </div>
          <div className="wiersz dwa">
            <Pole
              label="Powiadomienie: tytuł"
              value={ekran.powiadomienie?.tytul}
              onChange={(v) => onZmiana({ ...ekran, powiadomienie: { tytul: v, tekst: ekran.powiadomienie?.tekst ?? "" } })}
            />
            <Pole
              label="Powiadomienie: treść"
              value={ekran.powiadomienie?.tekst}
              onChange={(v) => onZmiana({ ...ekran, powiadomienie: { tytul: ekran.powiadomienie?.tytul ?? "", tekst: v } })}
            />
          </div>
          <div className="pole">
            <label>Wiersze na ekranie</label>
            <div className="punkty-edycja">
              {(ekran.wiersze ?? []).map((w, i) => (
                <div className="punkt" key={i}>
                  <input
                    value={w.ikona ?? ""}
                    placeholder="📩"
                    onChange={(e) => onZmiana({ ...ekran, wiersze: zmienWiersz(ekran.wiersze ?? [], i, { ...w, ikona: e.target.value }) })}
                  />
                  <input
                    value={w.tytul}
                    onChange={(e) => onZmiana({ ...ekran, wiersze: zmienWiersz(ekran.wiersze ?? [], i, { ...w, tytul: e.target.value }) })}
                  />
                  <button className="btn maly cichy ikonowy" aria-label="Usuń wiersz" onClick={() => onZmiana({ ...ekran, wiersze: (ekran.wiersze ?? []).filter((_, j) => j !== i) })}>
                    <X {...I} />
                  </button>
                </div>
              ))}
              <button className="btn maly" onClick={() => onZmiana({ ...ekran, wiersze: [...(ekran.wiersze ?? []), { tytul: "" }] })}>
                Dodaj wiersz
              </button>
            </div>
          </div>
          <Pole label="Przycisk w aplikacji" value={ekran.przycisk} onChange={(v) => onZmiana({ ...ekran, przycisk: v })} />
        </>
      );
    case "czat":
      return (
        <>
          <div className="wiersz dwa">
            <Pole label="Nagłówek nad czatem" value={ekran.naglowek} onChange={(v) => onZmiana({ ...ekran, naglowek: v })} />
            <Pole label="Z kim rozmowa" value={ekran.rozmowca} onChange={(v) => onZmiana({ ...ekran, rozmowca: v })} />
          </div>
          <div className="pole">
            <label>Wiadomości (zaznacz, jeśli to nasza)</label>
            <div className="punkty-edycja">
              {ekran.wiadomosci.map((w, i) => (
                <div key={i} style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <label className="przelacznik" title="Nasza wiadomość">
                    <input
                      type="checkbox"
                      checked={!!w.odNas}
                      onChange={(e) => onZmiana({ ...ekran, wiadomosci: zmienWiad(ekran.wiadomosci, i, { ...w, odNas: e.target.checked }) })}
                    />
                  </label>
                  <input
                    style={{ flex: 1 }}
                    value={w.tekst}
                    onChange={(e) => onZmiana({ ...ekran, wiadomosci: zmienWiad(ekran.wiadomosci, i, { ...w, tekst: e.target.value }) })}
                  />
                  <button className="btn maly cichy ikonowy" aria-label="Usuń wiadomość" onClick={() => onZmiana({ ...ekran, wiadomosci: ekran.wiadomosci.filter((_, j) => j !== i) })}>
                    <X {...I} />
                  </button>
                </div>
              ))}
              <button className="btn maly" onClick={() => onZmiana({ ...ekran, wiadomosci: [...ekran.wiadomosci, { tekst: "" }] })}>
                Dodaj wiadomość
              </button>
            </div>
          </div>
        </>
      );
    case "przegladarka":
      return (
        <>
          <div className="wiersz dwa">
            <Pole label="Nagłówek nad oknem" value={ekran.naglowek} onChange={(v) => onZmiana({ ...ekran, naglowek: v })} />
            <Pole label="Adres strony" value={ekran.adres} onChange={(v) => onZmiana({ ...ekran, adres: v })} />
          </div>
          <Pole label="Tytuł na stronie" value={ekran.tytulStrony} onChange={(v) => onZmiana({ ...ekran, tytulStrony: v })} />
          <Pole label="Opis pod tytułem" value={ekran.opis} onChange={(v) => onZmiana({ ...ekran, opis: v })} wielolinia />
          <div className="wiersz dwa">
            <Pole label="Podpis w miejscu obrazka" value={ekran.obrazTekst} onChange={(v) => onZmiana({ ...ekran, obrazTekst: v })} />
            <Pole label="Przycisk na stronie" value={ekran.przycisk} onChange={(v) => onZmiana({ ...ekran, przycisk: v })} />
          </div>
        </>
      );
    case "formularz":
      return (
        <>
          <div className="wiersz dwa">
            <Pole label="Nagłówek nad formularzem" value={ekran.naglowek} onChange={(v) => onZmiana({ ...ekran, naglowek: v })} />
            <Pole label="Tytuł formularza" value={ekran.tytul} onChange={(v) => onZmiana({ ...ekran, tytul: v })} />
          </div>
          <div className="pole">
            <label>Pola (etykieta i wpisywana wartość)</label>
            <div className="punkty-edycja">
              {ekran.pola.map((p, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 6 }}>
                  <input
                    value={p.etykieta}
                    onChange={(e) => onZmiana({ ...ekran, pola: zmienPole(ekran.pola, i, { ...p, etykieta: e.target.value }) })}
                  />
                  <input
                    value={p.wartosc}
                    onChange={(e) => onZmiana({ ...ekran, pola: zmienPole(ekran.pola, i, { ...p, wartosc: e.target.value }) })}
                  />
                  <button className="btn maly cichy ikonowy" aria-label="Usuń pole" onClick={() => onZmiana({ ...ekran, pola: ekran.pola.filter((_, j) => j !== i) })}>
                    <X {...I} />
                  </button>
                </div>
              ))}
              <button className="btn maly" onClick={() => onZmiana({ ...ekran, pola: [...ekran.pola, { etykieta: "", wartosc: "" }] })}>
                Dodaj pole
              </button>
            </div>
          </div>
          <div className="wiersz dwa">
            <Pole label="Przycisk" value={ekran.przycisk} onChange={(v) => onZmiana({ ...ekran, przycisk: v })} />
            <Pole label="Potwierdzenie po kliknięciu" value={ekran.potwierdzenie} onChange={(v) => onZmiana({ ...ekran, potwierdzenie: v })} />
          </div>
        </>
      );
  }
};

function zmienWiersz<T>(lista: T[], i: number, nowy: T) {
  return lista.map((x, j) => (j === i ? nowy : x));
}
const zmienWiad = zmienWiersz;
const zmienPole = zmienWiersz;

function zmien(punkty: Punkt[], i: number, nowy: Punkt) {
  return punkty.map((p, j) => (j === i ? nowy : p));
}
