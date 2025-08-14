/* 
zero-delay (implicit) two-pole filter
based off Csound code by Steven Yi: https://github.com/kunstmusik/libsyi/blob/master/zdf.udo
in turn based off code by Will Pirkle: http://www.willpirkle.com/app-notes/
*/

data( './resources/audiofiles/amen.wav' ).then( amen => {
  iT = div(1, samplerate()).memo()
  // poles
  z1 = ssd(0)
  z2 = ssd(0)
  
  // params...
  freq = param( 550 )
  mode = param( 0 )
  Q    = param( .5 )
  
  input = peek( amen, accum( 1, 0, 0, amen.length ), 'none', 'samples' )
 
  kwd = mul( Math.PI * 2, freq )
  kwa = mul( div(2,iT), tan( mul( kwd, div(iT,2) ) ) ).memo()
  kG  = mul( kwa, div(iT,2) ).memo()
  kR  = div( 1, mul( 2, Q ) ).memo()
 
  hp = div( 
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
  ).memo()
  
  bp = add( mul( kG, hp ), z1.out ).memo()
  lp = add( mul( kG, bp ), z2.out ).memo()
  notch = sub( input, mul( mul( 2, kR), bp )).memo()
 
  z1.in( add( mul( kG, hp ), bp ) )
  z2.in( add( mul( kG, bp ), lp ) )
  
  outSignal = lp
  
  play( outSignal ) 
})

// play with values...
freq.value = 1050 // (80-20000)
Q.value = 5 // (.5-20, CAREFUL)


