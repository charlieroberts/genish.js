'use strict'

let gen = require( './gen.js' )

let proto = {
  basename:'and',

  gen() {
    let inputs = gen.getInputs( this ), out

    gen.variableNames.add( [this.name, 'f'] )

    //out = `  ${this.name} = ((fround(${inputs[0]}) != fround(0|0)) + (fround(${inputs[1]}|0) != fround(0|0) ) == fround(2|0) );\n\n`

    //out = `  ${this.name} = fround(+(+(+${inputs[0]} != 0. + (+(${inputs[1]}|0) != 0.) ) == 2.) );\n\n`
    //out= `  ${this.name} = fround((((+${inputs[0]} != 0.) + (+${inputs[1]} != 0.)) == 2) |0 )\n`
    out = `  ${this.name} = fround((${inputs[0]} != fround(0) & ${inputs[1]} != fround(0))|0)\n`
    return [ this.name, out ]
  },

}

module.exports = ( in1, in2 ) => {
  let ugen = Object.create( proto )
  Object.assign( ugen, {
    uid:     gen.getUID(),
    inputs:  [ in1, in2 ],
  })
  
  ugen.name = `${ugen.basename}${ugen.uid}`

  return ugen
}
