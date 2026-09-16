// Obróbka dźwięku: wyrównanie głośności lektora i pomiar długości.
import { execFile } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

/** Głośność docelowa dla platform społecznościowych (EBU R128). */
export const GLOSNOSC_LUFS = -16;
export const SZCZYT_DBTP = -1.5;

function uruchom(program: string, argumenty: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    execFile(program, argumenty, { maxBuffer: 40 * 1024 * 1024 }, (err, stdout, stderr) => {
      if (err) return reject(new Error(stderr?.toString().slice(-500) || err.message));
      resolve(stdout.toString() + stderr.toString());
    });
  });
}

/**
 * Wyrównuje głośność nagrania do -16 LUFS.
 * Bez tego jeden głos ElevenLabs bywa o kilkanaście decybeli cichszy od drugiego.
 * Gdy brakuje ffmpeg, zwraca nagranie bez zmian.
 */
export async function wyrownajGlosnosc(audio: Buffer): Promise<Buffer> {
  const katalog = fs.mkdtempSync(path.join(os.tmpdir(), "maszynka-"));
  const wejscie = path.join(katalog, "we.mp3");
  const wyjscie = path.join(katalog, "wy.mp3");
  try {
    fs.writeFileSync(wejscie, audio);
    await uruchom("ffmpeg", [
      "-hide_banner", "-loglevel", "error", "-y",
      "-i", wejscie,
      "-af", `loudnorm=I=${GLOSNOSC_LUFS}:TP=${SZCZYT_DBTP}:LRA=11`,
      "-ar", "44100", "-b:a", "128k",
      wyjscie,
    ]);
    return fs.readFileSync(wyjscie);
  } catch (e) {
    console.warn("Nie udało się wyrównać głośności, zostaje oryginał:", e instanceof Error ? e.message : e);
    return audio;
  } finally {
    fs.rmSync(katalog, { recursive: true, force: true });
  }
}

/** Długość nagrania w sekundach (dokładna, z ffprobe). */
export async function dlugoscAudio(plik: string): Promise<number | null> {
  try {
    const out = await uruchom("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", plik]);
    const sek = Number.parseFloat(out.trim());
    return Number.isFinite(sek) ? +sek.toFixed(3) : null;
  } catch {
    return null;
  }
}
