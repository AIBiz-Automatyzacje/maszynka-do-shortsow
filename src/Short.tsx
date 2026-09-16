import React from "react";
import { AbsoluteFill, Audio, useCurrentFrame, useVideoConfig } from "remotion";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import type { TransitionPresentation } from "@remotion/transitions";
import type { PropsRolki, Scena } from "./typy";
import { klatkiSceny, maPrzejscie, OGON_KONCOWY, PRZEJSCIE_KLATKI } from "./czas";
import { Tlo, Podpis, KontekstNapisow, KontekstSlow } from "./sceny/wspolne";
import { punch } from "./ruch";
import { Napisy } from "./sceny/Napisy";
import { EkranCta, EkranKarta, EkranKod, EkranLiczba, EkranLista, EkranPorownanie, EkranTytul } from "./sceny/Ekrany";
import { Ekran3D } from "./sceny/Ekran3D";
import { EkranCzat, EkranFormularz, EkranPrzegladarka, EkranTelefon } from "./sceny/Makiety";
import { CZCIONKA, KOLOR } from "./marka";

const Ekran: React.FC<{ scena: Scena }> = ({ scena }) => {
  const e = scena.ekran;
  switch (e.typ) {
    case "tytul":
      return <EkranTytul ekran={e} />;
    case "lista":
      return <EkranLista ekran={e} />;
    case "karta":
      return <EkranKarta ekran={e} />;
    case "liczba":
      return <EkranLiczba ekran={e} />;
    case "porownanie":
      return <EkranPorownanie ekran={e} />;
    case "cta":
      return <EkranCta ekran={e} />;
    case "3d":
      return <Ekran3D ekran={e} />;
    case "kod":
      return <EkranKod ekran={e} />;
    case "telefon":
      return <EkranTelefon ekran={e} />;
    case "czat":
      return <EkranCzat ekran={e} />;
    case "przegladarka":
      return <EkranPrzegladarka ekran={e} />;
    case "formularz":
      return <EkranFormularz ekran={e} />;
    default:
      return null;
  }
};

const SceneWidok: React.FC<{ scena: Scena; bazaUrl: string; napisy: boolean }> = ({ scena, bazaUrl, napisy }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // Uderzenie kamery na wejściu sceny: lekkie zbliżenie, które opada.
  const skala = punch(frame, fps, [0], 0.03);
  return (
    <Tlo>
      <Podpis />
      <AbsoluteFill style={{ transform: `scale(${skala})`, transformOrigin: "540px 960px" }}>
        <KontekstNapisow.Provider value={napisy}>
          <KontekstSlow.Provider value={scena.audio?.slowa}>
            <Ekran scena={scena} />
          </KontekstSlow.Provider>
        </KontekstNapisow.Provider>
      </AbsoluteFill>
      {napisy && <Napisy slowa={scena.audio?.slowa} lektor={scena.lektor} />}
      {scena.audio && <Audio src={`${bazaUrl}/${scena.audio.plik}`} />}
      {/* Efekt dźwiękowy jest tłem dla lektora, nie może go zagłuszać. */}
      {scena.efektAudio && <Audio src={`${bazaUrl}/${scena.efektAudio.plik}`} volume={0.13} />}
    </Tlo>
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prezentacja = (rodzaj: Scena["przejscie"]): TransitionPresentation<any> => {
  switch (rodzaj) {
    case "slide":
      return slide({ direction: "from-right" });
    case "wipe":
      return wipe({ direction: "from-left" });
    default:
      return fade();
  }
};

export const Short: React.FC<PropsRolki> = ({ scenariusz, bazaUrl }) => {
  if (!scenariusz.sceny.length) {
    return (
      <Tlo>
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", fontFamily: CZCIONKA.tekst, color: KOLOR.muted, fontSize: 48 }}>
          Brak scen w scenariuszu
        </AbsoluteFill>
      </Tlo>
    );
  }

  const elementy: React.ReactNode[] = [];
  const ostatnia = scenariusz.sceny.length - 1;
  scenariusz.sceny.forEach((scena, i) => {
    // Ostatnia scena dostaje ogon, żeby zakończenie zdążyło wybrzmieć.
    const klatki = klatkiSceny(scena) + (i === ostatnia ? Math.round(OGON_KONCOWY * 30) : 0);
    elementy.push(
      <TransitionSeries.Sequence key={scena.id} durationInFrames={klatki}>
        <SceneWidok scena={scena} bazaUrl={bazaUrl} napisy={scenariusz.napisy} />
      </TransitionSeries.Sequence>,
    );
    if (i < scenariusz.sceny.length - 1 && maPrzejscie(scena)) {
      elementy.push(
        <TransitionSeries.Transition
          key={`${scena.id}-p`}
          presentation={prezentacja(scena.przejscie)}
          timing={linearTiming({ durationInFrames: PRZEJSCIE_KLATKI })}
        />,
      );
    }
  });

  return <TransitionSeries>{elementy}</TransitionSeries>;
};
