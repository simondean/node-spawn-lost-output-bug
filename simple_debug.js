var Debug = require('debug')('bug')
var WinSpawn = require('win-spawn');

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
