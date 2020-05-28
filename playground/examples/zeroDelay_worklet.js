/* 
zero-delay (implicit) two-pole filter
based off Csound code by Steven Yi: https://github.com/kunstmusik/libsyi/blob/master/zdf.udo
in turn based off code by Will Pirkle: http://www.willpirkle.com/app-notes/
*/

d = data( './resources/audiofiles/amen.wav' ).then( ()=> {
  iT = 1 / gen.samplerate
  z1 = ssd(0)
  z2 = ssd(0)
  
  freq = param( 'frequency', 550, 80, 15000 )
  mode = param( 'mode', 0, 0, 3 )
  Q    = param( 'Q', .5, .5, 20 )
  
  input = peek( d, accum( 1, 0, { min: 0, max:d.dim }), { mode:'samples' } )

  kwd = mul( Math.PI * 2, freq )
  kwa = memo( mul( 2/iT, tan( mul( kwd, iT/2 ) ) ) )
  kG  = memo( mul( kwa, iT/2 ) )
  kR  = memo( div( 1, mul( 2, Q ) ) )

  hp = memo( 
    div( 
      sub(
        sub(
          input, 
          mul( 
           	add( mul(2,kR), kG ), 
          	z1.out 
          ) 
        ),
        z2.out
      ),
      add(
        1,
        add( 
          mul( mul(2,kR), kG),  
          mul( kG,kG ) 
        )
      )
    )
  )
  
  bp = memo( add( mul( kG, hp ), z1.out ) )
  lp = memo( add( mul( kG, bp ), z2.out ) )
  notch = memo( sub( input, mul( mul( 2, kR), bp ) ) )

  z1.in( add( mul( kG, hp ), bp ) )
  z2.in( add( mul( kG, bp ), lp ) )
  
  outSignal = selector( mode, lp, hp, bp, notch )
  
  play( outSignal, true ).then( node => {
    gui = new dat.GUI({ width: 400 }) 
    gui.add( node, 'frequency', 80, 15000 )
    gui.add( node, 'Q', .5, 20 )
    gui.add( node, 'mode', { LowPass:0, HighPass:1, BandPass:2, Notch:3 } )
  
  })
})
