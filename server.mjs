import http from 'http';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const server = http.createServer();

const __filename = fileURLToPath(import.meta.url);
const frontendDirectoryLocation = '../measurements–frontend';
const htmlFilePath = path.resolve(
  path.dirname(__filename),
  `${frontendDirectoryLocation}/index.html`
);
const cssFilePath = path.resolve(
  path.dirname(__filename),
  `${frontendDirectoryLocation}/styles.css`
);
const jsFilePath = path.resolve(
  path.dirname(__filename),
  `${frontendDirectoryLocation}/app.js`
);
const testFilePath = path.resolve(path.dirname(__filename), `./random.txt`);

const requestListener = (req, res) => {
  if (req.url === '/' && req.method === 'GET') {
    fs.readFile(htmlFilePath, (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Error loading HTML');
      } else {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
      }
    });
  } else if (req.url === '/styles.css' && req.method === 'GET') {
    fs.readFile(cssFilePath, (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Error loading CSS');
      } else {
        res.writeHead(200, { 'Content-Type': 'text/css' });
        res.end(data);
      }
    });
  } else if (req.url === '/app.js' && req.method === 'GET') {
    fs.readFile(jsFilePath, (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Error loading JavaScript');
      } else {
        res.writeHead(200, { 'Content-Type': 'application/javascript' });
        res.end(data);
      }
    });
  } else if (req.url === '/get-file' && req.method === 'GET') {
    fs.readFile(testFilePath, 'utf8', (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Error loading text file');
      } else {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end(data);
      }
    });
  } else if (req.url === '/uplink' && req.method === 'POST') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Uplink response');
  } else if (req.url === '/downlink' && req.method === 'POST') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Downlink response');
  } else {
    res.statusCode = 404;
    res.end('Not found');
  }
};

server.on('request', requestListener);

server.listen(1414, () => {
  console.log('Server is running on http://localhost:1414');
});
