// Bezpieczne pobieranie treści spod linku podanego przez użytkownika.
// Wklejony link może celować w usługę działającą na tym komputerze albo w sieci domowej,
// dlatego przed pobraniem sprawdzamy, dokąd naprawdę prowadzi.
import dns from "node:dns/promises";
import net from "node:net";

const MAKS_PRZEKIEROWAN = 3;
const LIMIT_ZNAKOW = 400_000;

/** Czy adres wskazuje na ten komputer albo sieć lokalną. */
function adresLokalny(ip: string): boolean {
  const wersja = net.isIP(ip);
  if (wersja === 4) {
    const [a, b] = ip.split(".").map(Number);
    if (a === 127 || a === 0 || a === 10) return true; // pętla zwrotna i sieć prywatna
    if (a === 169 && b === 254) return true; // adresy lokalne łącza
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 100 && b >= 64 && b <= 127) return true; // sieć operatora
    return false;
  }
  if (wersja === 6) {
    const adres = ip.toLowerCase();
    if (adres === "::1" || adres === "::") return true;
    if (adres.startsWith("fe80") || adres.startsWith("fc") || adres.startsWith("fd")) return true;
    // Adres IPv4 zapisany jako IPv6
    const czwarta = adres.match(/::ffff:(\d+\.\d+\.\d+\.\d+)$/);
    if (czwarta) return adresLokalny(czwarta[1]);
    return false;
  }
  return true; // nieznany format traktujemy jako niebezpieczny
}

/** Sprawdza, czy pod ten adres wolno wysłać zapytanie. */
async function sprawdzAdres(link: string): Promise<URL> {
  let url: URL;
  try {
    url = new URL(link);
  } catch {
    throw new Error("To nie jest poprawny adres strony.");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Obsługiwane są tylko adresy zaczynające się od http albo https.");
  }
  // Adres IPv6 w URL ma nawiasy kwadratowe, które trzeba zdjąć przed sprawdzeniem.
  const host = url.hostname.replace(/^\[|\]$/g, "");
  if (net.isIP(host) && adresLokalny(host)) {
    throw new Error("Ten adres wskazuje na Twój komputer albo sieć lokalną, więc go nie pobieram.");
  }
  let adresy: { address: string }[];
  try {
    adresy = net.isIP(host) ? [{ address: host }] : await dns.lookup(host, { all: true });
  } catch {
    throw new Error(`Nie znalazłem strony pod adresem ${host}.`);
  }
  if (adresy.some((a) => adresLokalny(a.address))) {
    throw new Error("Ten adres prowadzi do usługi na Twoim komputerze albo w sieci lokalnej, więc go nie pobieram.");
  }
  return url;
}

/** Pobiera stronę, sprawdzając każde przekierowanie z osobna. */
export async function pobierzStrone(link: string): Promise<string> {
  let biezacy = link;
  for (let skok = 0; skok <= MAKS_PRZEKIEROWAN; skok++) {
    const url = await sprawdzAdres(biezacy);
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (maszynka-do-shortsow)", Accept: "text/html,text/plain" },
      redirect: "manual",
      signal: AbortSignal.timeout(20000),
    });
    if (res.status >= 300 && res.status < 400) {
      const cel = res.headers.get("location");
      if (!cel) throw new Error("Strona przekierowuje donikąd.");
      biezacy = new URL(cel, url).toString();
      continue;
    }
    if (!res.ok) throw new Error(`Nie udało się pobrać strony (${res.status}).`);
    const typ = res.headers.get("content-type") ?? "";
    if (typ && !/text\/html|text\/plain|application\/xhtml/i.test(typ)) {
      throw new Error("Pod tym adresem nie ma tekstu do przeczytania.");
    }
    const tresc = await res.text();
    return tresc.slice(0, LIMIT_ZNAKOW);
  }
  throw new Error("Strona przekierowuje w kółko.");
}
