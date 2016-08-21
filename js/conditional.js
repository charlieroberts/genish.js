'use strict'

let gen = require( './gen.js' )

let proto = {
  basename:'conditional',

  gen() {
    let cond = gen.getInput( this.inputs[0] ),
        block1, block2, block1Name, block2Name, cond1, cond2, out

    if( typeof this.inputs[1] === 'number' ) {
      block1 = this.inputs[1]
      block1Name = null
    }else{
      if( gen.memo[ this.inputs[1].name ] === undefined ) {
        // used to place all code dependencies in appropriate blocks
        gen.startLocalize()

        gen.getInput( this.inputs[1] )

        let block = gen.endLocalize()
        block1 = block[1].join('')
        block1 = '  ' + block1.replace( /\n/gi, '\n  ' )
        block1Name = block[0]
      }else{
        block1 = ''
        block1Name = gen.memo[ this.inputs[1].name ]
      }
    }

    if( typeof this.inputs[2] === 'number' ) {
      block2 = this.inputs[2]
      block2Name = null
    }else{
      if( gen.memo[ this.inputs[2].name ] === undefined ) {

        gen.startLocalize()
        gen.getInput( this.inputs[2] )
        let block = gen.endLocalize()

        block2 = block[1].join('')
        block2 = '  ' + block2.replace( /\n/gi, '\n  ' )
        block2Name = block[0]
      }else{
        block2 = '' //gen.memo[ this.inputs[1].name ]
        block2Name = gen.memo[ this.inputs[2].name ]
      }
    }

    cond1 = block1Name === null ? 
      `  ${this.name}_out = ${block1}` :
      `${block1}    ${this.name}_out = ${block1Name}`

    cond2 = block2Name === null ? 
      `  ${this.name}_out = ${block2}` :
      `${block2}    ${this.name}_out = ${block2Name}`


    out = 
`  var ${this.name}_out 
  if( ${cond} ) {
${cond1}
  }else{
${cond2} 
  }
`

    gen.memo[ this.name ] = `${this.name}_out`

    return [ `${this.name}_out`, out ]
  }
}

module.exports = ( control, in1 = 1, in2 = 0 ) => {
  let ugen = Object.create( proto )
  Object.assign( ugen, {
    uid:     gen.getUID(),
    inputs:  [ control, in1, in2 ],
  })
  
  ugen.name = `${ugen.basename}${ugen.uid}`

  return ugen
}
