/**
 * @module java-to-javascript
 */

const beautify = require('js-beautify/js/lib/beautify');
const JavaAST = require('./javaAST');
const p5_options = require('./p5_options');


const DEV = process.env.NODE_ENV === 'development';

const DEFAULT_OPTIONS = {
  globalVars: {},
  globalScope: null,
  separator: '\n\n',
};
const opts = {};

const literalInitializers = {
  int: '0',
  float: '0',
  double: '0',
  short: '0',
  long: '0',
  char: '\'\'',
  boolean: 'false',
};

const SEP = '$';

const unhandledNode = (node, more = '') => {
  if (DEV) throw node;
  else console.error(`Unhandled node: ${node.node}. ${more}`);
  return '';
};

const joinStatements = (stats) => `${stats.join(';')}${stats.length ? ';' : ''}`;

const varToString = ({ name, value, type, final }, noLet) => {
  if (value === undefined) value = literalInitializers[type] || 'null';
  return `${noLet !== true ? (final ? 'const ' : 'let ') : ''}${name} = ${value}`;
};

const parseType = (type) => {
  if (type.node === 'ArrayType') return 'Array'; // Doesn't matter what we return, we don't use it
  else if (type.node === 'SimpleType') return type.name.identifier;
  else if (type.node === 'PrimitiveType') return type.primitiveTypeCode;
  else if (type.node === 'ParameterizedType') return parseType(type.type);
  else return unhandledNode(type);
};

const parseModifiers = (modifiers) => {
  const mods = {};
  for (const mod of modifiers) {
    mods[mod.keyword] = true;
  }
  return mods;
};

const parseClass = (class_, isGlobal) => {
  const modifiers = parseModifiers(class_.modifiers);
  if (modifiers.abstract || class_.interface) return { abstract: true };

  const classData = {
    name: class_.name.identifier,
    superclass: class_.superclassType && parseType(class_.superclassType),
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
  
  const parseExpr = (expr) => {
    if (!expr) return undefined;
  
    switch (expr.node) {
      case 'ThisExpression':
        return 'this';
      case 'NullLiteral':
        return 'null';
      case 'BooleanLiteral':
        return expr.booleanValue;
      case 'NumberLiteral':
        let num = expr.token;
        num = num.replace(/_/g, '');
        if (/^0\d+$/.test(num)) num = '0o' + num.substring(1);
        else if (/[lfd]$/i.test(num)) num = num.slice(0, -1);
        return num;
      case 'StringLiteral':
        return expr.escapedValue.replace(/'/g, '\\\'').replace(/"/g, '\'');
      case 'CharacterLiteral':
        const char = expr.escapedValue.slice(1, -1);
        if (char.length === 1) return char.charCodeAt(0).toString();
        else if (char.startsWith('\\u')) return parseInt(char.substring(2), 16).toString();
        else return unhandledNode(expr, 'Weird char: ' + char);
        // return expr.escapedValue.charCodeAt(1).toString(); // equivalent to: `'z'.charCodeAt(0)`
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
        if (op === '!=' || op === '==') op += '='; // triple equals in JS
        return `${parseExpr(expr.leftOperand)} ${op} ${parseExpr(expr.rightOperand)}`;
      case 'MethodInvocation':
        const args = `(${expr.arguments.map(parseExpr)})`;
        if (expr.expression) return `${parseExpr(expr.expression)}.${expr.name.identifier}${args}`;
        return `${assignParent(expr.name.identifier)}${args}`;
      case 'InstanceofExpression':
        return `${parseExpr(expr.leftOperand)} instanceof ${parseType(expr.rightOperand)}`;
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
  
  const parseFieldVars = (field) => {
    const vars = [];
    const data = parseModifiers(field.modifiers);
    data.type = parseType(field.type);

    for (const frag of field.fragments) {
      if (frag.node === 'VariableDeclarationFragment') {
        vars.push(Object.assign({
          name: frag.name.identifier,
          value: parseExpr(frag.initializer),
        }, data));
      } else unhandledNode(frag);
    }

    return vars;
  };

  const parseStatement = (stat) => {
    switch (stat.node) {
      case 'EmptyStatement':
        return '';
      case 'ExpressionStatement':
        return parseExpr(stat.expression);
      case 'VariableDeclarationStatement':
        return parseFieldVars(stat).map(varToString);
      case 'ReturnStatement':
        return `return ${parseExpr(stat.expression)}`;
      case 'SuperConstructorInvocation':
        // TODO stat.expression stat.typeArguments
        return `super(${stat.arguments.map(parseExpr)})`;
      case 'IfStatement':
        let ifBlock = `if(${parseExpr(stat.expression)}){${parseBlock(stat.thenStatement)}}`;
        if (stat.elseStatement) ifBlock += `else{${parseBlock(stat.elseStatement)}}`;
        return ifBlock;
      case 'WhileStatement':
        return `while(${parseExpr(stat.expression)}){${parseBlock(stat.body)}}`;
      case 'DoStatement':
        return `do{${parseBlock(stat.body)}}while(${parseExpr(stat.expression)})`
      case 'ForStatement':
        let initializers = stat.initializers.map(parseExpr).join(',');
        if (stat.initializers.length && stat.initializers[0].node === 'VariableDeclarationExpression')
          initializers = 'let ' + initializers.replace(/(let|const) /g, '');
        return `for(${initializers};${parseExpr(stat.expression) || ''};${stat.updaters.map(parseExpr)}){${parseBlock(stat.body)}}`;
      case 'EnhancedForStatement':
        return `for(const ${stat.parameter.name.identifier} of ${parseExpr(stat.expression)}){${parseBlock(stat.body)}}`;
      case 'BreakStatement':
        return `break ${stat.label ? stat.label.identifier : ''}`;
      case 'ContinueStatement':
        return `continue ${stat.label ? stat.label.identifier : ''}`;
      case 'LabeledStatement':
        return `${stat.label.identifier}:${parseStatement(stat.body)}`;
      case 'SwitchCase':
        return `case ${parseExpr(stat.expression)}:`;
      case 'SwitchStatement':
        let switchStats = '';
        for (const _stat of stat.statements) {
          const statStr = parseStatement(_stat);
          switchStats += statStr + (statStr.endsWith(':') ? '' : ';');
        }
        return `switch(${parseExpr(stat.expression)}){${switchStats}}`;
      case 'AssertStatement':
        return `if (!(${parseExpr(stat.expression)})) throw ${stat.message ? parseExpr(stat.message) : '\'Assertion Failed\''}`;
      case 'ThrowStatement':
        return `throw ${parseExpr(stat.expression)}`;
      case 'TryStatement':
        let tryBlock = `try{${parseBlock(stat.body)}}`;
        for (const clause of stat.catchClauses) tryBlock += ` catch(${clause.exception.name.identifier}){${parseBlock(clause.body)}}`; // TODO handle exception types?
        if (stat.finally) tryBlock += `finally{${parseBlock(stat.finally)}}`;
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

    if (method.constructor) {
      data.isConstructor = true;
      data.name = 'constructor';
      data.static = false;
    }
  
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
    else if (dec.node === 'MethodDeclaration') classData.methods.push(parseMethod(dec));
    else if (dec.node !== 'FieldDeclaration') unhandledNode(dec);
  }

  return classData;
};

const classToJs = ({ name: className, vars, superclass, methods, abstract }) => {
  if (abstract) return '';

  const initVars = [];
  const classProps = [];
  const staticVars = [];

  for (const var_ of vars) {
    if (var_.value === undefined) var_.value = literalInitializers[var_.type] || 'null';
    if (var_.static) staticVars.push(`${className}.${var_.name}=${var_.value};`);
    else initVars.push(`this.${var_.name}=${var_.value};`);
  }

  let addedConstructor = false;

  const addMethod = ({ name, parameters, block, isConstructor, static: static_ }, addInitVars) => {
    if (isConstructor) addedConstructor = true;
    if (static_) staticVars.push(`${className}.${name}=(${parameters})=>{${block}};`);
    else {
      const preblock = (isConstructor && addInitVars && initVars.length) ? (initVars.join('') + (block ? opts.separator : '')) : '';
      classProps.push(`${name}(${parameters}){${preblock}${block}}`);
    }
  };

  const methodMap = {};
  for (const meth of methods) {
    const safeName = meth.name + '$$';
    if (!(safeName in methodMap)) methodMap[safeName] = {};
    methodMap[safeName][meth.parameters.length] = meth;
  }
  for (const safeName in methodMap) {
    const name = safeName.slice(0, -2);
    const paramMap = methodMap[safeName];
    const paramCounts = Object.keys(paramMap);
    
    const first = paramMap[paramCounts[0]];
    if (paramCounts.length === 1) {
      addMethod(first, true);
    } else {
      let cases = '';
      for (const paramCount of paramCounts) {
        const meth = paramMap[paramCount];
        meth.name = `${name}${SEP}${paramCount}`;
        cases += `case ${paramCount}:return ${meth.static ? className : 'this'}.${meth.name}(...args$);`;
        addMethod(meth);
      }
      if (first.static) staticVars.push(`${className}.${name}=(...args${SEP})=>{switch(args${SEP}.length){${cases}}};`);
      else classProps.push(`${name}(...args${SEP}){switch(args${SEP}.length){${cases}}}`)
    }
  }

  if (!addedConstructor && initVars.length) classProps.unshift(`constructor(){${initVars.join('')}}`);

  return `class ${className}${superclass ? (' extends ' + superclass) : ''}{${classProps.join('')}}${staticVars.join('')}`;
};

const globalsToJs = ({ vars, methods, classes }) => {
  const join = [];

  join.push(joinStatements(vars.map(varToString)));
    
  join.push(methods.map(({ name, parameters, block }) => (
    `${(opts.globalScope && name in opts.globalVars) ? `${opts.globalScope}.` : 'const '}${name} = (${parameters}) => {${block}};`
  )).join(opts.separator));

  join.push(classes.map(classToJs).join(opts.separator));

  return join.join(opts.separator);
};

const fixP5 = (str) => {
  return str
  .replace(/(int|float|byte|char|boolean)\s*\(/g, '$1$$(') // Temporarily change name of literal method calls e.g. int(x) -> int$(x)
  .replace(/new\s+PVector\s*\(/g, 'createVector(');
};

/**
 * Convert Java string to JavaScript string
 * @param {string} javaString - Java file contents
 * @param {object} [options]
 * @param {object} [options.globalVars] - Object keys are added to the `globalScope` object. If the object value is a string, the variable is renamed to that string
 * @param {string} [options.globalScope] - If specified, variables in `globalVars` are appended to `globalScope` object
 * @param {boolean} [options.p5] - Sets `globalScope` to `'p5'`, adds [p5 variable mappings](./p5_globals.js) to `globalVars`, and allows for global methods and variables
 * @param {boolean} [options.ugly] - Don't beautify JavaScript code  
 * @param {function} [progress] - Callback on progress of conversion. Args are progress number (0 to 1), and a message string
 * @return {string} - Converted JavaScript
 */
const javaToJavascript = (javaString, options = {}, progress) => {
  if (typeof javaString !== 'string') throw new Error('java-to-javascript: First argument must be a string');

  // Reset opts parameters
  Object.assign(opts, DEFAULT_OPTIONS);

  if (options.globalVars) opts.globalVars = options.globalVars;
  if (options.globalScope) opts.globalScope = options.globalScope;
  if (options.ugly) opts.separator = '';
  if (options.p5) {
    Object.assign(opts.globalVars, p5_options.globalVars, opts.globalVars);
    if (!opts.globalScope) opts.globalScope = 'p5';
  }

  if (progress) progress(0, 'Parsing Java');
  
  if (options.p5) javaString = `class JavaJsTemp__ {${fixP5(javaString)}}`;

  let javaAST;
  try {
    javaAST = JavaAST.parse(javaString);
  } catch (e) {
    if (e.location) throw new Error(`SyntaxError around line ${e.location.start.line}: ${e.message}`);
    else throw e;
  }

  if (progress) progress(0.5, 'Converting to JavaScript');

  let jsString;
  if (options.p5) {
    jsString = globalsToJs(parseClass(javaAST.types[0], true));
  } else {
    jsString = javaAST.types.map((globalClass) => classToJs(parseClass(globalClass))).join(opts.separator);
  }

  if (progress) progress(0.75, 'Beautifying');

  if (!options.ugly) {
    jsString = beautify.js_beautify(jsString, {
      indent_size: 2,
    }) + '\n';
  }

  if (progress) progress(1.0, 'Success');

  return jsString;
};

module.exports = javaToJavascript;
