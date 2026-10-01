const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

const { trace, route, clear } = require('./trace');
app.use(trace('gateway'));
app.get('/_trace', route);
app.delete('/_trace', clear);
app.use((req, res, next) => {
  req.headers['x-trace-id'] = req.traceId;
  req.headers['x-caller'] = 'gateway';
  next();
});

app.use(createProxyMiddleware({ target: process.env.PRODUCT_URL || 'http://localhost:3001', pathFilter: '/products' }));
app.use(createProxyMiddleware({ target: process.env.ORDER_URL || 'http://localhost:3002', pathFilter: '/orders' }));

app.listen(3000, () => console.log('Gateway: 3000'));