var WinSpawn = require('win-spawn');
var WebSocketDriver = require('websocket-driver');
var HTTP = require('http');
var URL = require('url');
var Net = require('net');

var server = HTTP.createServer();

server.on('request', function(req, res) {
  console.log('Request for ' + req.url);
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
  console.log('Upgrade');
  if (!WebSocketDriver.isWebSocket(request)) return;

  var driver = WebSocketDriver.http(request);

  driver.io.write(body);
  socket.pipe(driver.io);
  driver.io.pipe(socket);

  console.log("Socket connected");

  driver.on('message', function(event) {
    console.log('Spawning child process');
    child = WinSpawn('node_modules/.bin/cucumber-js', ['features'], {
      cwd: '.',
      stdio: 'pipe',
      env: process.env
    });

    var stdout = [];

    child.stdout.on('data', function(data) {
      console.log('stdout');
      stdout.push(data);
    });

    child.stderr.on('data', function(data) {
      console.log('stderr');
      console.error(data.toString());
    });

    child.on('exit', function(code, signal) {
      console.log('exit');
    });

    child.on('close', function(code, signal) {
      console.log('close');
    });

    child.on('disconnect', function() {
      console.log('disconnect');
    });
  });
  
  driver.start();
});

var port = 3030;

server.listen(port, function() {
  console.log('Listening on port ' + port);
  
  var url = 'ws://localhost:' + port;
  console.log("Connecting to " + url);
  var driver = WebSocketDriver.client(url);
  var url = URL.parse(url);
  console.log("Starting TCP connection to " + url.hostname + ":" + url.port);
  var tcp = Net.createConnection({ host: url.hostname, port: url.port });
  console.log("Started connecting");

  tcp.pipe(driver.io);
  driver.io.pipe(tcp);

  tcp.on('error', function(error) {
    console.log("Received error event from tcp socket");
    console.error(error);
  });

  tcp.on('connect', function() {
    console.log("Starting driver");
    driver.start();
  });

  driver.on('open', function(event) {
    console.log("Received open event");
    
    console.log("Sending message");
    driver.text(JSON.stringify({ event: 'anything' }));
  });

  driver.on('error', function(event) {
    console.log("Received error event");
    console.error(event);
  });

  driver.on('close', function(event) {
    console.log("Received close event");
    tcp.end();
  });
});
