var http = require('http');
var fs = require('fs');
var path = require('path');
var querystring = require('querystring');
var crypto = require('crypto');
var execSync = require('child_process').execSync;

//! How many seconds (from the last interaction) a session stays valid
const SESSION_DURATION = 10*60;

// Just a few mime types
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

sessions = [];

//! Will create a session and return it's id.
function createSession() {
  const timestamp = Date.now();
  const sessionId = SHA512Digest(timestamp.toString() + Math.floor(Math.random() * 100000).toString());

  sessions.push({
    'sessionId': sessionId,
    'timestamp': timestamp
  });

  return sessionId;
}

//! Will check if a session of a given id exsists, and if it has been expired.
//! Will removed if expired.
//! Will also renew a sessions timestamp
function isSessisionValid(id) {
  // Get an array of all sessions matching this id (should be 1 or 0)
  var filteredSessions = sessions.filter((value, index, array) => {
    return value.sessionId === id;
  });

  // Quick-reject: No session of this id
  if (filteredSessions.length === 0) {
    console.log('No session of this id...');
    return false;
  }

  // Else: fetch the session
  var sessionById = filteredSessions[0];

  // Is the session still valid?
  if (Date.now() - sessionById.timestamp > SESSION_DURATION * 1000) {
    console.log('Session is no longer valid, because it expired... Removing it...');

    // Remove the session from the list of sessions
    const indexOfSession = sessions.indexOf(sessionById);
    sessions.splice(indexOfSession, 1);

    return false;
  }

  // Else: It must be valid. We should update its timestamp.
  console.log('Session is active. Bumping timestamp...');
  sessionById.timestamp = Date.now();
  return true;
}

//! Will decode cookies to an array
//! Source: https://stackoverflow.com/a/3409200
//! I know this fails if a cookie contains '='. Mine don't!
function parseCookies(request) {
    const list = {};
    const cookieHeader = request.headers?.cookie;
    if (!cookieHeader) return list;

    cookieHeader.split(`;`).forEach(function(cookie) {
        let [ name, ...rest] = cookie.split(`=`);
        name = name?.trim();
        if (!name) return;
        const value = rest.join(`=`).trim();
        if (!value) return;
        list[name] = decodeURIComponent(value);
    });

    return list;
}

function SHA512Digest(string) {
  return crypto.createHash('sha512').update(string, 'utf-8').digest('hex');
}

function serveAuthenticatePage(request, response) {
  fs.readFile(__dirname + '/authenticate.html', function (error, data) {
    if (!error) {
      response.writeHead(200, {
        'Content-Type': 'text/html'
      });
      response.end(data);
      return;
    } else {
      response.writeHead(500, {
        'Content-Type': 'text/html'
      });

      console.error('Unable to read authentication html file: ' + JSON.stringify(error));
      response.end('Internal server error.');
      return;
    }
  });
}

// FIX THIS BS!
const PASSWD_HASH = 'a3c1443b087cf5338d3696f6029fdf791ee4829a27e19c9f257a06ca0d88b5b518ac9868bb13199e807553bda62d3dc15b6354862f34fcab0a7c4c45530349ea';

function testAuthentication(request, response) {
    // Wait for the request to have been received completely (including request body)
    console.log('Request is trying to authenticate... Waiting for request body...');
    response.writeHead(200, {
        'Content-Type': 'text/html'
    });

    // Collect post data (request body)
    var requestBody = '';
    request.on('data', function(data) {
      requestBody += data.toString();
    });

    // Process post data
    request.on('end', function() {
      console.log('Received complete request body.');

      // Extract password from the request and hash it
      const postData = querystring.parse(requestBody);
      const password = postData['password'];
      const passwordHash = SHA512Digest(password);

      // Is the password good?
      if (passwordHash === PASSWD_HASH) {
        // Yes, it is:
        // Create session
        const sessionId = createSession();

        response.writeHead(200, {
          'Content-Type': 'text/html',
          'Set-Cookie': 'sesid=' + sessionId
        });
        response.end('Access granted! You\'re in!');
        return;
      } else {
        response.writeHead(401, {
          'Content-Type': 'text/html'
        });
        response.end('WOOP! WOOP! Invalid password!<br><br>Need to reset your password? Replace the password hash in access.yaml with a new one.<br>This password hashes to: <em>' + passwordHash + '</em>.');
        return;
      }

      return;
    });
}

function serverStaticFiles(request, response) {
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
}

var server = http.createServer(function (request, response) {
  // Handle requests here...

  // If request is trying to authenticate
  if (request.url == '/api--authenticate') {
    testAuthentication(request, response);
    return;
  }
  else /* Request is not trying to authenticate */ {

    // Parse request cookies
    const cookies = parseCookies(request);
    console.log(cookies);

    // Check if the user is authenticated
    if ((cookies.hasOwnProperty('sesid')) && (isSessisionValid(cookies['sesid']))) {
      // Session is authenticated. File access is granted.
      serverStaticFiles(request, response);
      return;

    } else /* Session is not authenticated */ { 
      serveAuthenticatePage(request, response);
      return;
    }
  }
});

const port = 80;
server.listen(port);
console.log('Node.js sellery server running and listening to port ' + port);
