'use strict'

// TODO: why name of the file is different to the name of the function

/**
 * `ifelse` can be called in two ways. In the first, it is functionally
 * identical to the `switch` ugen: if a given control input is true, the second
 * input to `ifelse` is outputted. Otherwise, the third input is outputted.
 *
 * The other option is to pass multiple conditional / output pairs. These will
 * be used to create an appropriate if/else block in the final callback. If
 * there is a single final output with no accompanying condition, this will be
 * the end `else` of the control structure. For example:
 *
 * Most importantly (and as implied by the pseudocode) we can use `ifelse`
 * to create DSP that only runs under certain conditions. For example,
 * given the following in the genish.js playground:
 *
 * __Category:__ routing
 * @name ifelse
 * @function
 * @param {(ugen|number)} control - When `control` === 1, output `a`; else output `b`.
 * @param {(ugen|number)} a - Signal that is available to output.
 * @param {(ugen|number)} b - Signal that is available to ouput.
 * @return {ugen}
 *
 * @example
 * ie = ifelse(
 *   lt( 0,1 ), 440,
 *   gt( 1,.5 ), 880,
 *   1200
 * )
 * gen.createCallback( ie )
 * // ...outputs a function with the following control block (in pseudocode):
 * let ifelse_0
 * if( 0 < 1 ) {
 *   ifelse_0 = 440
 * }else if( 1 > .5 ) {
 *   ifelse_0 = 880
 * }else{
 *   ifelse_0 = 1200
 * }
 *
 * @example
 * osc = phasor( .5 )
 * play(
 *   ifelse(
 *     lt( osc, -.5 ), cycle( 220 ),
 *     lt( osc, 0 )  , phasor( 330 ),
 *     lt( osc, .5 ) , train( 440 ),
 *     cycle(550)
 *   )
 * )
 * // ... we are only running two oscillators at any given time,
 * // our control phasor and whatever is held in the current executing block
 * // of our `ifelse` ugen.
 */

/*

 a = conditional( condition, trueBlock, falseBlock )
 b = conditional([
   condition1, block1,
   condition2, block2,
   condition3, block3,
   defaultBlock
 ])

*/

let gen = require( './gen.js' )

let proto = {
  basename:'ifelse',

  gen() {
    let conditionals = this.inputs[0],
        defaultValue = gen.getInput( conditionals[ conditionals.length - 1] ),
        out = `  var ${this.name}_out = ${defaultValue}\n`

    //console.log( 'defaultValue:', defaultValue )

    for( let i = 0; i < conditionals.length - 2; i+= 2 ) {
      let isEndBlock = i === conditionals.length - 3,
          cond  = gen.getInput( conditionals[ i ] ),
          preblock = conditionals[ i+1 ],
          block, blockName, output

      //console.log( 'pb', preblock )

      if( typeof preblock === 'number' ){
        block = preblock
        blockName = null
      }else{
        if( gen.memo[ preblock.name ] === undefined ) {
          // used to place all code dependencies in appropriate blocks
          gen.startLocalize()

          gen.getInput( preblock )

          block = gen.endLocalize()
          blockName = block[0]
          block = block[ 1 ].join('')
          block = '  ' + block.replace( /\n/gi, '\n  ' )
        }else{
          block = ''
          blockName = gen.memo[ preblock.name ]
        }
      }

      output = blockName === null ?
        `  ${this.name}_out = ${block}` :
        `${block}  ${this.name}_out = ${blockName}`

      if( i===0 ) out += ' '
      out +=
` if( ${cond} === 1 ) {
${output}
  }`

if( !isEndBlock ) {
  out += ` else`
}else{
  out += `\n`
}
/*
 else`
      }else if( isEndBlock ) {
        out += `{\n  ${output}\n  }\n`
      }else {

        //if( i + 2 === conditionals.length || i === conditionals.length - 1 ) {
        //  out += `{\n  ${output}\n  }\n`
        //}else{
          out +=
` if( ${cond} === 1 ) {
${output}
  } else `
        //}
      }*/
    }

    gen.memo[ this.name ] = `${this.name}_out`

    return [ `${this.name}_out`, out ]
  }
}

module.exports = ( ...args  ) => {
  let ugen = Object.create( proto ),
      conditions = Array.isArray( args[0] ) ? args[0] : args

  Object.assign( ugen, {
    uid:     gen.getUID(),
    inputs:  [ conditions ],
  })

  ugen.name = `${ugen.basename}${ugen.uid}`

  return ugen
}
