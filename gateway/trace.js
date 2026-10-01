const traces = [];
let seq = 0;

function trace(service) {
  return (req, res, next) => {
    if (req.path === '/_trace') return next();
    const id = req.headers['x-trace-id'] || `t${Date.now()}-${++seq}`;
    req.traceId = id;
    const from = req.headers['x-caller'] || 'client';
    const t = Date.now();
    const oj = res.json.bind(res);
    res.json = (b) => { res._body = b; return oj(b); };
    res.on('finish', () => {
      traces.push({
        ts: t, ms: Date.now() - t, traceId: id, service,
        from,
        method: req.method, path: req.originalUrl,
        reqBody: req.body, status: res.statusCode, resBody: res._body,
      });
      if (traces.length > 200) traces.shift();
    });
    next();
  };
}

const route = (req, res) => res.json(traces);

const clear = (req, res) => { traces.length = 0; res.json({ ok: true }); };

module.exports = { trace, route, clear };