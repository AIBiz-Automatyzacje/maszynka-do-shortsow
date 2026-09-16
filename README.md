# Maszynka do shortsów

Lokalna aplikacja, która z linku albo pomysłu robi gotową rolkę (pion 1080×1920, 30 kl/s) na Reels, TikToka i Shorts. Scenariusz pisze Claude Code, lektora czyta ElevenLabs Twoim sklonowanym głosem, wideo składa Remotion. Wszystko dzieje się na Twoim komputerze.

Zbudowana na żywo podczas live'a Akademii Automatyzacji „Claude Code od zera" (17.09.2026). Kod jest otwarty: pobierz, odpal, przerób pod siebie.

## Co potrzebujesz

- macOS (na Windowsie działa przez `npm start`, bez pliku `.command`)
- Node.js 20 lub nowszy: https://nodejs.org
- Apka Claude z zalogowanym Claude Code (scenariusze pisze `claude -p` na Twoim koncie, bez dodatkowych kluczy)
- Konto ElevenLabs z klonem Twojego głosu (klucz API wpisujesz w dashboardzie)

## Uruchomienie

Najprościej: otwórz Claude Code, wklej link do tego repo i napisz:

```
Pobierz ten projekt i uruchom go: https://github.com/AIBiz-Automatyzacje/maszynka-do-shortsow
```

Claude sam sklonuje kod, zainstaluje biblioteki i otworzy dashboard w przeglądarce (http://localhost:5757). Potem kliknij **Ustawienia głosu**, wklej klucz ElevenLabs i wybierz swój głos.

Ręcznie, bez Claude'a:

1. `git clone https://github.com/AIBiz-Automatyzacje/maszynka-do-shortsow.git` albo „Code → Download ZIP".
2. Kliknij dwa razy **Uruchom maszynkę.command** (macOS; za pierwszym razem prawy klik → „Otwórz"). Na Windowsie: `npm install --legacy-peer-deps && npm start`.
3. W przeglądarce otworzy się http://localhost:5757. Okno Terminala zostaw otwarte.

## Jak robić rolki

Krok po kroku, typy scen i co robić, gdy coś nie działa: [docs/jak-uzywac.md](docs/jak-uzywac.md).

W skrócie: **+ Nowa rolka** → wklej link → **Utwórz i napisz scenariusz** → popraw teksty → **Generuj lektora** → **Renderuj MP4**. Gotowy plik ląduje w `projekty/<nazwa-rolki>/`.

## Co jest w środku

| Folder | Co robi |
|---|---|
| `dashboard/` | panel w przeglądarce (React + Vite) |
| `server/` | lokalny serwer: scenariusze (Claude Code), lektor (ElevenLabs), render |
| `src/` | kompozycja wideo w Remotion, typy scen, napisy, marka |
| `docs/` | instrukcja obsługi i styl marki |
| `projekty/` | Twoje rolki (nie trafiają do repo) |
| `dane/` | ustawienia i klucz ElevenLabs (nie trafiają do repo) |
| `CLAUDE.md` | instrukcja dla Claude Code: jak pisać scenariusze w tym projekcie |

## Porty

Dashboard `5757`, serwer `4545`. Zmiana portu serwera: `PORT` w pliku `.env` (wzór w `.env.example`).

---

[Akademia Automatyzacji](https://akademiaautomatyzacji.com) · Kacper Trzepieciński
