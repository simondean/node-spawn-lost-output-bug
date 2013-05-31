var ChildProcess = require('child_process');

var bin = process.argv.length > 2 ? process.argv[2] : 'bin/console';
console.log('spawning ' + bin);

child = ChildProcess.spawn('node', [bin], {
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
