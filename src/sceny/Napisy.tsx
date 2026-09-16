import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import type { Slowo } from "../typy";
import { CIEN_KARTY, CZCIONKA, KOLOR, SAFE } from "../marka";
import { szacujCzasLektora } from "../czas";

const MAX_SLOW_W_LINII = 5;
const MAX_ZNAKOW_W_LINII = 30;
const MAX_CZAS_LINII = 2.4;

type Linia = { slowa: Slowo[]; start: number; koniec: number };

/** Dzieli wypowiedź na krótkie linie: po zdaniu, po pięciu słowach albo po 2,4 sekundy. */
function podzielNaLinie(slowa: Slowo[]): Linia[] {
  const linie: Linia[] = [];
  let biezaca: Slowo[] = [];
  for (const s of slowa) {
    const start = biezaca[0]?.start ?? s.start;
    const konczyZdanie = /[.!?…]$/.test(biezaca[biezaca.length - 1]?.tekst ?? "");
    const znaki = biezaca.reduce((n, w) => n + w.tekst.length + 1, 0) + s.tekst.length;
    if (
      biezaca.length > 0 &&
      (biezaca.length >= MAX_SLOW_W_LINII || znaki > MAX_ZNAKOW_W_LINII || s.koniec - start > MAX_CZAS_LINII || konczyZdanie)
    ) {
      linie.push({ slowa: biezaca, start, koniec: biezaca[biezaca.length - 1].koniec });
      biezaca = [];
    }
    biezaca.push(s);
  }
  if (biezaca.length) linie.push({ slowa: biezaca, start: biezaca[0].start, koniec: biezaca[biezaca.length - 1].koniec });
  // Pojedyncze słowo w ostatniej linii wygląda jak sierota: dołącz je do poprzedniej.
  if (linie.length > 1 && linie[linie.length - 1].slowa.length === 1) {
    const sierota = linie.pop()!;
    const poprzednia = linie[linie.length - 1];
    poprzednia.slowa = [...poprzednia.slowa, ...sierota.slowa];
    poprzednia.koniec = sierota.koniec;
  }
  return linie;
}

/** Gdy nie ma jeszcze nagrania, rozkłada słowa równo w czasie. Tylko do podglądu. */
function szacujSlowa(tekst: string): Slowo[] {
  const czesci = tekst.trim().split(/\s+/).filter(Boolean);
  const calosc = szacujCzasLektora(tekst);
  const naSlowo = czesci.length ? calosc / czesci.length : 0;
  return czesci.map((t, i) => ({ tekst: t, start: i * naSlowo, koniec: (i + 1) * naSlowo }));
}

export const Napisy: React.FC<{ slowa?: Slowo[]; lektor: string }> = ({ slowa, lektor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const lista = slowa && slowa.length ? slowa : szacujSlowa(lektor);
  if (!lista.length) return null;

  const linie = podzielNaLinie(lista);
  const linia = linie.find((l, i) =>
    t >= l.start - 0.05 && (i === linie.length - 1 ? t <= l.koniec + 0.6 : t < linie[i + 1].start),
  );
  if (!linia) return null;

  return (
    <div
      style={{
        position: "absolute",
        left: 70,
        right: 70,
        bottom: 1920 - SAFE.dol + 30,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          rowGap: 10,
          backgroundColor: KOLOR.card,
          border: `2px solid ${KOLOR.line}`,
          borderRadius: 30,
          boxShadow: CIEN_KARTY,
          padding: "22px 30px",
          maxWidth: 880,
          fontFamily: CZCIONKA.tekst,
          fontWeight: 800,
          fontSize: 48,
          lineHeight: 1.22,
          color: KOLOR.ink,
          textAlign: "center",
        }}
      >
        {linia.slowa.map((s, i) => {
          const wymawiane = t >= s.start - 0.03 && t < s.koniec + 0.06;
          return (
            <span
              key={i}
              style={{
                position: "relative",
                display: "inline-block",
                padding: "2px 10px",
                margin: "0 2px",
                borderRadius: 10,
                backgroundColor: wymawiane ? KOLOR.accent : "transparent",
                color: wymawiane ? "#fff" : KOLOR.ink,
              }}
            >
              {s.tekst}
            </span>
          );
        })}
      </div>
    </div>
  );
};
