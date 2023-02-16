const http = require('http');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const server = http.createServer();

const isDev = process.env.NODE_ENV === 'development';
//TODO: replace with const serverUrl = isDev ? 'http://localhost:1414' : liveURL;
const serverUrl = 'http://localhost:1414';

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
const textFilePath = path.resolve(__dirname, './random.txt');
const dataFilePath = path.resolve(__dirname, './data.csv');

const requestListener = (req, res) => {
  if (req.url === '/' && req.method === 'GET') {
    provider(res, htmlFilePath, 'HTML', 'text/html');
  } else if (req.url === '/styles.css' && req.method === 'GET') {
    provider(res, cssFilePath, 'CSS', 'text/css');
  } else if (req.url === '/app.js' && req.method === 'GET') {
    provider(res, jsFilePath, 'JavaScript', 'application/javascript');
  } else if (req.url === '/get-file' && req.method === 'GET') {
    provider(res, textFilePath, 'text file', 'text/plain', 'utf8');
  } else if (req.url === '/download-data' && req.method === 'GET') {
    provider(
      res,
      dataFilePath,
      'CSV file',
      'text/csv',
      null,
      'attachment; filename="data.csv'
    );
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
  } else if (req.url === '/append-data' && req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      if (!fs.existsSync('data.csv')) {
        const header = `${dataColumnTitles.testLabel},${dataColumnTitles.remoteEndpoint},${dataColumnTitles.testLocalStartTime},${dataColumnTitles.timeElapsed},${dataColumnTitles.ICMPTrialsAttempted},${dataColumnTitles.successfulICMPTrials},${dataColumnTitles.latency},${dataColumnTitles.minRTT},${dataColumnTitles.maxRTT},${dataColumnTitles.packetLossRatio},${dataColumnTitles.advertisedDataRate},${dataColumnTitles.httpUpTrialsAttempted},${dataColumnTitles.successfulHttpUpTrials},${dataColumnTitles.meanSuccessHttpUpTime},${dataColumnTitles.minSuccessHttpUpTime},${dataColumnTitles.maxSuccessHttpUpTime},${dataColumnTitles.uplinkThroughput},${dataColumnTitles.uplinkUnsuccessfulFileAccess},${dataColumnTitles.httpDownTrialsAttempted},${dataColumnTitles.successfulHttpDownTrials},${dataColumnTitles.meanSuccessHttpDownTime},${dataColumnTitles.minSuccessHttpDownTime},${dataColumnTitles.maxSuccessHttpDownTime},${dataColumnTitles.downlinkThroughput},${dataColumnTitles.downlinkUnsuccessfulFileAccess}\n`;
        fs.writeFileSync('data.csv', header);
      }
      const parsedBody = JSON.parse(body);

      const csvRow = `${parsedBody.testLabel},${parsedBody.remoteEndpoint},"${parsedBody.testLocalStartTime}",${parsedBody.timeElapsed},${parsedBody.ICMPTrialsAttempted},${parsedBody.successfulICMPTrials},${parsedBody.latency},${parsedBody.minRTT},${parsedBody.maxRTT},${parsedBody.packetLossRatio},${parsedBody.advertisedDataRate},${parsedBody.httpUpTrialsAttempted},${parsedBody.successfulHttpUpTrials},${parsedBody.meanSuccessHttpUpTime},${parsedBody.minSuccessHttpUpTime},${parsedBody.maxSuccessHttpUpTime},${parsedBody.uplinkThroughput},${parsedBody.uplinkUnsuccessfulFileAccess},${parsedBody.httpDownTrialsAttempted},${parsedBody.successfulHttpDownTrials},${parsedBody.meanSuccessHttpDownTime},${parsedBody.minSuccessHttpDownTime},${parsedBody.maxSuccessHttpDownTime},${parsedBody.downlinkThroughput},${parsedBody.downlinkUnsuccessfulFileAccess}\n`;

      fs.appendFile('data.csv', csvRow, function (err) {
        if (err) throw err;
      });
      res.end('Added data to CSV');
    });
  } else {
    res.statusCode = 404;
    res.end('Not found');
  }
};

function provider(
  res,
  filepath,
  contentType,
  contentTypeHeader,
  encoding,
  contentDispositionHeader = 'inline'
) {
  fs.readFile(filepath, encoding, (err, data) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end(`Error loading ${contentType}`);
    } else if (contentType === 'HTML') {
      const urlScriptTag = `<script>window.serverUrl = '${serverUrl}'</script>`;
      data = data
        .toString()
        .replace(
          '<script src="app.js">',
          `${urlScriptTag}\n<script src="app.js">`
        );
      res.writeHead(200, {
        'Content-Type': contentTypeHeader,
      });
      res.end(data);
    } else {
      res.writeHead(200, {
        'Content-Type': contentTypeHeader,
        'Content-Disposition': contentDispositionHeader,
      });
      res.end(data);
    }
  });
}

const dataColumnTitles = {
  testLabel: 'Test Label',
  remoteEndpoint: 'Remote Endpoint',
  testLocalStartTime: 'Tests Started (local time)',
  timeElapsed: 'Time Elapsed',
  ICMPTrialsAttempted: 'ICMP Trials Attempted',
  successfulICMPTrials: 'ICMP Trials Successful',
  latency: 'Latency (ms)',
  minRTT: 'Min RTT (ms)',
  maxRTT: 'Max RTT (ms)',
  packetLossRatio: 'Packet Loss Ratio (%)',
  advertisedDataRate: 'Advertised Data Rate (Mb/s)',
  httpUpTrialsAttempted: 'Uplink Trials Attempted',
  successfulHttpUpTrials: 'Uplink Trials Successful',
  meanSuccessHttpUpTime: 'Mean Time per successful uplink trial (ms)',
  minSuccessHttpUpTime: 'Min successful uplink trial time (ms)',
  maxSuccessHttpUpTime: 'Max successful uplink trial time (ms)',
  uplinkThroughput: 'Uplink Throughput (%)',
  uplinkUnsuccessfulFileAccess: 'Uplink Unsuccessful file access ratio (%)',
  httpDownTrialsAttempted: 'Downlink Trials Attempted',
  successfulHttpDownTrials: 'Downlink Trials Successful',
  meanSuccessHttpDownTime: 'Mean Time per successful downlink trial (ms)',
  minSuccessHttpDownTime: 'Min successful downlink trial time (ms)',
  maxSuccessHttpDownTime: 'Max successful downlink trial time (ms)',
  downlinkThroughput: 'Downlink Throughput (%)',
  downlinkUnsuccessfulRatio: 'Downlink Unsuccessful file access ratio (%)',
};

server.on('request', requestListener);

server.listen(1414, () => {
  console.log(`Server is running on ${serverUrl}`);
});
