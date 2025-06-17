import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import nodePolyfills from 'rollup-plugin-polyfill-node';

export default {
  input: 'js/index.js',
  output: {
    file:'dist/gen.lib.js',
    format: 'umd',
    name:'genish'
  },
  plugins: [nodeResolve({ preferBuiltins:true }), commonjs(), nodePolyfills() ]
};
