# Maszynka do shortsów — jak używać

## Uruchomienie

1. Kliknij dwa razy **Uruchom maszynkę.command**.
2. Po kilku sekundach w przeglądarce otworzy się dashboard: http://localhost:5757
3. Okno Terminala zostaw otwarte. Zamknięcie go wyłącza maszynkę.

Przy pierwszym uruchomieniu macOS może zapytać, czy na pewno otworzyć plik. Kliknij prawym → „Otwórz".

## Jednorazowo: podłącz swój głos

1. W dashboardzie kliknij **Ustawienia głosu** (lewy dolny róg).
2. Wejdź na elevenlabs.io → profil (lewy dolny róg) → **API Keys** → **Create API Key**. Skopiuj klucz i wklej go w dashboardzie. Kliknij **Zapisz klucz**.
3. Z listy wybierz swój sklonowany głos (jest na górze listy). Kliknij **Zapisz ustawienia**.

Klucz zostaje na Twoim komputerze w pliku `dane/ustawienia.json`.

## Robienie rolki — krok po kroku

### 1. Scenariusz
Kliknij **+ Nowa rolka**, wklej link do artykułu (albo opisz pomysł), wpisz długość w sekundach i kliknij **Utwórz i napisz scenariusz**. Claude sam napisze sceny. Trwa to 30–90 sekund. Działa na Twoim koncie Claude, bez dodatkowych kluczy.

Lista **Twoje rolki** po lewej to wszystkie Twoje projekty (wersje robocze i gotowe). Kliknij, żeby otworzyć.

Każda scena ma tylko dwa pola: **Co mówi lektor** i **Co widać na ekranie** (opis słowami). Tekst lektora poprawiasz od razu. Gdy zmienisz opis ekranu, kliknij **Popraw scenę**, a Claude przebuduje ekran według opisu (10–30 s). Pod linkiem **Szczegóły** są pola techniczne, gdybyś chciał poprawić pojedyncze słowo bez czekania. Zmiany zapisują się same.

Jeśli wolisz, żeby poprawił Claude: wpisz uwagi w polu **Uwagi dla Claude** na dole (np. „scena 3 za długa, dodaj liczbę 80%”) i kliknij **Zastosuj uwagi**. Sceny, których nie ruszasz, zachowają nagrany lektor.

Przycisk **Napisz od nowa** u góry pisze cały scenariusz ponownie z tego samego źródła.

Możesz też nadal poprosić Claude Code w rozmowie: „zrób rolkę z tego linku”.

### 2. Lektor
Kliknij **Generuj lektora** (u góry). Powstaje głos dla każdej sceny. Każdą możesz odsłuchać przy scenie.
Nie pasuje? Popraw tekst i kliknij **Generuj ponownie** przy tej jednej scenie.

Po wygenerowaniu lektora długość rolki po prawej stronie jest już dokładna, a napisy synchronizują się ze słowami.

### 3. Podgląd
Podgląd po prawej pokazuje rolkę na żywo. Kliknij scenę na środku, a podgląd do niej przeskoczy. Spacja = odtwarzanie.

### 4. Rolka
Kliknij **Renderuj MP4**. Pasek postępu pokaże, ile zostało (zwykle 20–60 s). Potem: **Otwórz MP4** albo **Pokaż w Finderze**.

Każdy render tworzy osobny plik z datą i godziną w nazwie, np. `rolka_2026-09-11_09-32-36.mp4`, w folderze `projekty/[nazwa-rolki]/`. Format: pion 1080×1920, 30 kl/s, gotowy na Reels, TikToka i Shorts.

### 5. Galeria
Przycisk **Galeria rolek** (lewy panel) pokazuje wszystkie wygenerowane MP4 ze wszystkich rolek. Odtwarzasz je bezpośrednio w dashboardzie. Kliknięcie tytułu wraca do edycji tej rolki.
W edycji rolki zakładka **Wygenerowane wersje** pokazuje wszystkie wersje tylko tej jednej rolki.

## Typy scen

| Typ | Kiedy używać |
|---|---|
| Tytuł | hak na start, jedno mocne zdanie z wyróżnionym słowem |
| Lista kafelków | 3–4 punkty pojawiające się po kolei |
| Jedna karta | jedna myśl, jedna ikona |
| Wielka liczba | licznik nabijający się do wartości |
| Porównanie | źle / dobrze, przed / po |
| Element 3D | przerywnik z obracającymi się bryłami |
| Okno terminala | tekst „pisany" jak w programie |
| Wezwanie do działania | zakończenie z przyciskiem |
| Makieta telefonu | powiadomienie, aplikacja, lista wiadomości |
| Rozmowa na czacie | wymiana wiadomości z klientem |
| Okno przeglądarki | odesłanie do artykułu albo strony |
| Formularz | zapis, wypełnianie danych na żywo z kliknięciem |

## Dodatki

- **Efekt dźwiękowy**: przy scenie wpisz opis (np. „krótki whoosh"), kliknij Generuj. ElevenLabs stworzy dźwięk.
- **Przejścia** między scenami: przenikanie, przesunięcie, wycieranie, cięcie.
- **Napisy** można wyłączyć jednym ptaszkiem u góry.
- Usunięte rolki trafiają do `projekty/_kosz`, nic nie ginie.

## Gdy coś nie działa

- „Brak połączenia z serwerem" → uruchom ponownie plik **Uruchom maszynkę.command**.
- „ElevenLabs odrzucił klucz" → wklej klucz jeszcze raz w ustawieniach.
- „Skończyły się znaki" → limit planu ElevenLabs, poczekaj do odnowienia albo dokup.
- Render trwa długo → to normalne przy scenach 3D, poczekaj. Nie zamykaj Terminala.
