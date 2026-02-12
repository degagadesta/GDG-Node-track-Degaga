const http = require('http');
const server = http.createServer((req, res) => {
  if (req.method === 'GET') {
    if (req.url === '/') {
      res.statusCode = 200;
      res.end('Welcome to the Home Page');
    } else if (req.url === '/info') {
      res.statusCode = 200;
      res.end('This is the Information Page');
    } else {
      res.statusCode = 404;
      res.end('Page not found');
    }
  } else if (req.method === 'POST' && req.url === '/submit') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      res.statusCode = 200;
      res.end(`Data received: ${body}`);
    });
  } else {
    res.statusCode = 405;
    res.end('Method not allowed');
  }
});

server.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
