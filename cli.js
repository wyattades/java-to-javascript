const fs = require('fs');
const path = require('path');
const program = require('commander');
const javaToJs = require('./index');


program
.version(require('./package.json').version)
.description('Convert a Java file to an ES6 JavaScript file')
.arguments('<input_file>')
.option('-o, --output <file>', 'Specifies the output filename. (Default is the input filename with a .js extension)')
.option('--p5', 'Sets `scope` to "p5", and adds p5 variable mappings to `globals`')
.option('-s, --scope <scope>', 'If specified, variables in `globals` are appended to `scope` object')
.option('-g, --globals <file>', 'JSON or JavaScript file containing a global variable mapping. See README', (filename) => {
  return require(path.resolve(filename)).default;
})
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
const outputString = javaToJs(inputString, {
  p5: program.p5,
  globalVars: program.globals,
  globalScope: program.scope,
}, (progress, message) => {
  if (progress > 0) {
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
  }
  process.stdout.write(`${(progress * 100).toFixed(0)}%: ${message}`);
});
process.stdout.clearLine();
process.stdout.cursorTo(0);
  
fs.writeFileSync(outputFile, outputString, 'utf8');

console.log(`Successfully converted '${inputFile}' -> '${outputFile}'`);
