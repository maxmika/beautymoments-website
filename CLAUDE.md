# CLAUDE.md — Beauty Moments Website

## Projektüberblick
- Statische Website aus reinem HTML/CSS. **Kein Build-Step.**
- Ein Repo, drei Deploy-Ziele: Hauptseite + zwei Studio-Subdomains.
- Betreiberin: Cindy — führt zwei Kosmetik-/Beauty-Studios und etabliert sich
  zusätzlich als Ausbilderin.
- Repo-Root: `beautymoments-website`; Quelldateien liegen unter `public/`
  mit je einem Ordner pro Deploy-Ziel: `public/main/`, `public/schorndorf/`,
  `public/gmuend/`. Design-Referenzen unter `reference/` (wird nie deployed).
  Deploy-Befehle und Ressourcen-IDs: siehe `DEPLOY.md`.

## Domains, Inhalte & Design
- **beautymoments.de** (Hauptseite): Cindy ausführlich vorgestellt. Layout:
  vertikale 50/50-Teilung — **links Gmünd, rechts Schorndorf** — mit jeweils
  sehr prominentem Absprung auf die Studio-Seite. In den unteren 10–20 %
  horizontal eine geteaserte "Über mich"-Section mit Portrait. Wird kaum aktiv
  kommuniziert, muss aber sauber erreichbar sein.
- **schorndorf.beautymoments.de** — Fokus: Lasern / dauerhafte Haarentfernung;
  Headspa; Lash & Brow Lifting. Design: **beige + weiß, grüner Akzent.**
- **gmuend.beautymoments.de** — Fokus: Ausreinigung / Gesichtsbehandlung,
  Microneedling, Lash & Brow Lifting, Wimpern-Behandlungen. Design:
  **weiß + orange Akzent.**
- Studio-Seiten ähnlich aufgebaut, gemeinsame Grundstruktur, Unterschiede
  v. a. auf Farb-/Design-Ebene. Cindy auf den Subseiten kleiner vorgestellt.
- **Konkrete Farbwerte folgen noch** — bis dahin neutrale Platzhalter.

## www-Verhalten
- Alle Seiten mit und ohne `www` erreichbar.
- `www.*` → **301-Redirect** auf die Variante ohne www (kanonisch ist ohne www).
- Betrifft: `www.beautymoments.de`, `www.schorndorf.beautymoments.de`,
  `www.gmuend.beautymoments.de`.

## AWS-Architektur
- Region für Buckets/Distributionen: **eu-central-1 (Frankfurt)**.
  ACM-Zertifikat: **us-east-1** (CloudFront-Pflicht).
- **3 private S3-Buckets** (Block Public Access an), Namen global eindeutig —
  bei Konflikt Suffix anhängen und melden. Bei OAC ist der Bucketname frei
  wählbar (muss nicht der Domain entsprechen). Vorschlag:
  `beautymoments-main`, `beautymoments-schorndorf`, `beautymoments-gmuend`.
- **3 CloudFront-Distributionen**, je Origin = zugehöriger Bucket über
  **Origin Access Control (OAC)**. Buckets bleiben privat, Zugriff nur über
  CloudFront. `default_root_object = index.html`.
- **1 ACM-Zertifikat** in us-east-1 mit folgenden SANs:
  - `beautymoments.de`
  - `*.beautymoments.de`
  - `*.schorndorf.beautymoments.de`
  - `*.gmuend.beautymoments.de`
  (Wildcard deckt nur eine Ebene — daher die beiden Sub-Wildcards für
  `www.schorndorf…` / `www.gmuend…`.)
- DNS-Validierung des Zertifikats **automatisch via Route53**.
- **www→non-www:** eine **CloudFront Function** (viewer request), die bei
  Host beginnend mit `www.` einen 301 auf den Host ohne www zurückgibt.
  Eine Funktion, an alle drei Distributionen gehängt. Jede Distribution
  listet **beide** Aliase (mit + ohne www).
- **Route53:** Alias-A- **und** AAAA-Records je Domain/Subdomain (inkl. www)
  auf die jeweilige CloudFront-Distribution. Hosted Zone für
  `beautymoments.de` **existiert bereits — nutzen, nicht neu anlegen.**

## Deployment
- Kein Build. Deploy = `aws s3 sync <quelle> s3://<bucket> --delete`
  + CloudFront-Invalidation (`/*`).

## Stand (zuletzt aktualisiert: 2026-06-12)
- **Phase 1 (Infrastruktur): ERLEDIGT.** Alle drei Domains live mit HTTPS +
  www-Redirect. Hosted Zone musste entgegen früherer Annahme neu angelegt
  werden (Domain war via Route53 Domains registriert, NS zeigten auf einen
  Parking-Dienst); inzwischen existiert sie — nutzen, nicht neu anlegen.
- **Content-Phase begonnen:** Repo-Struktur umgesetzt (s. u.), der bisherige
  Site-Code (Schorndorf-Variante) liegt unter `public/schorndorf/` und ist
  auf schorndorf.beautymoments.de live. `beautymoments.de` und
  gmuend.beautymoments.de zeigen neutrale Platzhalter.
- **Nächster Schritt:** neue Landingpage für beautymoments.de
  (Layout s. „Domains, Inhalte & Design").

## Repo-Struktur (umgesetzt)
```
beautymoments-website/
  public/
    main/        → beautymoments.de
    schorndorf/  → schorndorf.beautymoments.de
    gmuend/      → gmuend.beautymoments.de
  reference/     → Design-Referenzen (wird nie deployed)
  DEPLOY.md      → Deploy-How-To + Ressourcen-IDs
```
(`public/shared/` für gemeinsame Assets: optional, bei Bedarf später.)

## Tabu / Vorsicht
- Den bestehenden, fremden Test-Bucket `beautymoments-schorndorf.emmics.de`
  (hängt an einer anderen Domain) **nicht anfassen**.
- Vor jeder Aktion an IAM/Permissions oder DNS: **einzeln zur Freigabe vorlegen.**
- Erst den vollständigen Plan inkl. aller geplanten AWS-Ressourcen zeigen,
  bevor etwas angelegt wird.
