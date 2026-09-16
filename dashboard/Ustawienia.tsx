import React, { useEffect, useState } from "react";
import { api, type Glos, type Status } from "./api";

type Props = { status: Status; onZamknij: () => void; onZapisano: () => void };

export const Ustawienia: React.FC<Props> = ({ status, onZamknij, onZapisano }) => {
  const [klucz, setKlucz] = useState("");
  const [glosy, setGlosy] = useState<Glos[] | null>(null);
  const [voiceId, setVoiceId] = useState(status.voiceId ?? "");
  const [model, setModel] = useState(status.model);
  const [stabilnosc, setStabilnosc] = useState(status.stabilnosc);
  const [podobienstwo, setPodobienstwo] = useState(status.podobienstwo);
  const [styl, setStyl] = useState(status.styl);
  const [blad, setBlad] = useState<string | null>(null);
  const [zajete, setZajete] = useState(false);

  const pobierzGlosy = async () => {
    setBlad(null);
    try {
      const lista = await api.glosy();
      setGlosy(lista);
      if (!voiceId && lista[0]) setVoiceId(lista[0].id);
    } catch (e) {
      setBlad((e as Error).message);
    }
  };

  useEffect(() => {
    if (status.maKlucz) void pobierzGlosy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const zapiszKlucz = async () => {
    setZajete(true);
    setBlad(null);
    try {
      await api.zapiszUstawienia({ elevenLabsApiKey: klucz });
      setKlucz("");
      await pobierzGlosy();
      onZapisano();
    } catch (e) {
      setBlad((e as Error).message);
    } finally {
      setZajete(false);
    }
  };

  const zapisz = async () => {
    setZajete(true);
    setBlad(null);
    try {
      const glos = glosy?.find((g) => g.id === voiceId);
      await api.zapiszUstawienia({ voiceId, voiceName: glos?.nazwa, model, stabilnosc, podobienstwo, styl });
      onZapisano();
      onZamknij();
    } catch (e) {
      setBlad((e as Error).message);
    } finally {
      setZajete(false);
    }
  };

  const wybrany = glosy?.find((g) => g.id === voiceId);

  return (
    <div className="dialog-tlo" onClick={onZamknij}>
      <div className="karta dialog" onClick={(e) => e.stopPropagation()}>
        <h1>Ustawienia lektora</h1>
        <p className="male">Wszystko zostaje na Twoim komputerze, w folderze maszynki.</p>

        <h2>1. Klucz API ElevenLabs</h2>
        {status.maKlucz ? (
          <div className="komunikat ok">Klucz jest zapisany{status.kluczZEnv ? " (z pliku .env)" : ""}. Możesz wpisać nowy, żeby go podmienić.</div>
        ) : (
          <div className="komunikat info">
            Wejdź na elevenlabs.io, kliknij swój profil w lewym dolnym rogu, potem „API Keys” i „Create API Key”. Skopiuj klucz i wklej poniżej.
          </div>
        )}
        <div style={{ display: "flex", gap: 8 }}>
          <input type="password" value={klucz} onChange={(e) => setKlucz(e.target.value)} placeholder="sk_…" className="wejscie" style={{ flex: 1 }} />
          <button className="btn" disabled={!klucz.trim() || zajete} onClick={zapiszKlucz}>
            Zapisz klucz
          </button>
        </div>

        <h2>2. Głos</h2>
        {!status.maKlucz && !glosy && <p className="male">Najpierw zapisz klucz, wtedy pobiorę listę Twoich głosów.</p>}
        {glosy && (
          <>
            <div className="pole">
              <label>Wybierz głos (Twoje sklonowane głosy są na górze)</label>
              <select value={voiceId} onChange={(e) => setVoiceId(e.target.value)}>
                {glosy.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.nazwa}
                    {g.kategoria === "cloned" ? " — sklonowany" : g.kategoria === "professional" ? " — profesjonalny klon" : ""}
                  </option>
                ))}
              </select>
            </div>
            {wybrany?.podglad && <audio controls src={wybrany.podglad} style={{ width: "100%", height: 32 }} />}
          </>
        )}

        <h2>3. Jakość mowy</h2>
        <div className="pole">
          <label>Model</label>
          <select value={model} onChange={(e) => setModel(e.target.value)}>
            <option value="eleven_multilingual_v2">Multilingual v2 — najstabilniejszy po polsku (polecany)</option>
            <option value="eleven_v3">Eleven v3 — najbardziej ekspresyjny, czasem mniej przewidywalny</option>
            <option value="eleven_turbo_v2_5">Turbo v2.5 — szybszy i tańszy</option>
          </select>
        </div>
        <div className="wiersz trzy">
          <Suwak label="Stabilność" wartosc={stabilnosc} onChange={setStabilnosc} opis="Niżej = żywiej, wyżej = równiej" />
          <Suwak label="Podobieństwo" wartosc={podobienstwo} onChange={setPodobienstwo} opis="Jak blisko oryginału" />
          <Suwak label="Ekspresja" wartosc={styl} onChange={setStyl} opis="Zwykle 0–0.3" />
        </div>

        {blad && <div className="komunikat blad">{blad}</div>}
        <div className="stopka">
          <button className="btn" onClick={onZamknij}>Anuluj</button>
          <button className="btn glowny" disabled={zajete} onClick={zapisz}>Zapisz ustawienia</button>
        </div>
      </div>
    </div>
  );
};

const Suwak: React.FC<{ label: string; wartosc: number; onChange: (v: number) => void; opis: string }> = ({ label, wartosc, onChange, opis }) => (
  <div className="pole">
    <label>{label}</label>
    <div className="suwak">
      <input type="range" min={0} max={1} step={0.05} value={wartosc} onChange={(e) => onChange(Number(e.target.value))} />
      <span className="male">{wartosc.toFixed(2)}</span>
    </div>
    <span className="male">{opis}</span>
  </div>
);
