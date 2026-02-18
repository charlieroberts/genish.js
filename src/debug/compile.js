import utilities from '../utilities.js'
import gen from '../gen.js'
import { ugens, compile } from '../main.js'

const makeMemory = function( memoryAmount = 50 ) {
  const mem = new WebAssembly.Memory({ 
    initial:memoryAmount, maximum:memoryAmount, shared:true 
  })

  utilities.setupMemory( mem.buffer )

  return mem
}

await gen.init()

const memSize = 5
const mem = makeMemory( memSize )

const u = ugens.accum( ugens.add(.1, ugens.sub(1, .1 ) ) )

const pu = compile( u )
//const func = gen.function( pu, 'simple3' ),
      //wat  = gen.wat( func, false, memSize )

const wat  = gen.wat( [], false, memSize )

gen.write( wat, 'test.wat' )
