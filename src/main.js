import { exports as compiled } from "./ugens.compiled.js"
import { exports as dynamic  } from "./ugens.dynamic.js"

const names = [
  'accum', 'cycle', 'phasor', 'add', 'sub', 'mul', 'div', 'pow', 'pan', 'data', 'peek', 'poke',
  'wrap', 'clamp', 'min', 'max', 'ifelse', 'gt', 'gte', 'gtp', 'lt', 'lte', 'ltp', 'and', 'or',
  'mod', 'sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'floor', 'ceil', 'round', 'abs', 'sqrt' 
]

const ugens = {}

for( let name of names ) {
  ugens[ name ] = function( ...args ) {
    return { name, args }
  }
}

const processNode = function( node, isCompiled=true ) {
  let processedNode = node
  const dict = isCompiled ? compiled : dynamic

  const isNodeObject = isNaN( node )
  if( isNodeObject ) {
    const constructor = dict[ node.name ]
    let args
    if( node.args !== undefined ) {
      args = node.args.map( a => a !== undefined ? processNode(a) : a )
    }else{
      args = []
    }

    processedNode = constructor( ...args )
  }

  return processedNode
}

const compile = function( ugen ) {
  const node = processNode( ugen ) 
  return node
}

const run = function( ugen ) {
  const node = processNode( ugen, false )
  return node
}

export { ugens, compile, run }

