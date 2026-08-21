const http = require('http');
const https = require('https');
const httpProxy = require('http-proxy');

// ============================================
// Target backend
// ============================================
const TARGET_SERVER = process.env.TARGET === 'uat'
  ? 'https://wand-avis.uat.avisbudget.com'
  : 'https://emea-rental-ci-ns-wand-poc.dev.sdp.abg.cloud';

const PROXY_PORT = 9091;

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

const proxy = httpProxy.createProxyServer({
  changeOrigin: true,
  agent: httpsAgent
});

proxy.on('error', (err, req, res) => {
  console.error('Proxy error:', err.message);
  res.writeHead(500, { 'Content-Type': 'text/plain' });
  res.end('Proxy error');
});

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

  // Set stickyCookie for load balancer routing
  req.headers.cookie = 'stickyCookie="99fb53b2628c9ccc"';

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
  console.log('WAND Proxy');
  console.log(`   Listening on: http://localhost:${PROXY_PORT}`);
  console.log(`   Forwarding to: ${TARGET_SERVER}`);
  console.log(`   Auth: stickyCookie (dev endpoint)`);
  console.log('==========================================');
  console.log('');
});
