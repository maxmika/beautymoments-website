"""Beauty Moments analytics aggregator.

Runs once per day (EventBridge). Queries the CloudFront logs via Athena,
computes page views (per site / per page / daily) and the cookieless MAU,
then writes a small stats.json into the main site's S3 bucket under
stats/data/ where the password-protected /stats page reads it.

Env vars:
  ATHENA_DATABASE   e.g. beautymoments_analytics
  ATHENA_TABLE      e.g. cf_logs
  ATHENA_WORKGROUP  e.g. beautymoments
  ATHENA_OUTPUT     s3://.../athena-results/   (workgroup result location)
  OUTPUT_BUCKET     beautymoments-main
  OUTPUT_KEY        stats/data/stats.json
  SALT_PARAM        SSM SecureString name, e.g. /beautymoments/analytics/salt
  RANGE_DAYS        default 30
"""
import json
import os
import time
from datetime import datetime, timezone

import boto3

athena = boto3.client("athena")
s3 = boto3.client("s3")
ssm = boto3.client("ssm")

DB = os.environ["ATHENA_DATABASE"]
TABLE = os.environ["ATHENA_TABLE"]
WG = os.environ["ATHENA_WORKGROUP"]
OUT_BUCKET = os.environ["OUTPUT_BUCKET"]
OUT_KEY = os.environ.get("OUTPUT_KEY", "stats/data/stats.json")
SALT_PARAM = os.environ["SALT_PARAM"]
RANGE_DAYS = int(os.environ.get("RANGE_DAYS", "30"))

SITE_LABELS = {
    "main": "beautymoments.de",
    "schorndorf": "schorndorf.beautymoments.de",
    "gmuend": "gmuend.beautymoments.de",
}

SITE_EXPR = (
    "CASE WHEN host_header LIKE 'schorndorf%' THEN 'schorndorf' "
    "WHEN host_header LIKE 'gmuend%' THEN 'gmuend' ELSE 'main' END"
)
PAGE_FILTER = (
    "sc_content_type LIKE 'text/html%' AND status IN (200,304) "
    "AND method = 'GET' AND uri NOT LIKE '/stats%'"
)


def _token(salt, period_expr):
    return (
        "to_hex(md5(to_utf8(concat('%s', request_ip, user_agent, %s))))"
        % (salt, period_expr)
    )


def run_query(sql):
    qid = athena.start_query_execution(
        QueryString=sql,
        QueryExecutionContext={"Database": DB},
        WorkGroup=WG,
    )["QueryExecutionId"]
    while True:
        st = athena.get_query_execution(QueryExecutionId=qid)["QueryExecution"]["Status"]
        state = st["State"]
        if state in ("SUCCEEDED", "FAILED", "CANCELLED"):
            break
        time.sleep(1.5)
    if state != "SUCCEEDED":
        raise RuntimeError("Athena %s: %s" % (state, st.get("StateChangeReason", "")))
    rows = []
    token = None
    while True:
        kw = {"QueryExecutionId": qid, "MaxResults": 1000}
        if token:
            kw["NextToken"] = token
        res = athena.get_query_results(**kw)
        rows.extend(res["ResultSet"]["Rows"])
        token = res.get("NextToken")
        if not token:
            break
    # drop header row, return list of list-of-values
    out = []
    for r in rows[1:]:
        out.append([c.get("VarCharValue") for c in r["Data"]])
    return out


def handler(event=None, context=None):
    salt = ssm.get_parameter(Name=SALT_PARAM, WithDecryption=True)["Parameter"]["Value"]
    month_expr = "substr(cast(\"date\" as varchar),1,7)"
    day_expr = "cast(\"date\" as varchar)"
    cutoff = "\"date\" >= current_date - interval '%d' day" % RANGE_DAYS

    q_sites = (
        "SELECT %s AS site, count(*) c FROM %s.%s "
        "WHERE %s AND %s GROUP BY 1" % (SITE_EXPR, DB, TABLE, cutoff, PAGE_FILTER)
    )
    q_pages = (
        "SELECT %s AS site, uri, count(*) c FROM %s.%s "
        "WHERE %s AND %s GROUP BY 1,2 ORDER BY 3 DESC LIMIT 20"
        % (SITE_EXPR, DB, TABLE, cutoff, PAGE_FILTER)
    )
    q_daily = (
        "SELECT %s AS d, count(*) c, count(distinct %s) v FROM %s.%s "
        "WHERE %s AND %s GROUP BY 1 ORDER BY 1"
        % (day_expr, _token(salt, day_expr), DB, TABLE, cutoff, PAGE_FILTER)
    )
    q_mau = (
        "SELECT count(distinct %s) FROM %s.%s "
        "WHERE %s = %s AND %s"
        % (_token(salt, month_expr), DB, TABLE, month_expr,
           "substr(cast(current_date as varchar),1,7)", PAGE_FILTER)
    )

    sites_raw = run_query(q_sites)
    pages_raw = run_query(q_pages)
    daily_raw = run_query(q_daily)
    mau_raw = run_query(q_mau)

    sites = sorted(
        ({"key": s, "label": SITE_LABELS.get(s, s), "pageviews": int(c)}
         for s, c in sites_raw),
        key=lambda x: -x["pageviews"],
    )
    pages = [
        {"site": s, "label": SITE_LABELS.get(s, s), "path": u or "/", "pageviews": int(c)}
        for s, u, c in pages_raw
    ]
    daily = [{"date": d, "pageviews": int(c), "visitors": int(v)} for d, c, v in daily_raw]
    mau = int(mau_raw[0][0]) if mau_raw and mau_raw[0][0] else 0
    total = sum(s["pageviews"] for s in sites)

    now = datetime.now(timezone.utc)
    doc = {
        "generatedAt": now.isoformat(),
        "rangeDays": RANGE_DAYS,
        "mau": {"current": mau, "month": now.strftime("%Y-%m")},
        "totals": {"pageviews": total},
        "sites": sites,
        "pages": pages,
        "daily": daily,
    }

    s3.put_object(
        Bucket=OUT_BUCKET,
        Key=OUT_KEY,
        Body=json.dumps(doc, ensure_ascii=False).encode("utf-8"),
        ContentType="application/json",
        CacheControl="no-cache, max-age=60",
    )
    return {"ok": True, "pageviews": total, "mau": mau}
