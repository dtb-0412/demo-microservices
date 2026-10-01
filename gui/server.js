const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const ROOT = path.join(__dirname, '..');
const GW = 'http://localhost:3000';
const PORTS = { gateway: 3000, 'product-service': 3001, 'order-service': 3002 };

const readBody = (req) =>
  new Promise((r) => {
    let s = '';
    req.on('data', (c) => (s += c));
    req.on('end', () => r(s ? JSON.parse(s) : {}));
  });

async function isUp(port) {
  try {
    await fetch(`http://localhost:${port}/`, { signal: AbortSignal.timeout(1000) });
    return true;
  } catch {
    return false;
  }
}

const send = (res, obj) => {
  res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(obj));
};

http
  .createServer(async (req, res) => {
    if (req.url === '/') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(fs.readFileSync(path.join(__dirname, 'index.html')));
    }

    if (req.url === '/api/status') {
      const out = {};
      await Promise.all(Object.entries(PORTS).map(async ([n, p]) => (out[n] = await isUp(p))));
      return send(res, out);
    }

    if (req.url === '/api/docker') {
      const { action, service } = await readBody(req);
      if (!['start', 'stop'].includes(action) || !PORTS[service]) return send(res, { ok: false, error: 'Tham so khong hop le' });
      return exec(`docker compose ${action} ${service}`, { cwd: ROOT }, (err) =>
        send(res, err ? { ok: false, error: err.message } : { ok: true })
      );
    }

    if (req.url === '/api/call') {
      const { method, path: p, body } = await readBody(req);
      const t = Date.now();
      try {
        const r = await fetch(GW + p, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: body ? JSON.stringify(body) : undefined,
          signal: AbortSignal.timeout(5000),
        });
        const text = await r.text();
        let data;
        try { data = JSON.parse(text); } catch { data = text; }
        return send(res, { status: r.status, ms: Date.now() - t, data });
      } catch (e) {
        return send(res, { status: 0, ms: Date.now() - t, data: e.message });
      }
    }

    res.writeHead(404);
    res.end();
  })
  .listen(4000, () => console.log('Demo UI: http://localhost:4000'));