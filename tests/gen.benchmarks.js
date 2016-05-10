/* gen.benchmarks.js
 *
 * This file is for testing minutiae related to codegen optimizaitons. For example, is it faster
 * to use an if statement vs. a ternary operator etc.
 *
 * run using node: node benchmark.js
 *
 * ... after installing dependencies by running npm install in the top level of the repo
 * 
 */

'use strict'

let Benchmark = require( 'benchmark' )

let tests = {
  functionArguments:  require( './gen.benchmarks.functionArguments.js' ),
  floor:              require( './gen.benchmarks.floor.js' ),
  clamp:              require( './gen.benchmarks.clip.js' ),
  ifVsWrap:           require( './gen.benchmarks.accumMethods.js' ),
  boolToNumber:       require( './gen.benchmarks.boolToNumber.js' ),
  objectsVsValues:    require( './gen.benchmarks.objectsVsValuesAsCallbackProperties.js' ),
}

for( let i = 2; i < process.argv.length; i++ ) {
  let func = tests[ process.argv[ i ] ]

  console.log( func.description )

  func()
}

