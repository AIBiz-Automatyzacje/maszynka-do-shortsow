import React, { useEffect, useState } from "react";
import { api, urlPliku, type WpisGalerii } from "./api";
import { Film, FolderOpen, Play, Trash2 } from "lucide-react";

const I = { className: "ikona", strokeWidth: 1.75 } as const;

function formatujDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("pl-PL", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function formatujRozmiar(b: number) {
  return b > 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)} MB` : `${Math.round(b / 1024)} KB`;
}

type Props = { projektId?: string; onOtworzProjekt: (id: string) => void; odswiez?: number };

/** Galeria wygenerowanych rolek. Bez projektId pokazuje wszystkie, z projektId tylko wersje jednej rolki. */
export const Galeria: React.FC<Props> = ({ projektId, onOtworzProjekt, odswiez }) => {
  const [wpisy, setWpisy] = useState<WpisGalerii[] | null>(null);
  const [blad, setBlad] = useState<string | null>(null);

  const wczytaj = async () => {
    try {
      const w = await api.galeria();
      setWpisy(projektId ? w.filter((x) => x.projektId === projektId) : w);
      setBlad(null);
    } catch (e) {
      setBlad((e as Error).message);
    }
  };

  useEffect(() => {
    void wczytaj();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projektId, odswiez]);

  if (blad) return <div className="komunikat blad">{blad}</div>;
  if (!wpisy) return <p className="male">Wczytuję…</p>;
  if (wpisy.length === 0)
    return (
      <div className="pusty">
        <div className="ikona-duza"><Film {...I} style={{ width: 20, height: 20 }} /></div>
        {projektId ? "Ta rolka nie ma jeszcze wygenerowanego MP4." : "Nie ma jeszcze żadnych wygenerowanych rolek. Kliknij „Renderuj MP4” przy dowolnej rolce."}
      </div>
    );

  return (
    <div className="galeria">
      {wpisy.map((w) => (
        <div className="karta kafelek-rolki" key={`${w.projektId}/${w.plik}`}>
          <video controls preload="metadata" src={urlPliku(w.projektId, w.plik)} />
          <div className="opis-rolki">
            {!projektId && (
              <button className="tytul-link" onClick={() => onOtworzProjekt(w.projektId)} title="Otwórz edycję tej rolki">
                {w.tytul}
              </button>
            )}
            <div className="male">
              {formatujDate(w.data)}, {formatujRozmiar(w.rozmiar)}
            </div>
            <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
              <a className="btn maly" href={urlPliku(w.projektId, w.plik)} target="_blank" rel="noreferrer">
                <Play {...I} /> Otwórz
              </a>
              <button className="btn maly ikonowy" title="Pokaż w Finderze" aria-label="Pokaż w Finderze" onClick={() => api.otworzFolder(w.projektId)}>
                <FolderOpen {...I} />
              </button>
              <button
                className="btn maly cichy ikonowy niebezpieczny"
                title="Usuń plik"
                aria-label="Usuń plik"
                onClick={async () => {
                  if (!confirm(`Usunąć plik ${w.plik}? Trafi do folderu _kosz.`)) return;
                  await api.usunRolke(w.projektId, w.plik);
                  void wczytaj();
                }}
              >
                <Trash2 {...I} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
