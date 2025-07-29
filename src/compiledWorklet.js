class WASMProcessor extends AudioWorkletProcessor {
  constructor() {
    super()
    this.wasm       = null
    this.debug      = false
    this.shouldPlay = true
    
    this.port.onmessage = async (msg) => {
      if( msg.data.address === 'memory' ) {
        // XXX replace with actual sampling rate at some point...
        this.sr    = new WebAssembly.Global({ value:'f32', mutable:false }, msg.data.sr )
        this.clock = new WebAssembly.Global({ value:'i32', mutable:true  }, 1 )

        this.debug = msg.data.debug || false
        
        WebAssembly.instantiate( 
          msg.data.wasm, 
          {
            env: { 
              memory:msg.data.memory, 
              sr:this.sr, 
              _logi:function( n ) { console.log(n); return n }, 
              _logf:function( n ) { console.log(n); return n } 
            },
            math: { 
              sin:  Math.sin,
              cos:  Math.cos,
              tan : Math.tan,
              asin: Math.asin, 
              acos: Math.acos,
              atan: Math.atan,
              tanh: Math.tanh,
              pow:  Math.pow,
              atan2: Math.atan2,
              pi:   Math.PI, 
              twopi:Math.PI * 2,
              random: Math.random
            }
          } 
        )
        .then( wasm => {
          this.wasm   = wasm.instance.exports
          this.memory = msg.data.memory.buffer
          
          // send message back to main thread to let it know initialization
          // is complete, typically the main thread will then send a message
          // back to begin rendering
          this.port.postMessage({
            address:'initialized',
          })
        })
      } else if( msg.data.address === 'render' ) {
        this.renderLocation = msg.data.loc
        // setting the numChannels property turns on rendering in the
        // audioworklet's process method...
        this.numChannels = 1
      } else if( msg.data.address === 'stop' ) {
        // needed for garbage collection and to free up cpu resources
        this.shouldPlay = false
      }
    }
  }

  process(inputs, outputs, parameters) {
    const len = outputs[0][0].length
    const output = outputs[0][0]
    if( this.numChannels === 1 ) {
      for( let i = 0; i < len; i++ ) {
        if( this.debug ) debugger
        const l = this.wasm.render( this.renderLocation )
        outputs[0][0][i] = l
        outputs[0][1][i] = l
      }
    }
    
    return this.shouldPlay
  }
}

registerProcessor( 'wasm-test', WASMProcessor )
