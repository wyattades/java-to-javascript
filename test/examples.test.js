const fs = require('fs');

const examples = fs.readdirSync('./examples');

// Setup p5 global
global.p5 = {};

for (const example of examples) {
  if (example.endsWith('.js')) {
    test('Example file ' + example + ' executes', () => {
      require('../examples/' + example);
    });
  }
}
