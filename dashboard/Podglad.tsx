import React, { useEffect, useMemo, useRef } from "react";
import { Player, type PlayerRef } from "@remotion/player";
import type { Scenariusz } from "../src/typy";
import { Short } from "../src/Short";
import { FPS, klatkiCalosci, klatkiSceny, maPrzejscie, PRZEJSCIE_KLATKI } from "../src/czas";
import { SZEROKOSC, WYSOKOSC } from "../src/marka";
import { SERWER } from "./api";

type Props = { scenariusz: Scenariusz; aktywnaScena?: string };

/** Klatka, od której zaczyna się dana scena. */
function startSceny(s: Scenariusz, id: string): number {
  let klatka = 0;
  for (const scena of s.sceny) {
    if (scena.id === id) return klatka;
    klatka += klatkiSceny(scena) - (maPrzejscie(scena) ? PRZEJSCIE_KLATKI : 0);
  }
  return 0;
}

export const Podglad: React.FC<Props> = ({ scenariusz, aktywnaScena }) => {
  const ref = useRef<PlayerRef>(null);
  const props = useMemo(() => ({ scenariusz, bazaUrl: `${SERWER}/projekty/${scenariusz.id}` }), [scenariusz]);
  const klatki = klatkiCalosci(scenariusz);

  // Kliknięcie sceny w edytorze przewija podgląd do jej początku.
  useEffect(() => {
    if (!aktywnaScena || !ref.current) return;
    ref.current.pause();
    ref.current.seekTo(Math.min(klatki - 1, startSceny(scenariusz, aktywnaScena) + 20));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aktywnaScena]);

  return (
    <div className="podglad-ramka">
      <Player
        ref={ref}
        component={Short}
        inputProps={props}
        durationInFrames={klatki}
        fps={FPS}
        compositionWidth={SZEROKOSC}
        compositionHeight={WYSOKOSC}
        style={{ width: "100%", height: "100%" }}
        controls
        clickToPlay
        doubleClickToFullscreen
        acknowledgeRemotionLicense
      />
    </div>
  );
};
