import { counter, param, add } from '../src/main.js'
import utilities from '../src/utilities.js'
import gen from '../src/gen.js'
import assert from 'assert'

// account for floating point errors
const decimate = ( value, amount ) => Math.floor( value * amount ) / amount

const makeMemory = function( memoryAmount = 50 ) {
  utilities.resetMemory()

  const mem = new WebAssembly.Memory({ 
    initial:memoryAmount, maximum:memoryAmount, shared:true
  })

  utilities.setupMemory( mem.buffer )

  return mem
}

gen.init().then( ()=> {
  describe( 'a counter', ()=>{
    it( 'should return 0 on first execution', async () => {
      const mem      = makeMemory(),
            expected = 0,
            graph    = counter(.5),
            func     = gen.function( graph ),
            wat      = gen.module( func )


      const wasm     = await gen.assemble( wat, mem ),
            actual   = decimate( wasm.render( 0 ), 1000 )

      assert.strictEqual( actual, expected )    
    })
    
    it( 'should return 0 on first execution for wrap', async () => {
      const mem      = makeMemory(),
            expected = 0,
            graph    = counter(.5).wrap,
            func     = gen.function( graph ),
            wat      = gen.module( func )

      const wasm     = await gen.assemble( wat, mem ),
            actual   = decimate( wasm.render( 0 ), 1000 )

      assert.strictEqual( actual, expected )    
    })
    
    it( 'should ramp to .4 with an increment of .1 after five executions', async () => {
      const mem      = makeMemory(),
            expected = .4,
            graph    = counter(.1),
            func     = gen.function( graph ),
            wat      = gen.module( func ),
            wasm     = await gen.assemble( wat, mem )

      wasm.render( 0 )
      wasm.render( 0 )
      wasm.render( 0 )
      wasm.render( 0 )

      const actual = decimate( wasm.render( 0 ), 1000 )

      assert.strictEqual( actual, expected )    
    })

    it( 'should return to its min value of 0 on the 11th execution with an increment of .1', async () => {
      const mem      = makeMemory(),
            expected = 0,
            graph    = counter(.1),
            func     = gen.function( graph ),
            wat      = gen.module( func ),
            wasm     = await gen.assemble( wat, mem )

      for( let i = 0; i < 10; i++ ) wasm.render( graph.idx * 4 )
      const actual = decimate( wasm.render( 0 ), 1000 )

      assert.strictEqual( actual, expected )    
    })

    
    it( 'should return to its min value of 0 when the inputs[1] = true', async ()=> {
      const mem = makeMemory(),  
            expected = .0,
            p      = param( 0 ),
            graph  = counter( .1, p ),
            func   = gen.function( graph ),
            wat    = gen.module( func )
      
      const wasm = await gen.assemble( wat, mem )

      wasm.render( 0 ); wasm.render(0); wasm.render(0);
      p.value = 1
      const result = wasm.render(0)

      assert.equal( result, expected )
    })

    it( 'should return 1 after wrapping', async () => {
      const mem      = makeMemory(),
            expected = 1,
            graph    = counter(.5).wrap,
            func     = gen.function( graph ),
            wat      = gen.module( func )

      //gen.write( wat, './trash/counter.wat' )
      const wasm     = await gen.assemble( wat, mem )

      wasm.render(0); 
      const actual   = decimate( wasm.render( 0 ), 1000 )

      assert.strictEqual( actual, expected )    
    })
    
    // TODO right now counter needs to know if it's wrap is used
    // before it is compiled; this determines whether or not
    // the counter's output is tee'd up (if wrap isn't used) or merely set for memoing.
    it( 'can compile counter first, wrap second', async () => {
      const mem      = makeMemory(),
            expected = .25,
            c        = counter(.25),
            graph    = add(c,c.wrap),
            func     = gen.function( graph ),
            wat      = gen.module( func )

      const wasm     = await gen.assemble( wat, mem )
      wasm.render(0)
      const actual   = decimate( wasm.render( 0 ), 1000 )

      assert.strictEqual( actual, expected )    
    })
    it( 'can compile wrap first, counter second', async () => {
      const mem      = makeMemory(),
            expected = .25,
            c        = counter( .25 ),
            graph    = add( c.wrap,c ),
            func     = gen.function( graph ),
            wat      = gen.module( func )

      //gen.write( wat, './trash/counter.wat' )
      const wasm     = await gen.assemble( wat, mem )
      wasm.render(0)
      const actual   = decimate( wasm.render( 0 ), 1000 )

      assert.strictEqual( actual, expected )    
    })
    it( 'can change maximum value', async () => {
      const mem      = makeMemory(),
            expected = 3,
            p        = param(2),
            graph    = counter( 1, 0, p ),
            func     = gen.function( graph ),
            wat      = gen.module( func )

      gen.write( wat, './trash/counter.wat' )
      const wasm = await gen.assemble( wat, mem )
      wasm.render(0)

      p.value = 5
      wasm.render(0)
      wasm.render(0)
      const actual = decimate( wasm.render( 0 ), 1000 )

      assert.strictEqual( actual, expected )    
    })

  })
})
