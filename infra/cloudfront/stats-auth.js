// CloudFront Function (runtime cloudfront-js-2.0), viewer-request.
// Purpose: HTTP Basic Auth for the /stats* path + directory-index rewrite
// so /stats and /stats/ resolve to /stats/index.html on the S3 origin.
//
// The credential below is a Base64 of "user:password". CloudFront Functions
// cannot read secrets at runtime, so the value is baked into the code.
// Rotating the password = edit this constant, re-publish the function.
// Generate the token:  printf 'cindy:CHOOSE_A_PASSWORD' | base64
var EXPECTED = 'Basic __REPLACE_WITH_BASE64_TOKEN__';

function handler(event) {
  var request = event.request;
  var uri = request.uri;

  // Data files are fetched by the page's own JS — browsers don't forward
  // Basic Auth credentials in fetch(), so we exempt the data prefix from auth.
  // The path is not publicly advertised and the stats are not sensitive.
  if (uri.indexOf('/stats/data/') === 0) {
    return request;
  }

  var headers = request.headers;
  if (!headers.authorization || headers.authorization.value !== EXPECTED) {
    return {
      statusCode: 401,
      statusDescription: 'Unauthorized',
      headers: {
        'www-authenticate': { value: 'Basic realm="Beauty Moments Statistik"' },
        'cache-control': { value: 'no-store' },
      },
    };
  }

  // Directory-index rewrite for the static page on the S3 origin.
  if (uri.endsWith('/')) {
    request.uri = uri + 'index.html';
  } else if (!uri.split('/').pop().includes('.')) {
    request.uri = uri + '/index.html';
  }
  return request;
}
