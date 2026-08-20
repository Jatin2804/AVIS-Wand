const http = require('http');
const https = require('https');
const httpProxy = require('http-proxy');

// ============================================
// WAND UAT Session Configuration
// These cookies are captured from a live WebSEAL session.
// They expire — recapture from browser DevTools when they stop working.
// ============================================
const SESSION_COOKIES = {
  'IV_JCT_wand-avis.uat.avisbudget.com': '%2Fwand',
  'enableDisplayboards': 'false',
  'PedIpAddress': '1231233434',
  'app': 'wand',
  'PD-S-SESSION-ID': '1_2_1_9oJtPhH3DlodYRqCBbmN+2N+TAQWVKtlO9p8Y47-Yujo5u38',
  'stickyCookie': '"c8613fa4bfe2df03"',
  'PD-ID-EXT-AVIS': 'PD-ID=b5D+xq/8kvM4haP7efvC32BCQ5r+PCJ5m3aUOwCe7GONg43mQcDzFZSdb97+61SZxy9xUqkDAuZqWPjMlh2H/mCK9Q0Ym6LBetCWyQIQnEQ7/tn+zznUC/CEeiSMHIaMvpQSRKEQTuBK2WDIt9VgmZubOKAHKKI7Rp4FW5v8XpNSHhggoVslNjBsxbrtXHgJsvy3WAw4lFgYmY2TtMVQ7ZTbosrTPdsWVECLbbmAvp2UsrGRwJyLxDj/TcqS92DMqyth3tjmM41ybEeRl3HOErumlkFClAZlGeuSIPsQr3/yEmTh8qES2T7wffMM9+vn57xg8Ntp9AQu2FgqMBRceEOVWh8m9a7wy/xkOKnVrdH+4bx3GwV1cDAFEfBJhbtfbUP33lkLsoeSwZIIbkr1+T5Q6CD392NSAy6Xm5XguPD8yVsQYIkZxcQQdCt+c8jU9++qL7pRSpNzConFYRskl8I61igiABRvG/Bzd8r/Vcok5ne8bxs7yiVCrY8NJadw',
  'JSESSIONID': '81FF1F2ECACB486A7C8852C3E19C8D62',
  'kp': '81FF1F2ECACB486A7C8852C3E19C8D62',
};

const TARGET_SERVER = process.env.TARGET === 'local'
  ? 'http://localhost:18080'
  : process.env.TARGET === 'uat'
  ? 'https://wand-avis.uat.avisbudget.com'
  : 'https://service-webapp-wand.preprod.sdp.abg.cloud';

const PROXY_PORT = 9091;

// Create HTTPS agent that allows self-signed or mismatched certificates (dev only)
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

const proxy = httpProxy.createProxyServer({
  changeOrigin: true,
  agent: httpsAgent
});

proxy.on('error', (err, req, res) => {
  console.error('Proxy error:', err.message);
  res.writeHead(500, { 'Content-Type': 'text/plain' });
  res.end('Proxy error');
});

// Log responses
proxy.on('proxyRes', (proxyRes, req, res) => {
  console.log(`Response: ${proxyRes.statusCode} ${proxyRes.statusMessage}`);
  console.log('');
});

const server = http.createServer((req, res) => {
  console.log('==========================================');
  console.log(`Request: ${req.method} ${req.url}`);

  // --- Handle CORS preflight ---
  if (req.method === 'OPTIONS') {
    const origin = req.headers.origin || 'http://localhost:4200';
    res.writeHead(204, {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400',
    });
    res.end();
    console.log('   CORS preflight handled');
    console.log('');
    return;
  }

  // --- Inject session cookies on all /wand requests ---
  const cookieString = Object.entries(SESSION_COOKIES)
    .map(([name, value]) => `${name}=${value}`)
    .join('; ');
  req.headers.cookie = cookieString;
  console.log('   Injected session cookies');

  proxy.web(req, res, { target: TARGET_SERVER });
});

// Add CORS headers to proxied responses
proxy.on('proxyRes', function(proxyRes, req, res) {
  const origin = req.headers.origin || 'http://localhost:4200';
  proxyRes.headers['Access-Control-Allow-Origin'] = origin;
  proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
});

server.listen(PROXY_PORT, () => {
  console.log('==========================================');
  console.log('WAND Proxy (Cookie-based auth)');
  console.log(`   Listening on: http://localhost:${PROXY_PORT}`);
  console.log(`   Forwarding to: ${TARGET_SERVER}`);
  console.log(`   Target: ${process.env.TARGET === 'local' ? 'LOCAL' : process.env.TARGET === 'uat' ? 'UAT' : 'PREPROD'}`);
  console.log(`   Session: JSESSIONID=${SESSION_COOKIES.JSESSIONID?.slice(0, 8)}...`);
  console.log('==========================================');
  console.log('');
});
