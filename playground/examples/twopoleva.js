/* 
zero-delay (implicit) two-pole filter
based off Csound code by Steven Yi: https://github.com/kunstmusik/libsyi/blob/master/zdf.udo
in turn based off code by Will Pirkle: http://www.willpirkle.com/app-notes/
*/

data( './resources/audiofiles/amen.wav' ).then( amen => {
  iT = memo(div(1, samplerate))
  // poles
  z1 = ssd(0)
  z2 = ssd(0)
  
  // params...
  freq = param( 550 )
  mode = param( 0 )
  Q    = param( .5 )
  
  input = peek( amen, accum( 1, 0, 0, amen.length ), 'none', 'samples' )

  kwd = mul( Math.PI * 2, freq )
  kwa = memo( mul( div(2,iT), tan( mul( kwd, div(iT,2) ) ) ) )
  kG  = memo( mul( kwa, div(iT,2) ) )
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
  
  outSignal = lp
  
  play( outSignal ) 
})

// play with values...
freq.value = 1050 // (80-20000)
Q.value = 1 // (.5-20, CAREFUL)
