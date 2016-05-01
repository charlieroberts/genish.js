'use strict'

let gen  = require('./gen.js')

module.exports = () => {
  let ugen = {
    inputs: [ 0 ],

    record( v ) {
      if( gen.histories.has( v ) ){
        let memoHistory = gen.histories.get( v )
        ugen.name = memoHistory.name
        return memoHistory
      }

      let obj = {
        gen() {
          let inputs = gen.getInputs( ugen )

          gen.addToEndBlock( 'gen.data.' + ugen.name + ' = ' + inputs[ 0 ] )
          
          // return ugen that is being recorded instead of ssd.
          // this effectively makes a call to ssd.record() transparent to the graph.
          // recording is triggered by prior call to gen.addToEndBlock.
          return inputs[ 0 ]
        },
        name: ugen.name
      }

      this.inputs[ 0 ] = v
      
      gen.histories.set( v, obj )

      return obj
    },

    gen() { return 'gen.data.' + ugen.name },

    uid: gen.getUID(),
  }
  
  ugen.name = 'history' + ugen.uid

  gen.data[ ugen.name ] = 0
  
  return ugen
}
