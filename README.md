# Webseite – 1:1 Prototyp (statisch, ohne Build)

`index.html` ist **exakt der bewährte Prototyp** (Produkte, Rezepte, Vorschlagen, Tagebuch, Freigabe).
Statische Seite, **kein Build, kein npm** nötig. Backend bleibt Supabase (read-only anon-Key, RLS schützt).

## Lokal ansehen
Einfach **`index.html` doppelklicken** (öffnet im Browser). Kamera/Barcode brauchen HTTPS → erst online.

## Online stellen (Auto-Deploy)
**Cloudflare Pages** (gratis, kommerziell erlaubt):
1. GitHub-Repo anlegen, den Ordner `webseite/` pushen.
   ```
   cd webseite
   git init && git add index.html README.md && git commit -m "CleanBase Web 1:1"
   git branch -M main && git remote add origin <DEIN-REPO> && git push -u origin main
   ```
2. dash.cloudflare.com → Workers & Pages → Pages → „Connect to Git" → Repo wählen.
   - **Framework preset: None** · **Build command: (leer)** · **Output directory: `/`**
3. Jeder Commit deployt automatisch. Eigene Domain später unter Pages → Custom domains.

*(Alternativ ohne Git: `index.html` per Drag&Drop auf Netlify/Cloudflare Pages — wie bisher.)*

## Hinweise
- **1:1**: An der Darstellung des Prototyps ändert sich nichts.
- `_framework-spaeter/` = geparktes Astro-Experiment + warmer Design-Entwurf. **Für den 1:1-Deploy nicht nötig** – nur falls wir die Seite später in Komponenten umbauen wollen.
- Bei jeder Prototyp-Änderung: neue `06 Web-App/index.html` hierher kopieren (oder direkt hier pflegen) und committen → deployt automatisch.
