# Deployment — How-To

Liegt nur im Repo, wird nicht deployed (deployed wird ausschließlich der
Inhalt der drei Site-Ordner unter `public/`).

## Repo-Struktur

```
public/
  main/        → beautymoments.de
  schorndorf/  → schorndorf.beautymoments.de
  gmuend/      → gmuend.beautymoments.de
reference/     → Design-Referenzen, wird NIE deployed
```

## Wie kommt der Code nach AWS?

**Nicht über Git.** Es gibt keine CI/CD-Pipeline und keine Verbindung
zwischen GitHub/Git und AWS. Deployment heißt hier: Die AWS CLI lädt die
Dateien **direkt aus dem lokalen Arbeitsverzeichnis** in den S3-Bucket hoch
(`aws s3 sync`). CloudFront liefert dann aus dem Bucket aus.

Konsequenzen:
- Deployed wird, was **lokal auf der Festplatte** liegt — egal ob
  committet oder nicht.
- Git dient nur der Versionierung. Sauberer Ablauf: erst committen,
  dann deployen — Pflicht ist es technisch nicht.
- `--delete` löscht Dateien im Bucket, die lokal nicht (mehr) existieren.
  Der Bucket spiegelt danach exakt den lokalen Stand.

## Neu deployen

### Hauptseite (beautymoments.de)

```bash
aws s3 sync public/main/ s3://beautymoments-main --delete --exclude "*.DS_Store"
aws cloudfront create-invalidation --distribution-id E3GWIXEO4AW64A --paths "/*"
```

### Schorndorf (schorndorf.beautymoments.de)

```bash
aws s3 sync public/schorndorf/ s3://beautymoments-schorndorf --delete --exclude "*.DS_Store"
aws cloudfront create-invalidation --distribution-id EB9HJUM78XS5H --paths "/*"
```

### Gmünd (gmuend.beautymoments.de)

```bash
aws s3 sync public/gmuend/ s3://beautymoments-gmuend --delete --exclude "*.DS_Store"
aws cloudfront create-invalidation --distribution-id E1F6YQTZC5B9SU --paths "/*"
```

Die Invalidation wirft den CloudFront-Cache weg — ohne sie können alte
Dateiversionen bis zu 24 h weiter ausgeliefert werden. Status prüfen:

```bash
curl -sI https://beautymoments.de/ | grep -i x-cache   # "Miss" = frisch vom Bucket
```

## Ressourcen-Übersicht

| Site | Bucket | Distribution |
|------|--------|--------------|
| beautymoments.de | `beautymoments-main` | `E3GWIXEO4AW64A` |
| schorndorf.beautymoments.de | `beautymoments-schorndorf` | `EB9HJUM78XS5H` |
| gmuend.beautymoments.de | `beautymoments-gmuend` | `E1F6YQTZC5B9SU` |

## Analytics / Monitoring (cookielos, CloudFront-Logs)

Reichweitenmessung ohne JS/Cookies. Architektur & Code: `infra/`.

- **Log-Bucket** `beautymoments-logs` (privat, ACLs an, Lifecycle: `cf/` 90 T,
  `athena-results/` 14 T). Alle drei Distributionen schreiben Standard-Logs
  nach `cf/` (Logging **aktiv** seit 2026-06-24).
- **Backend** (Admin, via CloudFormation `infra/analytics.yaml`): Glue-Tabelle
  `beautymoments_analytics.cf_logs`, Athena-Workgroup `beautymoments`, Lambda
  `beautymoments-stats-agg` (täglich 03:00 UTC) → schreibt
  `s3://beautymoments-main/stats/data/stats.json`.
  Salt: SSM SecureString `/beautymoments/analytics/salt`.
- **Dashboard**: `public/main/stats/` → `beautymoments.de/stats`, geschützt per
  CloudFront-Function `beautymoments-stats-auth` (Basic-Auth) auf eigenem
  `/stats*`-Behavior der main-Distribution.

Backend deployen (Admin-Credentials):
```bash
aws ssm put-parameter --name /beautymoments/analytics/salt --type SecureString \
  --value "<zufallswert>" --region eu-central-1
aws cloudformation package --template-file infra/analytics.yaml \
  --s3-bucket beautymoments-logs --s3-prefix lambda-code \
  --output-template-file infra/analytics.packaged.yaml
aws cloudformation deploy --template-file infra/analytics.packaged.yaml \
  --stack-name beautymoments-analytics --capabilities CAPABILITY_NAMED_IAM \
  --region eu-central-1
```

AWS-Account `916046697004` · Buckets in eu-central-1 · Hosted Zone
`Z01106763EIPZC8SYYTPU` · ACM-Zertifikat in us-east-1 ·
www→non-www-Redirect: CloudFront Function `beautymoments-www-redirect`
