import React from "react";
import { Composition } from "remotion";
import { Short } from "./Short";
import { PRZYKLAD } from "./przyklad";
import { klatkiCalosci, FPS } from "./czas";
import { SZEROKOSC, WYSOKOSC } from "./marka";
import type { PropsRolki } from "./typy";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="Short"
      component={Short}
      fps={FPS}
      width={SZEROKOSC}
      height={WYSOKOSC}
      durationInFrames={klatkiCalosci(PRZYKLAD)}
      defaultProps={{ scenariusz: PRZYKLAD, bazaUrl: "" } satisfies PropsRolki}
      calculateMetadata={({ props }) => ({
        durationInFrames: klatkiCalosci(props.scenariusz),
      })}
    />
  );
};
