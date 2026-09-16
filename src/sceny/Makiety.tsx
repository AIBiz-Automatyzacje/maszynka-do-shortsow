import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import type { Ekran } from "../typy";
import { CIEN_NAKLEJKI, CIEN_UNIESIONY, CZCIONKA, KOLOR, PISMO, PROMIEN, PROMIEN_MALY } from "../marka";
import { Dopisek, Karta, Kicker, Tresc, useKotwice, useSway } from "./wspolne";
import { E, pop, postep, puls, wjazd } from "../ruch";

type Ek<T extends Ekran["typ"]> = Extract<Ekran, { typ: T }>;

/** Nagłówek nad makietą. */
const NaglowekSceny: React.FC<{ tekst?: string; etykieta?: string }> = ({ tekst, etykieta }) => {
  const frame = useCurrentFrame();
  const s = wjazd(frame, 0, 50);
  if (!tekst && !etykieta) return null;
  return (
    <div style={{ marginBottom: 34 }}>
      {etykieta && <Kicker style={{ marginBottom: 20 }}>{etykieta}</Kicker>}
      {tekst && (
        <div
          style={{
            ...s,
            fontFamily: CZCIONKA.naglowek,
            fontSize: PISMO.naglowekMaly,
            lineHeight: 1.02,
            textTransform: "uppercase",
            letterSpacing: "-0.01em",
          }}
        >
          {tekst}
        </div>
      )}
    </div>
  );
};

/**
 * Kursor myszy z białą obwódką, widoczny na każdym tle.
 * Przyjeżdża do celu, klika, a po kliknięciu rozchodzi się pierścień.
 */
const Kursor: React.FC<{ x: number; y: number; klik: number }> = ({ x, y, klik }) => {
  const frame = useCurrentFrame();
  const dojazd = postep(frame, klik - 16, klik, E.outCubic);
  const p = postep(frame, klik, klik + 10, E.outCubic);
  if (frame < klik - 18) return null;
  const px = x + (1 - dojazd) * 220;
  const py = y + (1 - dojazd) * 160;
  return (
    <div style={{ position: "absolute", left: px, top: py, zIndex: 5, pointerEvents: "none", opacity: Math.min(1, dojazd * 3) }}>
      {frame >= klik && p < 1 && (
        <span
          style={{
            position: "absolute",
            left: -26,
            top: -26,
            width: 64,
            height: 64,
            borderRadius: 999,
            border: `6px solid ${KOLOR.accent}`,
            transform: `scale(${0.35 + 0.85 * p})`,
            opacity: 1 - p,
          }}
        />
      )}
      <svg width="46" height="56" viewBox="0 0 24 30" style={{ filter: "drop-shadow(0 4px 8px rgba(20,20,20,.35))" }}>
        <path d="M3 2 L3 22 L8.5 17 L12 25.5 L15.5 24 L12 15.5 L19 15.5 Z" fill={KOLOR.ink} stroke="#fff" strokeWidth="1.7" />
      </svg>
    </div>
  );
};

/** Pasek stanu telefonu: godzina, zasięg, wifi, bateria. */
const PasekStanu: React.FC = () => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "0 34px",
      height: 64,
      fontSize: 26,
      fontWeight: 700,
      color: KOLOR.ink,
    }}
  >
    <span>9:41</span>
    <svg width="86" height="18" viewBox="0 0 120 24" fill={KOLOR.ink}>
      <rect x="0" y="14" width="4" height="8" rx="1" />
      <rect x="7" y="10" width="4" height="12" rx="1" />
      <rect x="14" y="6" width="4" height="16" rx="1" />
      <rect x="21" y="2" width="4" height="20" rx="1" />
      <path d="M35 9 a13 13 0 0 1 16 0" stroke={KOLOR.ink} strokeWidth="3.4" fill="none" strokeLinecap="round" />
      <path d="M39 14 a7 7 0 0 1 8 0" stroke={KOLOR.ink} strokeWidth="3.4" fill="none" strokeLinecap="round" />
      <circle cx="43" cy="19" r="2" />
      <rect x="84" y="4" width="32" height="16" rx="5" stroke={KOLOR.ink} strokeWidth="2" fill="none" />
      <rect x="87" y="7" width="21" height="10" rx="3" />
      <rect x="117" y="9" width="3" height="6" rx="1.5" />
    </svg>
  </div>
);

export const EkranTelefon: React.FC<{ ekran: Ek<"telefon"> }> = ({ ekran }) => {
  const frame = useCurrentFrame();
  const wejscie = pop(frame, 2, 14);
  const kolysanie = useSway(1.1, 3.4);
  const wiersze = ekran.wiersze ?? [];
  const wejscia = useKotwice(wiersze.length + (ekran.powiadomienie ? 1 : 0), { start: 14, odstep: 10 });
  const startWierszy = ekran.powiadomienie ? 1 : 0;
  const pow = ekran.powiadomienie ? postep(frame, wejscia[0], wejscia[0] + 12, E.outBack) : 0;

  return (
    <Tresc style={{ alignItems: "stretch" }}>
      <NaglowekSceny tekst={ekran.naglowek} etykieta={ekran.etykieta} />
      <div style={{ perspective: 1600, display: "flex", justifyContent: "center", flex: 1, minHeight: 0 }}>
        <div style={{ ...wejscie, height: "100%", display: "flex", justifyContent: "center" }}>
          <div
            style={{
              height: "100%",
              maxWidth: 560,
              aspectRatio: "9 / 19",
              backgroundColor: KOLOR.ink,
              borderRadius: 86,
              boxShadow: `${CIEN_UNIESIONY}, inset 0 0 0 5px #3A3A3A`,
              padding: 14,
              position: "relative",
              transform: kolysanie,
            }}
          >
            {/* Wysepka z aparatem */}
            <div
              style={{
                position: "absolute",
                top: 26,
                left: "50%",
                marginLeft: -78,
                width: 156,
                height: 44,
                borderRadius: 999,
                backgroundColor: KOLOR.ink,
                zIndex: 4,
              }}
            />
            <div
              style={{
                height: "100%",
                backgroundColor: KOLOR.paper,
                borderRadius: 72,
                overflow: "hidden",
                position: "relative",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <PasekStanu />
              {ekran.tytulEkranu && (
                <div style={{ padding: "12px 32px 8px", fontSize: 40, fontWeight: 800, letterSpacing: "-0.01em" }}>
                  {ekran.tytulEkranu}
                </div>
              )}
              <div
                style={{
                  padding: "8px 26px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                  flex: 1,
                  marginTop: ekran.powiadomienie ? 150 : 0,
                }}
              >
                {wiersze.map((w, i) => {
                  const k = wejscia[startWierszy + i] ?? 14 + i * 10;
                  const s = wjazd(frame, k, 26, 10);
                  return (
                    <div
                      key={i}
                      style={{
                        ...s,
                        display: "flex",
                        alignItems: "center",
                        gap: 16,
                        backgroundColor: KOLOR.card,
                        border: `2px solid ${KOLOR.line}`,
                        borderRadius: 22,
                        padding: "16px 18px",
                      }}
                    >
                      <span
                        style={{
                          width: 62,
                          height: 62,
                          borderRadius: 18,
                          backgroundColor: KOLOR.accentSoft,
                          display: "grid",
                          placeItems: "center",
                          fontSize: 30,
                          flexShrink: 0,
                        }}
                      >
                        {w.ikona ?? "•"}
                      </span>
                      <span style={{ minWidth: 0 }}>
                        <span style={{ display: "block", fontSize: 30, fontWeight: 700, lineHeight: 1.2 }}>{w.tytul}</span>
                        {w.podtytul && (
                          <span style={{ display: "block", fontSize: 25, color: KOLOR.muted, lineHeight: 1.25 }}>{w.podtytul}</span>
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
              {ekran.przycisk && (
                <div style={{ padding: "0 22px 30px" }}>
                  <div
                    style={{
                      backgroundColor: KOLOR.accent,
                      color: "#fff",
                      textAlign: "center",
                      padding: "20px 0",
                      borderRadius: 999,
                      fontSize: 32,
                      fontWeight: 700,
                      boxShadow: "0 6px 16px rgba(232,89,12,.3)",
                    }}
                  >
                    {ekran.przycisk}
                  </div>
                </div>
              )}
              {/* Powiadomienie wsuwa się od góry */}
              {ekran.powiadomienie && (
                <div
                  style={{
                    position: "absolute",
                    top: 78,
                    left: 18,
                    right: 18,
                    backgroundColor: "rgba(255,255,255,.96)",
                    borderRadius: 26,
                    boxShadow: "0 10px 30px rgba(20,20,20,.18)",
                    padding: "18px 20px",
                    transform: `translateY(${(1 - pow) * -180}px)`,
                    opacity: pow,
                    zIndex: 3,
                  }}
                >
                  <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 5 }}>{ekran.powiadomienie.tytul}</div>
                  <div style={{ fontSize: 27, color: KOLOR.inkSoft, lineHeight: 1.3 }}>{ekran.powiadomienie.tekst}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Tresc>
  );
};

export const EkranCzat: React.FC<{ ekran: Ek<"czat"> }> = ({ ekran }) => {
  const frame = useCurrentFrame();
  const wejscia = useKotwice(ekran.wiadomosci.length, { start: 8, odstep: 16 });
  const okno = pop(frame, 0, 12);
  return (
    <Tresc>
      <NaglowekSceny tekst={ekran.naglowek} etykieta={ekran.etykieta} />
      <div style={{ ...okno }}>
        <div
          style={{
            backgroundColor: KOLOR.card,
            border: `2px solid ${KOLOR.line}`,
            borderRadius: PROMIEN,
            boxShadow: CIEN_UNIESIONY,
            overflow: "hidden",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 18, padding: "22px 28px", borderBottom: `2px solid ${KOLOR.line}` }}>
            <span
              style={{
                width: 66,
                height: 66,
                borderRadius: 999,
                backgroundColor: KOLOR.accentSoft,
                color: KOLOR.accent,
                display: "grid",
                placeItems: "center",
                fontSize: 30,
                fontWeight: 800,
              }}
            >
              {(ekran.rozmowca ?? "A").slice(0, 1).toUpperCase()}
            </span>
            <span>
              <span style={{ display: "block", fontSize: 34, fontWeight: 700 }}>{ekran.rozmowca ?? "Rozmowa"}</span>
              <span style={{ display: "block", fontSize: 24, color: KOLOR.green }}>online</span>
            </span>
          </div>
          <div style={{ padding: "26px 26px 30px", display: "flex", flexDirection: "column", gap: 18, backgroundColor: KOLOR.paper2 }}>
            {ekran.wiadomosci.map((w, i) => {
              const k = wejscia[i];
              const p = postep(frame, k, k + 9, E.outBack);
              if (p <= 0) return <div key={i} style={{ height: 0 }} />;
              return (
                <div key={i} style={{ display: "flex", justifyContent: w.odNas ? "flex-end" : "flex-start" }}>
                  <div
                    style={{
                      maxWidth: "78%",
                      backgroundColor: w.odNas ? KOLOR.accent : KOLOR.card,
                      color: w.odNas ? "#fff" : KOLOR.ink,
                      borderRadius: w.odNas ? "26px 8px 26px 26px" : "8px 26px 26px 26px",
                      padding: "20px 26px",
                      fontSize: 34,
                      lineHeight: 1.35,
                      boxShadow: "0 2px 5px rgba(20,20,20,.08)",
                      transform: `scale(${0.85 + 0.15 * p})`,
                      opacity: Math.min(1, p * 1.6),
                      transformOrigin: w.odNas ? "right bottom" : "left bottom",
                    }}
                  >
                    {w.tekst}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Tresc>
  );
};

export const EkranPrzegladarka: React.FC<{ ekran: Ek<"przegladarka"> }> = ({ ekran }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const okno = wjazd(frame, 2, 70);
  const tresc = wjazd(frame, 14, 30);
  const wejscia = useKotwice(2, { start: 14, odstep: 18 });
  const przyciskP = postep(frame, wejscia[1], wejscia[1] + 10, E.outBack);
  const p = puls(frame, fps, 0.015, 1.8);
  const kolysanie = useSway(0.9, 3.6);
  return (
    <Tresc>
      <NaglowekSceny tekst={ekran.naglowek} etykieta={ekran.etykieta} />
      <div style={{ perspective: 1600 }}>
        <div style={okno}>
          <div
            style={{
              backgroundColor: KOLOR.card,
              borderRadius: PROMIEN,
              boxShadow: CIEN_UNIESIONY,
              overflow: "hidden",
              border: `2px solid ${KOLOR.line}`,
              transform: kolysanie,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                padding: "20px 24px",
                backgroundColor: KOLOR.paper2,
                borderBottom: `2px solid ${KOLOR.line}`,
              }}
            >
              {["#FF5F57", "#FEBC2E", "#28C840"].map((k) => (
                <span key={k} style={{ width: 20, height: 20, borderRadius: 999, backgroundColor: k }} />
              ))}
              <span
                style={{
                  flex: 1,
                  marginLeft: 12,
                  backgroundColor: KOLOR.card,
                  borderRadius: 999,
                  padding: "10px 24px",
                  fontSize: 26,
                  color: KOLOR.inkSoft,
                  border: `2px solid ${KOLOR.line}`,
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                }}
              >
                {ekran.adres}
              </span>
            </div>
            <div style={{ padding: 34 }}>
              {ekran.obrazTekst && (
                <div
                  style={{
                    ...tresc,
                    backgroundColor: KOLOR.paper2,
                    border: `2px solid ${KOLOR.line}`,
                    borderRadius: PROMIEN_MALY,
                    height: 260,
                    display: "grid",
                    placeItems: "center",
                    textAlign: "center",
                    padding: 24,
                    fontSize: 34,
                    fontWeight: 700,
                    color: KOLOR.muted,
                    marginBottom: 28,
                  }}
                >
                  {ekran.obrazTekst}
                </div>
              )}
              <div style={{ ...tresc, fontSize: 44, fontWeight: 800, lineHeight: 1.2, marginBottom: ekran.opis ? 14 : 26 }}>
                {ekran.tytulStrony}
              </div>
              {ekran.opis && (
                <div style={{ ...tresc, fontSize: 32, color: KOLOR.muted, lineHeight: 1.4, marginBottom: 28 }}>{ekran.opis}</div>
              )}
              {ekran.przycisk && (
                <div
                  style={{
                    display: "inline-block",
                    backgroundColor: KOLOR.accent,
                    color: "#fff",
                    fontSize: 38,
                    fontWeight: 800,
                    padding: "24px 44px",
                    borderRadius: PROMIEN_MALY,
                    boxShadow: CIEN_NAKLEJKI,
                    opacity: przyciskP,
                    transform: `scale(${(0.6 + 0.4 * przyciskP) * p})`,
                  }}
                >
                  {ekran.przycisk}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Tresc>
  );
};

export const EkranFormularz: React.FC<{ ekran: Ek<"formularz"> }> = ({ ekran }) => {
  const frame = useCurrentFrame();
  const okno = pop(frame, 0, 12);
  // Każde pole ma swój moment wpisywania, ostatnia kotwica to kliknięcie przycisku.
  const wejscia = useKotwice(ekran.pola.length + 1, { start: 10, odstep: 20 });
  const klik = wejscia[ekran.pola.length];
  const wcisniety = frame >= klik && frame < klik + 5;
  const potwierdzenieP = postep(frame, klik + 8, klik + 20, E.outBack);

  return (
    <Tresc>
      <NaglowekSceny tekst={ekran.naglowek} etykieta={ekran.etykieta} />
      <div style={{ position: "relative" }}>
        <Karta uniesiona style={{ ...okno, padding: 44 }}>
          {ekran.tytul && <div style={{ fontSize: 44, fontWeight: 800, marginBottom: 28 }}>{ekran.tytul}</div>}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {ekran.pola.map((pole, i) => {
              const start = wejscia[i];
              const znaki = Array.from(pole.wartosc);
              const widoczne = Math.max(0, Math.min(znaki.length, Math.floor((frame - start) * 1.5)));
              const pisze = frame >= start && widoczne < znaki.length;
              return (
                <div key={i}>
                  <div style={{ fontSize: 26, fontWeight: 600, color: KOLOR.muted, marginBottom: 8 }}>{pole.etykieta}</div>
                  <div
                    style={{
                      border: `2px solid ${pisze ? KOLOR.accent : KOLOR.lineStrong}`,
                      borderRadius: PROMIEN_MALY,
                      padding: "20px 24px",
                      fontSize: 36,
                      minHeight: 78,
                      backgroundColor: KOLOR.paper,
                      color: KOLOR.ink,
                    }}
                  >
                    {znaki.slice(0, widoczne).join("")}
                    {pisze && <span style={{ opacity: frame % 16 < 8 ? 1 : 0 }}>|</span>}
                  </div>
                </div>
              );
            })}
          </div>
          <div
            style={{
              marginTop: 32,
              display: "inline-block",
              backgroundColor: KOLOR.accent,
              color: "#fff",
              fontSize: 40,
              fontWeight: 800,
              padding: "24px 48px",
              borderRadius: PROMIEN_MALY,
              boxShadow: wcisniety ? "2px 2px 0 rgba(232,89,12,.25)" : CIEN_NAKLEJKI,
              transform: wcisniety ? "scale(0.96) translate(3px, 3px)" : "scale(1)",
            }}
          >
            {ekran.przycisk}
          </div>
          {ekran.potwierdzenie && potwierdzenieP > 0 && (
            <div
              style={{
                marginTop: 26,
                display: "flex",
                alignItems: "center",
                gap: 14,
                color: KOLOR.green,
                fontSize: 34,
                fontWeight: 700,
                opacity: potwierdzenieP,
                transform: `translateY(${(1 - potwierdzenieP) * 16}px)`,
              }}
            >
              <span>✓</span>
              {ekran.potwierdzenie}
            </div>
          )}
        </Karta>
        {/* Kursor celuje w środek przycisku: karta ma 44 px marginesu, pola po 118 px wysokości. */}
        <Kursor
          x={44 + 110}
          y={44 + (ekran.tytul ? 72 : 0) + ekran.pola.length * 118 + 32 + 44}
          klik={klik}
        />
      </div>
      {ekran.dopisek && <Dopisek style={{ marginTop: 30 }}>{ekran.dopisek}</Dopisek>}
    </Tresc>
  );
};
