var ChildProcess = require('child_process');

child = ChildProcess.spawn('node', ['bin/console'], {
  cwd: '.',
  stdio: ['ignore', 'pipe', process.stderr],
  env: process.env
});

child.stdout.on('data', function(data) {
  console.log('stdout');
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
