/*
import {
  param, ssd, add, mul, accum
} from '../src/main.js'

import utilities from '../src/utilities.js'
*/

import gen from '../src/gen.js'
import assert from 'assert'

// account for floating point errors
const decimate = ( value, amount ) => Math.floor( value * amount ) / amount

const makeMemory = function( memoryAmount = 1 ) {
  utilities.resetMemory() 

  const mem = new WebAssembly.Memory({ 
    initial:memoryAmount, maximum:memoryAmount, shared:true
  })

  utilities.setupMemory( mem.buffer )

  return mem
}

gen.init().then( ()=> {

  describe( 'a gen', ()=>{
    it( 'should return correct object when compiling', async () => {
      const testfunc = ()=> ({ string:'blah', memlength: 0 })
      gen.ugens.test = testfunc

      const expected = 'blah',
            actual   = gen.compile({ name:'test' }).string

      assert.strictEqual( actual, expected )
    })  

    
    //let str = `\n(func $${name} (export "${name}") (param $loc i32) (result ${isStereo ?'f32 f32' : 'f32'})\n `

    it( 'should compile function scaffolding for mono function', async () => {
      const start = `\n(func $render (export "render") (param $loc i32) (result f32)`
      const testfunc = ()=> ({ string:'blah\n', memlength: 0 })
      gen.ugens.test = testfunc

      const expected = start + '\nblah\n' + ')\n',
            actual   = gen.function({ name:'test' }).string

      // I don't think we need to care about extraneous spaces?
      assert.strictEqual( 
        actual.replaceAll(' ',''), 
        expected.replaceAll(' ', '' ) 
      )
    })

    it( 'should compile function scaffolding for stereo function', async () => {
      const start = `\n(func $render (export "render") (param $loc i32) (result f32 f32)`
      const testfunc = ()=> ({ string:'blah\n', memlength: 0 })
      gen.ugens.test = testfunc

      const expected = start + '\nblah\n\nblah\n' + ')\n',
            actual   = gen.function([{ name:'test' },{ name:'test' }]).string

      // I don't think we need to care about extraneous spaces?
      assert.strictEqual( 
        actual.replaceAll(' ',''), 
        expected.replaceAll(' ', '' ) 
      )
    })

    it( 'correctly memos', async () => {
      const testfunc = ()=> ({ string:'blah', memlength: 0, __memoName:'blahmemo' })
      gen.ugens.test = testfunc

      const expected = 'blah\n\nlocal.getblahmemo\n',
            obj      = { name:'test', __shouldMemo:true, __memoName:'blahmemo' },
            actual   = gen.compile( obj ).string + gen.compile( obj ).string

      assert.strictEqual( 
        actual.replaceAll(' ','').replaceAll( '\n','') , 
        expected.replaceAll(' ', '' ).replaceAll( '\n', '') 
      )
    })

    it( 'correctly compiles objects with requirements', async () => {
      const requires = { string:'beforeblah', memlength:0, name:'test' }
      const testfunc = ()=> ({ string:'blah', memlength: 0 })
      gen.ugens.test = testfunc

      const expected = 'beforeblahblah',
            obj      = { name:'test', requires },
            actual   = gen.compile( obj ).string

      assert.strictEqual( 
        actual.replaceAll(' ','').replaceAll( '\n','') , 
        expected.replaceAll(' ', '' ).replaceAll( '\n', '') 
      )
    })
    /* */
  })
})
