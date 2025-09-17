import http from 'http';
import httpProxy from 'http-proxy';

// Create a proxy server with target pointing to the Vite dev server
const proxy = httpProxy.createProxyServer({
  target: 'http://localhost:8080',
  changeOrigin: true,
  ws: true, // Enable WebSocket proxying for Vite HMR
});

// Harden the proxy by explicitly setting the Host header
proxy.on('proxyReq', (proxyReq, req, res) => {
  proxyReq.setHeader('host', 'localhost:8080');
});

// Create the server that listens on port 5000
const server = http.createServer((req, res) => {
  proxy.web(req, res, (err) => {
    if (err) {
      console.error('Proxy error:', err);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Proxy error');
    }
  });
});

// Handle WebSocket connections for Vite HMR
server.on('upgrade', (req, socket, head) => {
  proxy.ws(req, socket, head);
});

// Start the proxy server on port 5000
server.listen(5000, '0.0.0.0', () => {
  console.log('🚀 Proxy server running on port 5000, forwarding to port 8080');
});

// Handle proxy errors
proxy.on('error', (err, req, res) => {
  console.error('Proxy error:', err);
  if (res && !res.headersSent) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Proxy error');
  }
});