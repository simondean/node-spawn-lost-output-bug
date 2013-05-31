var ChildProcess = require('child_process');

var bin = process.argv.length > 2 ? process.argv[2] : 'bin/console';
console.log('bin: ' + bin);

var count = 1000;
var finishCount = 0;
var failCount = 0;

function test() {
  var child = ChildProcess.spawn('node', [bin], {
    cwd: '.',
    stdio: ['ignore', 'pipe', process.stderr],
    env: process.env
  });

  var stdoutData = [];
  
  child.stdout.on('data', function(data) {
    stdoutData.push(data);
  });

  child.on('exit', function(code, signal) {
  });

  child.on('close', function(code, signal) {
    finishCount++;
    
    if (stdoutData.length == 0) {
      failCount++;
    }
    
    if (finishCount < count) {
      test();
    }
    else {
      console.log('Flush succeeded ' + (count - failCount) + ' times');
      console.log('Flush failed ' + failCount + ' times');
      console.log('Flush failed ' + (failCount / count * 100) + '% of the time');
    }
  });

  child.on('disconnect', function() {
    console.log('disconnect');
  });
}

test();
