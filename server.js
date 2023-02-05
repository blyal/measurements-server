const http = require('http');
const path = require('path');
const fs = require('fs');

const server = http.createServer();

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
const testFilePath = path.resolve(__dirname, './random.txt');

const requestListener = (req, res) => {
  if (req.url === '/' && req.method === 'GET') {
    provider(res, htmlFilePath, 'HTML', 'text/html');
  } else if (req.url === '/styles.css' && req.method === 'GET') {
    provider(res, cssFilePath, 'CSS', 'text/css');
  } else if (req.url === '/app.js' && req.method === 'GET') {
    provider(res, jsFilePath, 'JavaScript', 'application/javascript');
  } else if (req.url === '/get-file' && req.method === 'GET') {
    provider(res, testFilePath, 'text file', 'text/plain', 'utf8');
  } else if (req.url === '/uplink' && req.method === 'POST') {
    let body = [];
    req
      .on('data', (chunk) => {
        body.push(chunk);
      })
      .on('end', () => {
        body = Buffer.concat(body).toString();
        console.log(`Received file of size: ${body.length}`);
        res.end('File uploaded');
      });
  } else if (req.url === '/downlink' && req.method === 'POST') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Downlink response');
  } else {
    res.statusCode = 404;
    res.end('Not found');
  }
};

function provider(res, filepath, contentType, contentTypeHeader, encoding) {
  fs.readFile(filepath, encoding, (err, data) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end(`Error loading ${contentType}`);
    } else {
      res.writeHead(200, { 'Content-Type': contentTypeHeader });
      res.end(data);
    }
  });
}

server.on('request', requestListener);

server.listen(1414, () => {
  console.log('Server is running on http://localhost:1414');
});
