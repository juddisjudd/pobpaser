import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  
  // 1. Local CORS proxy endpoint
  if (url.pathname === '/api/fetch') {
    const targetUrl = url.searchParams.get('url');
    if (!targetUrl) {
      res.writeHead(400, { 'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*' });
      res.end('Missing url parameter');
      return;
    }
    
    try {
      console.log(`[Proxy] Fetching: ${targetUrl}`);
      const response = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'pob-parser-dev-server/1.0.0 (contact: pob-parser@example.com)'
        }
      });
      const text = await response.text();
      res.writeHead(response.status, {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(text);
    } catch (err) {
      console.error(`[Proxy] Error: ${err.message}`);
      res.writeHead(500, { 'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*' });
      res.end('Error fetching URL: ' + err.message);
    }
    return;
  }

  // 2. Serve static files
  let filePath = '';
  if (url.pathname === '/' || url.pathname === '/index.html') {
    filePath = path.join(__dirname, '../demo/index.html');
  } else if (url.pathname === '/index.global.js') {
    filePath = path.join(__dirname, '../demo/index.global.js');
  } else {
    filePath = path.join(__dirname, '..', url.pathname);
  }

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
    } else {
      let contentType = 'text/html';
      if (filePath.endsWith('.js')) {
        contentType = 'text/javascript';
      } else if (filePath.endsWith('.css')) {
        contentType = 'text/css';
      }
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`PoB Parser Dev Server running at http://localhost:${PORT}`);
  console.log(`To test url fetching without CORS issues:`);
  console.log(`1. Open http://localhost:${PORT} in your browser`);
  console.log(`======================================================\n`);
});
