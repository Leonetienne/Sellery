#!/home/menethil/.nvm/versions/node/v14.16.1/bin/node

var http = require('http');
var fs = require('fs');
var path = require('path');

const contentTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.bmp': 'image/bmp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
};

var server = http.createServer(function (request, response) {
  // Handle requests here...

  // Fetch requested file
  fs.readFile(__dirname + request.url, function (error, data) {
    if(!error) {
        const mimetype = path.extname(request.url);
        if (!(typeof mimetype === 'undefined')) {

        response.writeHead(200, {
          'Content-Type': mimetype
        });
        response.end(data);
        return;
      } else {
        response.writeHead(500, {
          'Content-Type': 'text/html'
        });

        console.error('Unknown file mime type for file: ' + __dirname + request.url);
        response.end('Unknown file mime type.');
        return;
      }
    } else {
      response.writeHead(404, {
        'Content-Type': 'text/html'
      });

      console.error('File not found: ' + JSON.stringify(error));
      response.end('File not found.');
      return;
    }
  });
});

const port = 80;
server.listen(port);
console.log('Node.js sellery server running and listening to port ' + port);

