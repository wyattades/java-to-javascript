# Java to JavaScript
> Convert Java Classes to ES6 Classes.

Translates: classes, methods, variables, statics, and more!

(Originally created for converting [Processing](https://processing.org/) to [p5.js](https://p5js.org/))

[🔗 __Live Editor__](https://wyattades.github.io/java-to-javascript/)

__Example__

Input Java:
```java
class MyClass {
  int x = 42;
  static String y = "Life";
  
  MyClass(String secret) {
    final String result = MyClass.y + secret + x;
    if (result != null) {
      purpose();
    }
  }
}
```
Output JavaScript:
```javascript
class MyClass {
  constructor(secret) {
    this.x = 42;

    const result = MyClass.y + secret + this.x;
    if (result !== null) {
      purpose();
    }
  }
}
MyClass.y = 'Life';
```
[More Examples...](./examples)

## Install
__NPM__
```bash
$ npm install java-to-javascript
```
__Script tag__
```html
<script src="https://unpkg.com/java-to-javascript@latest/build/java-to-javascript.min.js"></script>
```
Note: You can replace `latest` with the library's version you want to use, e.g. `v0.1.10`. The library will be exposed on the global window scope as `javaToJavascript`.

## Module API <small>(For Node and the browser)</small>

### javaToJavascript(javaString, options?, progress?)
**Returns**: <code>string</code> - - Converted JavaScript  

```js
// Node module:
var javaToJavascript = require('java-to-javascript');
// Browser script:
var javaToJavascript = window.javaToJavascript;

var jsString = javaToJavascript( /* params */ );
```

| Param | Type | Description |
| --- | --- | --- |
| javaString | <code>string</code> | Java file contents |
| [options] | <code>object</code> |  |
| [options.globalVars] | <code>object</code> | Object keys are added to the `globalScope` object.  If the value is a string, the variable is renamed to that string |
| [options.globalScope] | <code>string</code> | If specified, variables in `globalVars` are appended to `globalScope` object |
| [options.p5] | <code>boolean</code> | Sets `globalScope` to `'p5'`, adds [p5 variable mappings](./p5_globals.js) to `globalVars`, and allows for global methods and variables |
| [options.ugly] | <code>boolean</code> | Don't beautify JavaScript code |
| [progress] | <code>function</code> | Callback on progress of conversion. Args are progress value (0.0 to 1.0), and a message string |

## Command Line API
```
Usage: java-to-javascript [options] <input_file>

Options:

  -V, --version         output the version number
  -o, --output <file>   Specifies the output filename. (Default is the input filename with a .js extension)
  -s, --scope <scope>   If specified, variables in `globals` are appended to `scope` object
  -g, --globals <file>  JSON or JavaScript file containing a global variable mapping. See README
  --p5                  Sets `scope` to "p5", adds p5 variable mappings to `globals`, and allows for global methods and variables
  --ugly                Don't beautify JavaScript code
  -h, --help            output usage information
```

## How It Works
- Parse Java code to create an AST (abstract syntax tree) 
- Replace global variables that the user specifies
- Generate JavaScript code from the AST
- Beautify JavaScript

## Polyfills
I've included some Java Class (partial) polyfills in [polyfills.js](./polyfills.js) that help in the conversion of Java to JS.

__Included Polyfills__: `List` (alias `ArrayList`), `Map` (alias `HashMap`)

## BUGS!
- Local variables or method parameters with the same name as a variable in their `class` will incorrectly be assigned to the `this` object.
  
  __Example__

  Input Java:
  ```java
  class Thing {
    int x, y;
    myMethod(int x) {
      int y = 20;
      this.x = x + y;
    }
  }
  ```
  Output JavaScript:
  ```javascript
  class Thing {
    myMethod(x) {
      let y = 20;
      this.x = this.x + this.y;
    }
  }
  ```

- Unnecessary or deeply nested parentheses can cause very long or *infinite* process hanging.
  
  __Example__
  ```java
  /* I don't know the exact cause, but here's what I have found: */
  ((testFunc())); // Normal
  (((testFunc()))); // Long parse time
  ((((testFunc())))); // Infinitely hangs
  ```
- I convert `char`s to numbers e.g. `'W'` -> `87`, which can cause discrepences in your code

## Unsupported
- Nested classes aka anonymous classes
- Synchronized methods and statements
- Interfaces and abstract classes
- Enums
- Packages and imports

## DISCLAIMER
This is a work in progress! Not all Java features are supported, and some are too difficult to translate to JS, so make sure to doublecheck the resulting code (Also, it assumes you are passing in valid Java).

Please report bugs to [Github Issues](https://github.com/wyattades/java-to-javascript/issues)!

## CREDITS
- Java lexical parser: Github user `mazko` (https://github.com/mazko/jsjavaparser/blob/master/src/Java.1.7.pegjs)
- Lexical Parser -> JS: [`peg.js`](https://pegjs.org/)
