import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import replace from 'rollup-plugin-replace';


const plugins = [
  replace({
    include: 'lib/index.js',
    'process.env.NODE_ENV': JSON.stringify('production'),
  }),
  resolve(),
  commonjs(),
];

export default [{
  input: 'lib/index.js',
  plugins,
  output: {
    file: 'build/java-to-javascript.js',
    name: 'javaToJavascript',
    format: 'umd',
    sourcemap: true,
  },
}, {
  input: 'lib/index.js',
  plugins: [ ...plugins, terser() ],
  output: {
    file: 'build/java-to-javascript.min.js',
    name: 'javaToJavascript',
    format: 'umd',
    sourcemap: true,
  },
}];
