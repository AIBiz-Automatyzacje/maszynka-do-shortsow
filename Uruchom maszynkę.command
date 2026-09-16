#!/bin/bash
# Uruchamia maszynkę do shortsów. Kliknij dwa razy w Finderze.
cd "$(dirname "$0")"
export PATH="$HOME/.local/bin:/opt/homebrew/bin:/usr/local/bin:$PATH"

if ! command -v node >/dev/null 2>&1; then
  echo "Nie znaleziono Node.js. Zainstaluj go z https://nodejs.org i spróbuj ponownie."
  read -r -p "Naciśnij Enter, aby zamknąć."
  exit 1
fi

if [ ! -d node_modules ]; then
  echo "Pierwsze uruchomienie: instaluję biblioteki (potrwa 1–2 minuty)…"
  npm install --legacy-peer-deps
fi

echo ""
echo "==============================================="
echo "  Maszynka do shortsów startuje…"
echo "  Dashboard otworzy się w przeglądarce za chwilę."
echo "  Adres: http://localhost:5757"
echo "  Aby zakończyć, zamknij to okno (Cmd+Q w Terminalu)."
echo "==============================================="
echo ""

(sleep 5 && open "http://localhost:5757") &
npm start
