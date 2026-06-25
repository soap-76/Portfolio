/* ============================================
   DEV SERVER — Portfolio
   Serves static files + POST /save for data.json
   Usage: node server.js
   ============================================ */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const ROOT = __dirname;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

const server = http.createServer((req, res) => {
  // ── POST /save → write data.json ──
  if (req.method === 'POST' && req.url === '/save') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        // Validate JSON
        const parsed = JSON.parse(body);
        const pretty = JSON.stringify(parsed, null, 2);
        fs.writeFileSync(path.join(ROOT, 'data.json'), pretty, 'utf-8');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));
        console.log(`  💾  data.json saved (${(Buffer.byteLength(pretty) / 1024).toFixed(1)} KB)`);
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: err.message }));
        console.error('  ❌  Save error:', err.message);
      }
    });
    return;
  }

  // ── Static file serving ──
  let filePath = path.join(ROOT, req.url === '/' ? 'index.html' : req.url);

  // Clean URL: /admin → /admin.html
  if (!path.extname(filePath)) {
    const withHtml = filePath + '.html';
    if (fs.existsSync(withHtml)) filePath = withHtml;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`\n  ⚡  Portfolio dev server running at http://localhost:${PORT}`);
  console.log(`  📝  Admin panel: http://localhost:${PORT}/admin`);
  console.log(`  💾  POST /save endpoint ready\n`);
});
