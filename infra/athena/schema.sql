-- Athena schema + reference queries for Beauty Moments CloudFront analytics.
-- Log source: CloudFront *standard* (legacy) access logs, all three
-- distributions writing into s3://beautymoments-logs/cf/ .
-- The viewer-requested domain is in `host_header`, so ONE table covers all
-- three sites and we derive the site from that column.

CREATE DATABASE IF NOT EXISTS beautymoments_analytics;

CREATE EXTERNAL TABLE IF NOT EXISTS beautymoments_analytics.cf_logs (
  `date` DATE,
  time STRING,
  location STRING,
  bytes BIGINT,
  request_ip STRING,
  method STRING,
  host STRING,
  uri STRING,
  status INT,
  referrer STRING,
  user_agent STRING,
  query_string STRING,
  cookie STRING,
  result_type STRING,
  request_id STRING,
  host_header STRING,
  request_protocol STRING,
  request_bytes BIGINT,
  time_taken FLOAT,
  xforwarded_for STRING,
  ssl_protocol STRING,
  ssl_cipher STRING,
  response_result_type STRING,
  http_version STRING,
  fle_status STRING,
  fle_encrypted_fields INT,
  c_port INT,
  time_to_first_byte FLOAT,
  x_edge_detailed_result_type STRING,
  sc_content_type STRING,
  sc_content_len BIGINT,
  sc_range_start BIGINT,
  sc_range_end BIGINT
)
ROW FORMAT DELIMITED FIELDS TERMINATED BY '\t'
LOCATION 's3://beautymoments-logs/cf/'
TBLPROPERTIES ('skip.header.line.count'='2');

-- Site derivation (reused below):
--   host_header LIKE 'schorndorf%' -> 'schorndorf'
--   host_header LIKE 'gmuend%'     -> 'gmuend'
--   else                           -> 'main'
-- Page filter (a real page view, not an asset):
--   sc_content_type LIKE 'text/html%' AND status IN (200,304)
--   AND method='GET' AND uri NOT LIKE '/stats%'

-- 1) Page views per site, last 30 days
SELECT
  CASE WHEN host_header LIKE 'schorndorf%' THEN 'schorndorf'
       WHEN host_header LIKE 'gmuend%' THEN 'gmuend'
       ELSE 'main' END AS site,
  count(*) AS pageviews
FROM beautymoments_analytics.cf_logs
WHERE "date" >= current_date - interval '30' day
  AND sc_content_type LIKE 'text/html%' AND status IN (200,304)
  AND method = 'GET' AND uri NOT LIKE '/stats%'
GROUP BY 1 ORDER BY 2 DESC;

-- 2) Monthly Active Users (current calendar month) — cookieless, monthly-rotating
--    non-reversible token. ':SALT' is injected by the Lambda at runtime.
SELECT count(DISTINCT to_hex(md5(to_utf8(
         concat(':SALT', request_ip, user_agent, substr(cast("date" AS varchar),1,7))
       )))) AS mau
FROM beautymoments_analytics.cf_logs
WHERE substr(cast("date" AS varchar),1,7) = substr(cast(current_date AS varchar),1,7)
  AND sc_content_type LIKE 'text/html%' AND status IN (200,304)
  AND method = 'GET' AND uri NOT LIKE '/stats%';
