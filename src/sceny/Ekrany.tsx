import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import type { Ekran } from "../typy";
import { CIEN_NAKLEJKI, CZCIONKA, KOLOR, PISMO, PROMIEN, PROMIEN_MALY } from "../marka";
import { Dopisek, Karta, Kicker, Lacznik, Stempel, Tresc, Zakreslenie, useKotwice, useSway } from "./wspolne";
import { E, od, pop, postep, puls, stempel, wjazd, wjazdZBoku } from "../ruch";
import { useVideoConfig as useConfig } from "remotion";

type Ek<T extends Ekran["typ"]> = Extract<Ekran, { typ: T }>;

/** Duży nagłówek marki: Archivo Black, wersaliki, ciasny interlinia. */
const NaglowekDuzy: React.FC<{ tekst: string; akcent?: string; opoznienie?: number; rozmiar?: number }> = ({
  tekst,
  akcent,
  opoznienie = 0,
  rozmiar = PISMO.naglowekDuzy,
}) => {
  const czesci = akcent && akcent.trim() && tekst.includes(akcent) ? tekst.split(akcent) : null;
  // Długi nagłówek dostaje mniejsze pismo, żeby nie wyszedł poza kadr.
  const znaki = tekst.length;
  const skala = znaki > 90 ? 0.66 : znaki > 64 ? 0.78 : znaki > 44 ? 0.9 : 1;
  const wspolne: React.CSSProperties = {
    fontFamily: CZCIONKA.naglowek,
    fontSize: Math.round(rozmiar * skala),
    overflowWrap: "break-word",
    lineHeight: 1.02,
    letterSpacing: "-0.01em",
    textTransform: "uppercase",
    color: KOLOR.ink,
  };
  if (!czesci) return <div style={wspolne}>{tekst}</div>;
  return (
    <div style={wspolne}>
      {czesci[0]}
      <Zakreslenie opoznienie={opoznienie + 8}>{akcent!}</Zakreslenie>
      {czesci[1]}
    </div>
  );
};

export const EkranTytul: React.FC<{ ekran: Ek<"tytul"> }> = ({ ekran }) => {
  const frame = useCurrentFrame();
  const nag = wjazd(frame, 4, 70);
  const dop = wjazd(frame, 18, 50);
  return (
    <Tresc>
      {ekran.etykieta && <Kicker opoznienie={0} style={{ marginBottom: 34 }}>{ekran.etykieta}</Kicker>}
      <div style={nag}>
        <NaglowekDuzy tekst={ekran.naglowek} akcent={ekran.akcent} opoznienie={4} />
      </div>
      {ekran.dopisek && <Dopisek style={{ ...dop, marginTop: 34 }}>{ekran.dopisek}</Dopisek>}
    </Tresc>
  );
};

const IKONY_ZAPASOWE = ["⚡", "🎯", "🚀", "💡", "🔧", "📈", "🤖", "✅"];

export const EkranLista: React.FC<{ ekran: Ek<"lista"> }> = ({ ekran }) => {
  const frame = useCurrentFrame();
  const nag = wjazd(frame, 0, 60);
  const ostatni = ekran.punkty.length - 1;
  // Kafelki wchodzą wtedy, kiedy lektor o nich mówi.
  const wejscia = useKotwice(ekran.punkty.length, { start: 10, odstep: 14 });
  const polaczenie = ekran.polaczenie ?? "kropki";
  // Wyróżniamy ostatni kafelek tylko wtedy, gdy autor sam nie ustawił stanów.
  const bezStanow = ekran.punkty.every((p) => !p.stan);
  return (
    <Tresc>
      {ekran.naglowek && (
        <div style={{ ...nag, marginBottom: 40 }}>
          <NaglowekDuzy tekst={ekran.naglowek} rozmiar={PISMO.naglowekMaly} />
        </div>
      )}
      <div>
        {ekran.punkty.map((p, i) => (
          <React.Fragment key={i}>
            {i > 0 && polaczenie !== "brak" && (
              <Lacznik opoznienie={wejscia[i] - 6} wysokosc={polaczenie === "strzalka" ? 56 : 48} strzalka={polaczenie === "strzalka"} />
            )}
            <PunktListy
              tekst={p.tekst}
              ikona={p.ikona ?? IKONY_ZAPASOWE[i % IKONY_ZAPASOWE.length]}
              opoznienie={wejscia[i]}
              zPrawej={i % 2 === 0}
              wyrozniony={bezStanow && i === ostatni && ekran.punkty.length > 2}
              stan={p.stan}
              etykieta={p.etykieta}
              pulsuje={ekran.pulsujace}
              numer={i}
            />
          </React.Fragment>
        ))}
      </div>
    </Tresc>
  );
};

const PunktListy: React.FC<{
  tekst: string;
  ikona: string;
  opoznienie: number;
  zPrawej: boolean;
  wyrozniony: boolean;
  stan?: "blad" | "ok";
  etykieta?: string;
  pulsuje?: boolean;
  numer: number;
}> = ({ tekst, ikona, opoznienie, zPrawej, wyrozniony, stan, etykieta, pulsuje, numer }) => {
  const frame = useCurrentFrame();
  const { fps } = useConfig();
  const s = wjazdZBoku(frame, opoznienie, zPrawej);
  // Każdy kafelek pulsuje w innej fazie, żeby ruch nie wyglądał mechanicznie.
  const skala = pulsuje && frame > opoznienie + 12 ? puls(frame, fps, 0.02, 1.7 + numer * 0.23) : 1;

  const kolorRamki = stan === "blad" ? KOLOR.red : stan === "ok" ? KOLOR.green : wyrozniony ? KOLOR.accent : KOLOR.line;
  const kolorTla = stan === "blad" ? "#FDF1EF" : stan === "ok" ? "#EEF7F0" : wyrozniony ? KOLOR.accentSoft : KOLOR.card;
  const kolorIkony = stan === "blad" ? "rgba(217,48,37,.12)" : stan === "ok" ? "rgba(47,158,68,.12)" : wyrozniony ? "rgba(255,255,255,.7)" : KOLOR.accentSoft;
  const kolorTekstu = stan === "blad" ? KOLOR.red : KOLOR.ink;

  return (
    <Karta
      style={{
        ...s,
        transform: `${s.transform} scale(${skala})`,
        display: "flex",
        alignItems: "center",
        gap: 24,
        padding: "30px 36px",
        backgroundColor: kolorTla,
        borderColor: kolorRamki,
        borderWidth: stan ? 3 : 2,
      }}
    >
      <div
        style={{
          width: 92,
          height: 92,
          borderRadius: PROMIEN_MALY,
          backgroundColor: kolorIkony,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 46,
          flexShrink: 0,
        }}
      >
        {ikona}
      </div>
      <div style={{ fontSize: PISMO.tresc + 4, fontWeight: 600, lineHeight: 1.25, color: kolorTekstu, flex: 1 }}>{tekst}</div>
      {etykieta && (
        <span
          style={{
            flexShrink: 0,
            border: `3px solid ${stan === "ok" ? KOLOR.green : KOLOR.red}`,
            color: stan === "ok" ? KOLOR.green : KOLOR.red,
            backgroundColor: "rgba(255,255,255,.7)",
            borderRadius: 12,
            padding: "8px 18px",
            fontSize: 28,
            fontWeight: 800,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            transform: "rotate(-3deg)",
          }}
        >
          {etykieta}
        </span>
      )}
    </Karta>
  );
};

export const EkranKarta: React.FC<{ ekran: Ek<"karta"> }> = ({ ekran }) => {
  const frame = useCurrentFrame();
  const s = pop(frame, 0);
  const t = wjazd(frame, 10, 40);
  const kolysanie = useSway(1.2, 3.2);
  return (
    <Tresc>
      <div style={{ perspective: 1600 }}>
        <div style={s}>
          <Karta uniesiona style={{ padding: 60, transform: kolysanie }}>
            {ekran.etykieta && <Stempel style={{ marginBottom: 30 }}>{ekran.etykieta}</Stempel>}
            {ekran.ikona && <div style={{ fontSize: 120, lineHeight: 1, marginBottom: 24 }}>{ekran.ikona}</div>}
            <div style={{ fontSize: PISMO.naglowek, fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.01em" }}>
              {ekran.naglowek}
            </div>
            {ekran.tekst && (
              <div style={{ ...t, fontSize: PISMO.tresc, color: KOLOR.muted, lineHeight: 1.5, marginTop: 26 }}>{ekran.tekst}</div>
            )}
          </Karta>
        </div>
      </div>
    </Tresc>
  );
};

/** Wielka liczba z licznikiem i siatką kwadracików, która pokazuje tę liczbę na oko. */
export const EkranLiczba: React.FC<{ ekran: Ek<"liczba"> }> = ({ ekran }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const wartosc = Math.round(od(frame, 4, Math.round(fps * 1.3), 0, ekran.wartosc, E.outExpo));
  const podpis = wjazd(frame, Math.round(fps * 0.5), 40);
  // Siatkę rysujemy tylko wtedy, gdy da się policzyć sztuki wzrokiem.
  const ile = Math.round(ekran.wartosc);
  const pokazSiatke = ile >= 5 && ile <= 40 && !ekran.sufiks?.includes("%");
  return (
    <Tresc style={{ alignItems: "center", textAlign: "center" }}>
      <div
        style={{
          fontFamily: CZCIONKA.naglowek,
          fontSize: PISMO.liczba,
          lineHeight: 1,
          color: KOLOR.accent,
          letterSpacing: "-0.03em",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {ekran.prefiks}
        {wartosc.toLocaleString("pl-PL")}
        {ekran.sufiks}
      </div>
      <div style={{ ...podpis, fontSize: 48, fontWeight: 600, marginTop: 24, color: KOLOR.inkSoft, maxWidth: 860 }}>
        {ekran.podpis}
      </div>
      {pokazSiatke && <SiatkaSztuk ile={ile} startKlatka={Math.round(fps * 0.4)} />}
    </Tresc>
  );
};

const SiatkaSztuk: React.FC<{ ile: number; startKlatka: number }> = ({ ile, startKlatka }) => {
  const frame = useCurrentFrame();
  const kolumny = ile <= 12 ? 4 : ile <= 24 ? 6 : 8;
  const bok = ile <= 12 ? 92 : ile <= 24 ? 76 : 62;
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${kolumny}, ${bok}px)`,
        gap: 14,
        justifyContent: "center",
        marginTop: 48,
      }}
    >
      {Array.from({ length: ile }, (_, i) => {
        const wejscie = startKlatka + Math.floor(i * (26 / Math.max(1, ile)));
        const p = postep(frame, wejscie, wejscie + 7, E.outBack);
        return (
          <span
            key={i}
            style={{
              width: bok,
              height: bok,
              borderRadius: 10,
              backgroundColor: KOLOR.accent,
              opacity: p,
              transform: `scale(${0.4 + 0.6 * p})`,
            }}
          />
        );
      })}
    </div>
  );
};

export const EkranPorownanie: React.FC<{ ekran: Ek<"porownanie"> }> = ({ ekran }) => {
  const wejscia = useKotwice(2, { start: 0, odstep: 16 });
  return (
    <Tresc>
      <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
        <Kolumna dane={ekran.lewo} opoznienie={wejscia[0]} domyslnieZle zPrawej={false} />
        <Kolumna dane={ekran.prawo} opoznienie={wejscia[1]} zPrawej />
      </div>
    </Tresc>
  );
};

const Kolumna: React.FC<{
  dane: { naglowek: string; punkty: string[]; zle?: boolean };
  opoznienie: number;
  domyslnieZle?: boolean;
  zPrawej: boolean;
}> = ({ dane, opoznienie, domyslnieZle, zPrawej }) => {
  const frame = useCurrentFrame();
  const zle = dane.zle ?? domyslnieZle ?? false;
  const s = wjazdZBoku(frame, opoznienie, zPrawej);
  return (
    <Karta style={{ ...s, borderColor: zle ? KOLOR.line : KOLOR.accent, borderWidth: 3 }}>
      <div style={{ fontSize: PISMO.tytulKarty, fontWeight: 800, marginBottom: 20, color: zle ? KOLOR.muted : KOLOR.accent }}>
        {zle ? "✕ " : "✓ "}
        {dane.naglowek}
      </div>
      {dane.punkty.map((p, i) => (
        <div
          key={i}
          style={{
            fontSize: PISMO.tresc,
            lineHeight: 1.45,
            color: zle ? KOLOR.muted : KOLOR.ink,
            textDecoration: zle ? "line-through" : "none",
            marginBottom: 6,
          }}
        >
          {zle ? "– " : "• "}
          {p}
        </div>
      ))}
    </Karta>
  );
};

export const EkranCta: React.FC<{ ekran: Ek<"cta"> }> = ({ ekran }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const nag = wjazd(frame, 0, 60);
  const przycisk = stempel(frame, 10, -2);
  const dop = wjazd(frame, 24, 40);
  const p = puls(frame, fps, 0.015, 1.8);
  // Długi adres musi zmieścić się w kadrze, więc pismo maleje wraz z liczbą znaków.
  const dlugosc = ekran.przycisk.length;
  const rozmiarCta = dlugosc > 26 ? 44 : dlugosc > 20 ? 52 : PISMO.cta;
  const bokiCta = dlugosc > 26 ? 44 : dlugosc > 20 ? 58 : 76;
  return (
    <Tresc style={{ alignItems: "center", textAlign: "center" }}>
      <div style={{ ...nag, marginBottom: 46 }}>
        <NaglowekDuzy tekst={ekran.naglowek} rozmiar={PISMO.naglowek} />
      </div>
      <div
        style={{
          opacity: przycisk.opacity,
          transform: `${przycisk.transform} scale(${p})`,
          backgroundColor: KOLOR.accent,
          color: "#fff",
          fontSize: rozmiarCta,
          fontWeight: 800,
          padding: `36px ${bokiCta}px`,
          borderRadius: PROMIEN_MALY,
          boxShadow: CIEN_NAKLEJKI,
          maxWidth: "100%",
          boxSizing: "border-box",
          wordBreak: "break-word",
        }}
      >
        {ekran.przycisk}
      </div>
      {ekran.dopisek && <Dopisek style={{ ...dop, marginTop: 44, fontSize: 56 }}>{ekran.dopisek}</Dopisek>}
    </Tresc>
  );
};

export const EkranKod: React.FC<{ ekran: Ek<"kod"> }> = ({ ekran }) => {
  const frame = useCurrentFrame();
  const nag = wjazd(frame, 0, 50);
  const okno = wjazd(frame, 6, 60);
  const wejscia = useKotwice(ekran.linie.length, { start: 12, odstep: 14 });
  const kolysanie = useSway(0.8, 3.4);
  return (
    <Tresc>
      {ekran.naglowek && (
        <div style={{ ...nag, marginBottom: 34 }}>
          <NaglowekDuzy tekst={ekran.naglowek} rozmiar={PISMO.naglowekMaly} />
        </div>
      )}
      <div style={{ perspective: 1600 }}>
        <div style={okno}>
          <div
            style={{
              backgroundColor: KOLOR.ink,
              borderRadius: PROMIEN,
              boxShadow: "0 6px 10px rgba(20,20,20,.06), 0 36px 90px rgba(20,20,20,.12)",
              overflow: "hidden",
              fontFamily: CZCIONKA.kod,
              transform: kolysanie,
            }}
          >
            <div style={{ display: "flex", gap: 14, padding: "22px 28px", backgroundColor: "#2A2A2A", alignItems: "center" }}>
              {["#FF5F57", "#FEBC2E", "#28C840"].map((k) => (
                <span key={k} style={{ width: 22, height: 22, borderRadius: 999, backgroundColor: k }} />
              ))}
              <span style={{ color: "#999", fontSize: 30, marginLeft: 16 }}>{ekran.tytul ?? "terminal"}</span>
            </div>
            <div style={{ padding: "30px 34px", fontSize: PISMO.kod, lineHeight: 1.75, color: "#F4F1EA" }}>
              {ekran.linie.map((linia, i) => {
                const start = wejscia[i];
                const znaki = Array.from(linia);
                const widoczne = Math.max(0, Math.min(znaki.length, Math.floor((frame - start) * 1.6)));
                return (
                  <div key={i} style={{ minHeight: "1.75em" }}>
                    <span style={{ color: KOLOR.accent }}>{"› "}</span>
                    {znaki.slice(0, widoczne).join("")}
                    {widoczne < znaki.length && frame >= start && (
                      <span style={{ opacity: frame % 16 < 8 ? 1 : 0, marginLeft: 2 }}>▌</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </Tresc>
  );
};
