let gen  = require('./gen.js')

module.exports = () => {
  let ugen = {
    inputs: [ 0 ],

    record( v ) {
      let obj = {
        gen() {
          let inputs = gen.getInputs( ugen )

          gen.addToEndBlock( 'gen.data.' + ugen.name + ' = ' + inputs[ 0 ] )

          return inputs[ 0 ]
        }
      }

      this.inputs[ 0 ] = v

      return obj
    },

    gen() { return 'gen.data.' + ugen.name },

    uid: gen.getUID(),
  }
  
  ugen.name = 'history'+ugen.uid

  gen.data[ ugen.name ] = 0
  
  return ugen
}
