/*

 a = conditional( condition, trueBlock, falseBlock )
 b = conditional([
   condition1, block1,
   condition2, block2,
   condition3, block3,
   defaultBlock
 ])

*/
'use strict'

let gen = require( './gen.js' )

let proto = {
  basename:'ifelseif',

  gen() {
    //let cond = gen.getInput( this.inputs[0] ),
    //    block1, block2, block1Name, block2Name, cond1, cond2, out

    let conditionals = this.inputs[0],
        out = `\n  let ${this.name}_out\n` 

    for( let i = 0; i < conditionals.length; i+= 2 ) {
      let isEndBlock = i === conditionals.length - 1,
          cond  = !isEndBlock ? gen.getInput( conditionals[ i ] ) : null,
          preblock = isEndBlock ? conditionals[ i ] : conditionals[ i+1 ],
          block, blockName, output

      if( typeof preblock === 'number' ){
        block = preblock
        blockName = null
      }else{
        if( gen.memo[ preblock.name ] === undefined ) {
          // used to place all code dependencies in appropriate blocks
          gen.startLocalize()

          gen.getInput( preblock  )

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
        `${block}    ${this.name}_out = ${blockName}`

      if( i === 0 ) {
        out += `  if( ${cond} ) {
${output}
  } else`
      }else if( isEndBlock ) {
        out += `{\n  ${output}\n  }\n`
      }else {

        if( i + 2 === conditionals.length || i === conditionals.length - 1 ) {
          out += `{\n  ${output}\n  }\n`
        }else{
          out += ` if( ${cond} ) {
${output}
  } else `
        }
      }
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
