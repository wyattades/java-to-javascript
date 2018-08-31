#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const program = require('commander');
const javaToJs = require('./index');


program
.version(require('./package.json').version)
.description('Convert a Java file to an ES6 JavaScript file')
.arguments('<input_file>')
.option('-o, --output <file>', 'Specifies the output filename. (Default is the input filename with a .js extension)')
.option('-s, --scope <scope>', 'If specified, variables in `globals` are appended to `scope` object')
.option('-g, --globals <file>', 'JSON or JavaScript file containing a global variable mapping. See README', (filename) => {
  return require(path.resolve(filename)).default;
})
.option('--p5', 'Sets `scope` to "p5", adds p5 variable mappings to `globals`, and allows for global methods and variables')
.option('--ugly', 'Don\'t beautify JavaScript code')
.parse(process.argv);

const inputFile = program.args[0];
if (!inputFile) {
  program.outputHelp();
  process.exit(1);
}

let outputFile = program.output;
if (!outputFile) {
  const filePath = path.parse(program.args[0]);
  outputFile = path.join(filePath.dir, `${filePath.name}.js`);
}

const inputString = fs.readFileSync(inputFile, { encoding: 'utf8' });

const startTime = process.hrtime();

const outputString = javaToJs(inputString, {
  p5: program.p5,
  globalVars: program.globals,
  globalScope: program.scope,
  ugly: program.ugly,
}, (progress, message) => {
  process.stdout.write(`${(progress * 100).toFixed(0)}%: ${message}`);
  readline.cursorTo(process.stdout, 0);
});

const elapsed = process.hrtime(startTime);
const elapsedMs = elapsed[0] * 1000 + elapsed[1] / 1000000;
  
fs.writeFileSync(outputFile, outputString, 'utf8');

console.log(`Successfully converted '${inputFile}' -> '${outputFile}' in ${elapsedMs.toFixed(2)}ms`);
