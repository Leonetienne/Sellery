# Sellery
What is this?  
Sellery is a free and open source node.js web server that aims to do one thing:  
Serve files from a webroot directory, but have them password protected.

If you navigate to your sellery instance, and request any file, you will instantly be prompted for a password.
Once entered (and correct), your browser will set a cookie with a session id. This session will remain active for (by default) 10 minutes when inactive.
It will only renew when requesting another file.
With this cookie set, you can freely browse your webroot as if it was hosted by a regular, public webserver.

Sellery can be functionally customized by modifying the config file, and optically customized by modifying
the `authenticate.html` file, which is the login page. Anything else (like the login-failed page) is a statically
served string. Serving a custom page would require a bit, but not much, more work.

Do note that just deleting key-value pairs from the config file will most likely result in the server just crashing :).

## Telemetry and logging
### Telemetry
Sellery, in of itself, records no telemetry what-so-ever. What node.js, or any of the installed packages, do in the background,
i have no idea. Probably nothing, but don't quote me on that.

### Logging
Sellery **only** logs failed login attempts. This is important for the users privacy, so they can check if
someone's trying to break into their instance. This can be fairly easily disabled though.
Again, i have no idea if node.js's https-server logs anything in the background. I don't think so.

## How to generate your ssl pem files (self-signed):
```sh
openssl genrsa -out key.pem
openssl req -new -key key.pem -out csr.pem
openssl x509 -req -days 9999 -in csr.pem -signkey key.pem -out cert.pem
rm csr.pem
```
If you were trying to host this publically (adventorous, aren't we?), you'd probably want to use certbot
to obtain a Let's Encrypt certificate.

# LICENSE
```
BSD 2-Clause License

Copyright (c) 2022, Leon Etienne
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this
   list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice,
   this list of conditions and the following disclaimer in the documentation
   and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
```

