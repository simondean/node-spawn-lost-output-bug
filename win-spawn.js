var WinSpawn = require('win-spawn');

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
