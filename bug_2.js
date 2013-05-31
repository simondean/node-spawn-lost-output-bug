var Debug = require('debug')('bug')
var WinSpawn = require('win-spawn');
var WebSocketDriver = require('websocket-driver');
var HTTP = require('http');
var URL = require('url');
var Net = require('net');

var server = HTTP.createServer();

server.on('request', function(req, res) {
  Debug('Request for ' + req.url);
  if (req.url == '/') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('WebSockets server');
  }
  else {
    res.writeHead(404);
    res.end();
  }
});

server.on('upgrade', function(request, socket, body) {
  Debug('Upgrade');
  if (!WebSocketDriver.isWebSocket(request)) return;

  var driver = WebSocketDriver.http(request);

  driver.io.write(body);
  socket.pipe(driver.io);
  driver.io.pipe(socket);

  Debug("Socket connected");

  driver.on('message', function(event) {
    Debug('Spawning child process');
    child = WinSpawn('node_modules/.bin/cucumber-js', ['features'], {
      cwd: '.',
      stdio: 'pipe',
      env: process.env
    });

    var stdout = [];

    child.stdout.on('data', function(data) {
      Debug('stdout');
      stdout.push(data);
    });

    child.stderr.on('data', function(data) {
      Debug('stderr');
      console.error(data.toString());
    });

    child.on('exit', function(code, signal) {
      Debug('exit');
    });

    child.on('close', function(code, signal) {
      Debug('close');
    });

    child.on('disconnect', function() {
      Debug('disconnect');
    });
  });
  
  driver.start();
});

var port = 3030;

server.listen(port, function() {
  console.log('Listening on port ' + port);
  
  var url = 'ws://localhost:' + port;
  Debug("Connecting to " + url);
  var driver = WebSocketDriver.client(url);
  var url = URL.parse(url);
  Debug("Starting TCP connection to " + url.hostname + ":" + url.port);
  var tcp = Net.createConnection({ host: url.hostname, port: url.port });
  Debug("Started connecting");

  tcp.pipe(driver.io);
  driver.io.pipe(tcp);

  tcp.on('error', function(error) {
    Debug("Received error event from tcp socket");
    console.error(error);
  });

  tcp.on('connect', function() {
    Debug("Starting driver");
    driver.start();
  });

  driver.on('open', function(event) {
    Debug("Received open event");
    
    Debug("Sending message");
    driver.text(JSON.stringify({ event: 'anything' }));
  });

  driver.on('error', function(event) {
    Debug("Received error event");
    console.error(event);
  });

  driver.on('close', function(event) {
    Debug("Received close event");
    tcp.end();
  });
});
