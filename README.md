# Java to JavaScript
Convert Java Classes to ES6 Classes.

Translates: classes, methods, variables, literal casts, and more!

(Originally created for converting [Processing](https://processing.org/) to [p5.js](https://p5js.org/))

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
    if (result !== undefined) {
      purpose();
    }
  }
}
MyClass.y = 'Life';
```
[More Examples...](./examples)

## Module API <small>(For Node and the browser)</small>

### javaToJs(javaString, options?, progress?)
```js
// Node:
var javaToJs = require('java-to-javascript');
// Browser script (https://cdn.rawgit.com/wyattades/java-to-javascript/build/java-to-javascript.min.js):
var javaToJs = window.javaToJavascript;

var jsString = javaToJs( /* params */ );
```

**Returns**: <code>string</code> - - Converted JavaScript  

| Param | Type | Description |
| --- | --- | --- |
| javaString | <code>string</code> | Java file contents |
| [options] | <code>object</code> |  |
| [options.p5] | <code>boolean</code> | Sets `globalScope` to `'p5'`, and add [p5 variable mappings](./p5_globals.js) to `globalVars`. |
| [options.globalVars] | <code>object</code> | Object keys are added to the `globalScope` object.  If the value is a string, the variable is renamed to that string |
| [options.globalScope] | <code>string</code> | If specified, variables in `globalVars` are appended to `globalScope` object |
| [progress] | <code>function</code> | Callback on progress of conversion. Args are progress number (0 to 1), and a message string |

## Command Line API
```bash
Usage: java-to-javascript [options] <input_file>

Convert a Java file to an ES6 JavaScript file

Options:

  -V, --version         output the version number
  -o, --output <file>   Specifies the output filename. (Default is the input filename with a .js extension)
  --p5                  Sets `scope` to "p5", and adds p5 variable mappings to `globals`
  -s, --scope <scope>   If specified, variables in `globals` are appended to `scope` object
  -g, --globals <file>  JSON or JavaScript file containing a global variable mapping. See README
  -h, --help            output usage information

```

## How It Works
- Parse Java code to create an AST (abstract syntax tree) 
- Replace global variables that the user specifies
- Generate JavaScript code from the AST
- Beautify JavaScript

## Polyfills
I've included some Java Class (partial) polyfills in [polyfills.js](./polyfills.js) that help in the conversion of Java to JS.

__Included Polyfills__: `List`, `ArrayList`

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
  
  __Example__ -- will infinitely hang:
  ```java
  (width/2)+(cos(angle)*((sqrt(sq(height)+sq(width))/2)+random(50,150)));
  ```
- `static` has no effect on class methods
- Nested classes aren't converted

## DISCLAIMER
Not all Java features are supported, and some are too difficult to translate to JS, so make sure to check the JS code afterwards.
