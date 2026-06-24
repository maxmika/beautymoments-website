# Analytics-Backend — Beauty Moments

Cookielose Reichweitenmessung aus den CloudFront-Server-Logs. Kein JS auf den
Seiten, keine Cookies. Ergebnis ist eine kleine `stats.json`, die die
passwortgeschützte Seite `/stats` rendert.

## Datenfluss

```
3 CloudFront-Distributionen → Standard-Logs → s3://beautymoments-logs/cf/
   → Athena (eine Tabelle, Site via host_header)
   → Lambda (täglich, EventBridge) → s3://beautymoments-main/stats/data/stats.json
   → CloudFront /stats* (Basic-Auth-Function) → statische Dashboard-Seite
```

MAU = `COUNT(DISTINCT md5(salt + IP + User-Agent + 'YYYY-MM'))` im Kalendermonat
(monatlich rotierend, nicht umkehrbar). Gespeichert werden nur **Zahlen**, nie
Hashes oder IPs. Rohlogs verfallen nach 90 Tagen (Bucket-Lifecycle).

## Berechtigungs-Realität (wichtig)

Der Deploy-User `claude-cli-beautymoments` ist auf **S3 + CloudFront** beschränkt.
Geprüft (read-only) — **DENIED**: Lambda, Glue, Athena, EventBridge, SSM, IAM.
**OK**: CloudFront, S3.

→ Aufteilung:

| Schritt | Wer | Womit |
|---|---|---|
| Log-Bucket `beautymoments-logs` anlegen (+Lifecycle 90 T, ACLs an) | CLI-User (Claude) | S3 |
| CloudFront-Standard-Logging auf 3 Distributionen aktivieren (Ziel `cf/`) | CLI-User (Claude) | CloudFront |
| CF-Function `beautymoments-stats-auth` + `/stats*`-Behavior (main) | CLI-User (Claude) | CloudFront |
| Dashboard-Seite deployen (`public/main/stats/`) | CLI-User (Claude) | S3 + Invalidation |
| Glue-DB/Tabelle, Athena-Workgroup | **Admin** | CFN / Konsole |
| Lambda + **IAM-Rolle**, EventBridge-Schedule | **Admin** | CFN / Konsole |
| SSM SecureString `secret_salt` | **Admin** | CFN / Konsole |

*(Voraussetzung CLI-Teil: der User hat `cloudfront:UpdateDistribution`,
`cloudfront:CreateFunction/PublishFunction`, `s3:CreateBucket/PutBucketAcl`.
Falls nicht, übernimmt der Admin auch diese Schritte.)*

## IAM-Policy der Lambda-Rolle (zur Freigabe)

Trust: `lambda.amazonaws.com`. Inline-Policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    { "Sid": "Athena", "Effect": "Allow",
      "Action": ["athena:StartQueryExecution","athena:GetQueryExecution",
        "athena:GetQueryResults","athena:StopQueryExecution"],
      "Resource": "arn:aws:athena:eu-central-1:916046697004:workgroup/beautymoments" },
    { "Sid": "Glue", "Effect": "Allow",
      "Action": ["glue:GetDatabase","glue:GetTable","glue:GetPartitions"],
      "Resource": [
        "arn:aws:glue:eu-central-1:916046697004:catalog",
        "arn:aws:glue:eu-central-1:916046697004:database/beautymoments_analytics",
        "arn:aws:glue:eu-central-1:916046697004:table/beautymoments_analytics/*" ] },
    { "Sid": "ReadLogs", "Effect": "Allow",
      "Action": ["s3:GetObject","s3:ListBucket"],
      "Resource": ["arn:aws:s3:::beautymoments-logs",
        "arn:aws:s3:::beautymoments-logs/*"] },
    { "Sid": "AthenaResults", "Effect": "Allow",
      "Action": ["s3:GetObject","s3:PutObject","s3:ListBucket"],
      "Resource": ["arn:aws:s3:::beautymoments-logs",
        "arn:aws:s3:::beautymoments-logs/athena-results/*"] },
    { "Sid": "WriteStats", "Effect": "Allow",
      "Action": ["s3:PutObject"],
      "Resource": "arn:aws:s3:::beautymoments-main/stats/data/*" },
    { "Sid": "Salt", "Effect": "Allow",
      "Action": ["ssm:GetParameter"],
      "Resource": "arn:aws:ssm:eu-central-1:916046697004:parameter/beautymoments/analytics/salt" },
    { "Sid": "Kms", "Effect": "Allow", "Action": ["kms:Decrypt"],
      "Resource": "*",
      "Condition": { "StringEquals": { "kms:ViaService": "ssm.eu-central-1.amazonaws.com" } } },
    { "Sid": "Logs", "Effect": "Allow",
      "Action": ["logs:CreateLogGroup","logs:CreateLogStream","logs:PutLogEvents"],
      "Resource": "arn:aws:logs:eu-central-1:916046697004:*" }
  ]
}
```

## Lambda-Env

```
ATHENA_DATABASE = beautymoments_analytics
ATHENA_TABLE    = cf_logs
ATHENA_WORKGROUP= beautymoments
OUTPUT_BUCKET   = beautymoments-main
OUTPUT_KEY      = stats/data/stats.json
SALT_PARAM      = /beautymoments/analytics/salt
RANGE_DAYS      = 30
```

Runtime: python3.12, Handler `aggregate.handler`, Timeout ≥ 120 s.
Code: `infra/lambda/aggregate.py` (nur boto3, keine externen Abhängigkeiten).

## Dateien

- `cloudfront/stats-auth.js` — CF-Function (Basic-Auth + Index-Rewrite).
- `lambda/aggregate.py` — Aggregator.
- `athena/schema.sql` — Tabellen-DDL + Referenz-Queries.

## Offene Entscheidungen

1. **Provisionierung des Admin-Teils**: CloudFormation-Template (liefere ich),
   AWS-SAM, oder Konsole — je nach deinem Tooling.
2. **/stats-Passwort** (+ Benutzername, Default `cindy`).
3. Log-Aufbewahrung 90 Tage ok.
