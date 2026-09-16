import React, { createContext, useContext } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import {
  CIEN_KARTY,
  CZCIONKA,
  KOLOR,
  MARGINES,
  PISMO,
  PROMIEN,
  PROMIEN_MALY,
  SAFE,
  SIATKA_DRYF_PX_S,
  SIATKA_PX,
} from "../marka";
import { E, postep, sway as swayTransform } from "../ruch";
import type { Slowo } from "../typy";
import { kotwice } from "../kotwice";

/** Kremowe tło z kratką, która powoli płynie w górę. Ekran nigdy nie stoi martwy. */
export const Tlo: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dryf = ((frame / fps) * SIATKA_DRYF_PX_S) % SIATKA_PX;
  return (
    <AbsoluteFill
      style={{
        backgroundColor: KOLOR.paper,
        backgroundImage:
          "linear-gradient(rgba(20,20,20,0.05) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(20,20,20,0.05) 1.5px, transparent 1.5px)",
        backgroundSize: `${SIATKA_PX}px ${SIATKA_PX}px`,
        backgroundPosition: `0px ${-dryf}px`,
        fontFamily: CZCIONKA.tekst,
        color: KOLOR.ink,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

/** Słowa lektora bieżącej sceny. Dzięki nim elementy wchodzą w rytm wypowiedzi. */
export const KontekstSlow = createContext<Slowo[] | undefined>(undefined);

/**
 * Klatki wejścia dla kolejnych elementów sceny, dopasowane do tego, co mówi lektor.
 * Bez nagrania wraca do równych odstępów.
 */
export function useKotwice(ile: number, opcje?: { start?: number; odstep?: number }): number[] {
  const slowa = useContext(KontekstSlow);
  return kotwice(ile, slowa, opcje);
}

/** Informacja, czy scena ma na dole pasek napisów (wtedy treść ma mniej miejsca). */
export const KontekstNapisow = createContext(false);

/** Wysokość paska napisów wraz z odstępem. */
export const PAS_NAPISOW = 250;

/** Obszar treści w bezpiecznym polu kadru. */
export const Tresc: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => {
  const zNapisami = useContext(KontekstNapisow);
  return (
  <AbsoluteFill
    style={{
      top: SAFE.gora,
      height: SAFE.dol - SAFE.gora - (zNapisami ? PAS_NAPISOW : 0),
      paddingLeft: MARGINES,
      paddingRight: MARGINES,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      ...style,
    }}
  >
    {children}
  </AbsoluteFill>
  );
};

/** Kreska akcentu z podpisem. Zapowiada temat sceny nad nagłówkiem. */
export const Kicker: React.FC<{ children: React.ReactNode; opoznienie?: number; style?: React.CSSProperties }> = ({
  children,
  opoznienie = 0,
  style,
}) => {
  const frame = useCurrentFrame();
  const szer = postep(frame, opoznienie, opoznienie + 10, E.outQuint);
  const o = postep(frame, opoznienie, opoznienie + 6, E.lin);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 22, opacity: o, ...style }}>
      <span style={{ width: 66 * szer, height: 6, backgroundColor: KOLOR.accent, borderRadius: 3, flexShrink: 0 }} />
      <span
        style={{
          fontSize: PISMO.kicker,
          fontWeight: 700,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: KOLOR.inkSoft,
        }}
      >
        {children}
      </span>
    </div>
  );
};

/** Biała karta marki. */
export const Karta: React.FC<{ style?: React.CSSProperties; uniesiona?: boolean; children: React.ReactNode }> = ({
  style,
  uniesiona,
  children,
}) => (
  <div
    style={{
      backgroundColor: KOLOR.card,
      border: `2px solid ${KOLOR.line}`,
      borderRadius: PROMIEN,
      boxShadow: uniesiona ? "0 6px 10px rgba(20,20,20,.06), 0 36px 90px rgba(20,20,20,.12)" : CIEN_KARTY,
      padding: 44,
      ...style,
    }}
  >
    {children}
  </div>
);

/** Pigułka z tekstem, jak etykiety na stronie. */
export const Chip: React.FC<{ children: React.ReactNode; style?: React.CSSProperties; zGwiazdka?: boolean }> = ({
  children,
  style,
  zGwiazdka = true,
}) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 16,
      backgroundColor: KOLOR.card,
      border: `2px solid ${KOLOR.line}`,
      borderRadius: PROMIEN_MALY,
      padding: "26px 46px",
      fontSize: PISMO.chip,
      fontWeight: 600,
      boxShadow: CIEN_KARTY,
      ...style,
    }}
  >
    {zGwiazdka && <span style={{ color: KOLOR.accent }}>✦</span>}
    {children}
  </span>
);

/** Pieczątka z obrysem w kolorze akcentu. */
export const Stempel: React.FC<{ children: React.ReactNode; zielony?: boolean; style?: React.CSSProperties }> = ({
  children,
  zielony,
  style,
}) => (
  <span
    style={{
      display: "inline-block",
      border: `4px solid ${zielony ? KOLOR.green : KOLOR.accent}`,
      color: zielony ? KOLOR.green : KOLOR.accent,
      backgroundColor: "rgba(255,255,255,.7)",
      borderRadius: 14,
      padding: "14px 28px",
      fontSize: 34,
      fontWeight: 800,
      letterSpacing: "0.14em",
      textTransform: "uppercase",
      ...style,
    }}
  >
    {children}
  </span>
);

/** Odręczny dopisek. */
export const Dopisek: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div
    style={{
      fontFamily: CZCIONKA.odreczna,
      color: KOLOR.accent,
      fontSize: 64,
      fontWeight: 600,
      transform: "rotate(-2deg)",
      lineHeight: 1.1,
      ...style,
    }}
  >
    {children}
  </div>
);

/**
 * Zakreślacz, który zamalowuje tekst od lewej.
 * Litery zmieniają kolor dokładnie na krawędzi pociągnięcia, bez mrugnięcia.
 */
export const Zakreslenie: React.FC<{
  children: string;
  opoznienie?: number;
  klatki?: number;
  mocny?: boolean;
}> = ({ children, opoznienie = 0, klatki = 12, mocny = true }) => {
  const frame = useCurrentFrame();
  // Każde słowo dostaje własny pasek, dzięki czemu długa fraza zawija się jak zwykły tekst.
  const slowa = children.split(/(\s+)/);
  const ileSlow = slowa.filter((w) => w.trim()).length || 1;
  const naSlowo = Math.max(4, Math.round(klatki / ileSlow));
  let licznik = -1;
  return (
    <>
      {slowa.map((slowo, i) => {
        if (!slowo.trim()) return <span key={i}> </span>;
        licznik += 1;
        const start = opoznienie + licznik * naSlowo;
        const p = postep(frame, start, start + naSlowo + 4, E.outCubic);
        return (
          <span key={i} style={{ position: "relative", display: "inline-block" }}>
            <span
              style={{
                position: "absolute",
                left: "-0.14em",
                right: "-0.14em",
                top: "-0.04em",
                bottom: "-0.08em",
                backgroundColor: mocny ? KOLOR.accent : "rgba(232,89,12,.32)",
                borderRadius: 8,
                transformOrigin: "left center",
                transform: `scaleX(${p})`,
              }}
            />
            {mocny ? (
              <>
                <span style={{ position: "relative", color: KOLOR.ink }}>{slowo}</span>
                <span
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    color: "#fff",
                    clipPath: `inset(-20% ${100 - p * 100}% -20% -20%)`,
                  }}
                >
                  {slowo}
                </span>
              </>
            ) : (
              <span style={{ position: "relative" }}>{slowo}</span>
            )}
          </span>
        );
      })}
    </>
  );
};

/** Kołysanie dla elementu, który długo stoi na ekranie. */
export function useSway(amplituda = 1.4, okres = 2.6, faza = 0): string {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return swayTransform(frame, fps, amplituda, okres, faza);
}

/** Podpis marki u góry kadru, w bezpiecznym polu. */
export const Podpis: React.FC = () => (
  <div
    style={{
      position: "absolute",
      top: SAFE.gora - 76,
      left: 0,
      right: 0,
      textAlign: "center",
      fontSize: PISMO.drobne,
      fontWeight: 700,
      letterSpacing: "0.28em",
      textTransform: "uppercase",
      color: KOLOR.muted,
    }}
  >
    Akademia Automatyzacji
  </div>
);

/** Pionowe połączenie dwóch kafelków: kropkowana linia albo strzałka w dół. */
export const Lacznik: React.FC<{ wysokosc?: number; opoznienie?: number; strzalka?: boolean }> = ({
  wysokosc = 56,
  opoznienie = 0,
  strzalka = false,
}) => {
  const frame = useCurrentFrame();
  const p = postep(frame, opoznienie, opoznienie + 8, E.outCubic);
  const dlugosc = strzalka ? wysokosc - 18 : wysokosc;
  return (
    <div style={{ height: wysokosc, display: "flex", justifyContent: "center", alignItems: "center", position: "relative" }}>
      {!strzalka && (
        <span style={{ position: "absolute", top: 0, width: 14, height: 14, borderRadius: 999, backgroundColor: KOLOR.accent, opacity: p }} />
      )}
      <span
        style={{
          position: "absolute",
          top: 0,
          width: 0,
          height: dlugosc * p,
          borderLeft: `4px ${strzalka ? "solid" : "dashed"} ${KOLOR.accent}`,
        }}
      />
      {strzalka ? (
        // Grot strzałki rysowany trójkątem z obramowania.
        <span
          style={{
            position: "absolute",
            bottom: 0,
            width: 0,
            height: 0,
            borderLeft: "13px solid transparent",
            borderRight: "13px solid transparent",
            borderTop: `18px solid ${KOLOR.accent}`,
            opacity: p,
          }}
        />
      ) : (
        <span style={{ position: "absolute", bottom: 0, width: 14, height: 14, borderRadius: 999, backgroundColor: KOLOR.accent, opacity: p }} />
      )}
    </div>
  );
};
