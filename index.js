/**
 * @module java-to-javascript
 */

const javaParser = require('java-parser');
const beautify = require('js-beautify/js/lib/beautify');
const p5_options = require('./p5_options');

const DEV = process.env.NODE_ENV === 'development';


const opts = {
  beautifyOptions: {
    indent_size: 2,
  },
  globalVars: {},
  globalScope: null,
};


const literalInitializers = {
  int: '0',
  float: '0',
  double: '0',
  short: '0',
  long: '0',
  char: '\'\'',
  boolean: 'false',
};

const unhandledNode = (node) => {
  const msg = `Unhandled node: ${node.node}`;
  if (DEV) throw msg;
  else console.error(msg);
  return '';
};

const joinStatements = (stats) => `${stats.join(';')}${stats.length ? ';' : ''}`;

const varToString = ({ name, value, type, final }, noLet) => {
  if (value === undefined) value = literalInitializers[type] || 'null';
  return `${noLet !== true ? (final ? 'const ' : 'let ') : ''}${name} = ${value}`;
};

const parseClass = (class_, isGlobal) => {
  const classData = {
    name: class_.name.identifier,
    constructor: null,
    classes: [],
    vars: [],
    methods: [],
  };
  const classVarsMap = {};

  const assignParent = (name) => {
    if (name in classVarsMap) return `this.${name}`;
    const mapped = opts.globalVars[name];
    if (mapped) {
      const newName = typeof mapped === 'string' ? mapped : name;
      return opts.globalScope ? `${opts.globalScope}.${newName}` : newName;
    }
    return name;
  };

  const parseType = (type) => {
    if (type.node === 'ArrayType') return 'Array'; // Doesn't matter what we return, we don't use it
    else if (type.node === 'SimpleType') return type.name.identifier;
    else if (type.node === 'PrimitiveType') return type.primitiveTypeCode;
    else if (type.node === 'ParameterizedType') return parseType(type.type);
    else return unhandledNode(type);
  };
  
  const parseExpr = (expr, isTop) => {
    if (!expr) return undefined;
  
    switch (expr.node) {
      case 'ThisExpression':
        return 'this';
      case 'NullLiteral':
        return 'null';
      case 'BooleanLiteral':
        return expr.booleanValue;
      case 'NumberLiteral':
        return expr.token;
      case 'StringLiteral':
        return expr.escapedValue.replace(/'/g, '\\\'').replace(/"/g, '\'');
      case 'CharacterLiteral':
        return expr.escapedValue;
      case 'CastExpression':
        // TODO: use expr.type to convert?
        return parseExpr(expr.expression);
      case 'ConditionalExpression':
        return `${parseExpr(expr.expression)} ? ${parseExpr(expr.thenExpression)} : ${parseExpr(expr.elseExpression)}`;
      case 'SimpleName':
        return assignParent(expr.identifier);
      case 'QualifiedName':
        return `${parseExpr(expr.qualifier)}.${expr.name.identifier}`;
      case 'FieldAccess':
        return `${parseExpr(expr.expression)}.${expr.name.identifier}`;
      case 'Assignment':
        return `${parseExpr(expr.leftHandSide)} ${expr.operator} ${parseExpr(expr.rightHandSide)}`;
      case 'InfixExpression':
        let op = expr.operator;
        if (op === '!=' || op === '==') op += '=';
        return `${parseExpr(expr.leftOperand)} ${op} ${parseExpr(expr.rightOperand)}`;
      case 'MethodInvocation':
        const args = `(${expr.arguments.map(parseExpr)})`;
        if (expr.expression) return `${parseExpr(expr.expression)}.${expr.name.identifier}${args}`;
        return `${assignParent(expr.name.identifier)}${args}`;
      case 'SuperMethodInvocation':
        return `super.${expr.name.identifier}(${expr.arguments.map(parseExpr)})`;
      case 'ClassInstanceCreation':
        return `new ${parseType(expr.type)}(${expr.arguments.map(parseExpr)})`;
      case 'PostfixExpression':
        return `${parseExpr(expr.operand)}${expr.operator}`;
      case 'PrefixExpression':
        return `${expr.operator}${parseExpr(expr.operand)}`;
      case 'VariableDeclarationExpression':
        return `${parseFieldVars(expr).map(varToString)}`;
      case 'ArrayInitializer':
        return `[${expr.expressions.map(parseExpr)}]`;
      case 'ArrayCreation':
        return `new Array(${expr.asdds.size})` // TODO multiple dimensions?
      case 'ArrayAccess':
        return `${expr.array.identifier}[${parseExpr(expr.index)}]`;
      case 'ParenthesizedExpression':
        return `(${parseExpr(expr.expression)})`
      default: return unhandledNode(expr);
    }
  };

  const parseModifiers = (modifiers) => {
    const mods = {};
    for (const mod of modifiers) {
      if (mod.keyword === 'static') mods.static = true;
      else if (mod.keyword === 'final') mods.final = true;
    }
    return mods;
  };
  
  const parseFieldVars = (field) => {
    const vars = [];
    const data = parseModifiers(field.modifiers);
    data.type = parseType(field.type);

    for (const frag of field.fragments) {
      if (frag.node === 'VariableDeclarationFragment') {
        vars.push(Object.assign({
          name: frag.name.identifier,
          value: parseExpr(frag.initializer, true),
        }, data));
      } else unhandledNode(frag);
    }

    return vars;
  };

  const parseStatement = (stat) => {
    switch (stat.node) {
      case 'ExpressionStatement':
        return parseExpr(stat.expression, true);
      case 'VariableDeclarationStatement':
        return parseFieldVars(stat).map(varToString);
      case 'ReturnStatement':
        return (`return ${parseExpr(stat.expression, true)}`);
      case 'IfStatement':
        let ifBlock = `if (${parseExpr(stat.expression, true)}) {${parseBlock(stat.thenStatement)}}`;
        if (stat.elseStatement) ifBlock += ` else {${parseBlock(stat.thenStatement)}}`;
        return (ifBlock);
      case 'WhileStatement':
        return (`while (${parseExpr(stat.expression, true)}) {${parseBlock(stat.body)}}`);
      case 'ForStatement':
        return (`for (${stat.initializers.map((_) => parseExpr(_, true))};${parseExpr(stat.expression, true)};${stat.updaters.map((_) => parseExpr(_, true))}) {${parseBlock(stat.body)}}`);
      case 'BreakStatement':
        return ('break');
      case 'TryStatement':
        let tryBlock = `try {${parseBlock(stat.body)}}`;
        for (const clause of stat.catchClauses) tryBlock += ` catch (${clause.exception.name.identifier}) {${parseBlock(clause.body)}}`; // TODO handle exception types?
        if (stat.finally) tryBlock += ` finally {${parseBlock(stat.finally)}}`;
        return tryBlock;
      default: return unhandledNode(stat);;
    }
  };

  const parseBlock = (block) => {
    const semicolon = (str) => `${str}${str.endsWith('}') ? '' : ';'}`;

    if (block.node !== 'Block') return semicolon(parseStatement(block));
  
    const statements = [];

    for (const stat of block.statements) {
      const str = parseStatement(stat);
      const arr = Array.isArray(str) ? str : [ str ];
      statements.push(...arr.map(semicolon));
    }
  
    return statements.join('');
  };
  
  const parseMethod = (method) => {
    const data = Object.assign({
      name: method.name.identifier,
      parameters: [],
    }, parseModifiers(method.modifiers));
  
    for (const param of method.parameters) {
      if (param.node === 'SingleVariableDeclaration') data.parameters.push(param.name.identifier);
      else unhandledNode(block);
    }
  
    data.block = parseBlock(method.body);
  
    return data;
  };

  for (const dec of class_.bodyDeclarations) {
    if (dec.node === 'FieldDeclaration') {
      classData.vars.push(...parseFieldVars(dec));
    } else if (dec.node === 'MethodDeclaration' && !dec.constructor && isGlobal !== true) {
      classVarsMap[dec.name.identifier] = true;
    }
  }

  if (isGlobal !== true) {
    for (const var_ of classData.vars) classVarsMap[var_.name] = true;
  }
  

  for (const dec of class_.bodyDeclarations) {
    if (dec.node === 'TypeDeclaration') classData.classes.push(parseClass(dec));
    else if (dec.node === 'MethodDeclaration') {
      if (dec.constructor) classData.constructor = parseMethod(dec);
      else classData.methods.push(parseMethod(dec));
    } else if (dec.node !== 'FieldDeclaration') unhandledNode(dec);
  }

  return classData;
};

const classToJs = ({ name: className, vars, constructor: con, methods }) => {
  const initVars = [];
  const classProps = [];
  const staticVars = [];

  for (const var_ of vars) {
    if (var_.value === undefined) var_.value = literalInitializers[var_.type] || 'null';
    if (var_.static) staticVars.push(`${className}.${var_.name} = ${var_.value};`);
    else initVars.push(`this.${var_.name} = ${var_.value};`);
  }
  const initVarsStr = initVars.join('') + (initVars.length ? '\n\n' : '');

  if (con || initVars) classProps.push(`constructor(${con ? con.parameters : ''}) {${initVarsStr}${con ? con.block : ''}}`);
  
  for (const meth of methods) {
    if (meth.static) staticVars.push(`${className}.${meth.name} = (${meth.parameters}) => {${meth.block}};`);
    else classProps.push(`${meth.name}(${meth.parameters}) {${meth.block}}`);
  }

  return `class ${className} {${classProps.join('')}}${staticVars.join('')}`;
};

const globalsToJs = ({ vars, methods, classes }) => {
  const join = [];

  join.push(joinStatements(vars.map(varToString)));
    
  join.push(methods.map(({ name, parameters, block }) => (
    `${(opts.globalScope && name in opts.globalVars) ? `${opts.globalScope}.` : 'const '}${name} = (${parameters}) => {${block}};`
  )).join('\n\n'));

  join.push(classes.map(classToJs).join('\n\n'));

  return join.join('\n\n');
};

const convertLiteralMethodsToCasts = (str) => {
  return str.replace(/(int|float|char|long|double)\s*\(/g, '($1)(');
};

/**
 * Convert Java string to JavaScript string
 * @param {string} javaString - Java file contents
 * @param {object} [options]
 * @param {boolean} [options.p5] - Sets `globalScope` to `'p5'`, and add [p5 variable mappings](./p5_globals.js) to `globalVars`. 
 * @param {object} [options.globalVars] - Object keys are added to the `globalScope` object.
 *  If the value is a string, the variable is renamed to that string
 * @param {string} [options.globalScope] - If specified, variables in `globalVars` are appended to `globalScope` object
 * @param {function} [progress] - Callback on progress of conversion. Args are progress number (0 to 1), and a message string
 * @return {string} - Converted JavaScript
 */
const javaToJs = (javaString, options = {}, progress) => {
  if (typeof javaString !== 'string') throw 'java-to-javascript: First argument must be a string';

  if (options.globalVars) opts.globalVars = options.globalVars;
  if (options.globalScope) opts.globalScope = options.globalScope;
  if (options.p5) {
    opts.globalVars = Object.assign(p5_options.globalVars, opts.globalVars);
    if (!options.globalScope) opts.globalScope = 'p5';
  }

  if (progress) progress(0, 'Parsing Java');
  
  if (options.p5) javaString = `class JavaJsTemp__ {${convertLiteralMethodsToCasts(javaString)}}`;

  const javaAST = javaParser.parse(javaString);

  if (progress) progress(0.5, 'Converting to JavaScript');

  let jsString;
  if (options.p5) {
    jsString = globalsToJs(parseClass(javaAST.types[0], true));
  } else {
    jsString = javaAST.types.map((globalClass) => classToJs(parseClass(globalClass))).join('\n\n');
  }

  if (progress) progress(0.75, 'Beautifying');

  jsString = beautify.js_beautify(jsString, opts.beautifyOptions) + '\n';

  if (progress) progress(1.0, 'Success');

  return jsString;
};

module.exports = javaToJs;
