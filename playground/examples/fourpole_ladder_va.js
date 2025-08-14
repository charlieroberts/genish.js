data( './resources/audiofiles/amen.wav' ).then( amen => {
  iT = div(1,samplerate()).memo()
  // four poles...
  z1 = ssd(0)
  z2 = ssd(0)
  z3 = ssd(0)
  z4 = ssd(0)
 
  Q  = param(.5)
  freq = param(880)
  input = peek( amen, accum( 1, 0, 0, amen.length), 'linear', 'samples' )
 
  // kwd = 2 * $M_PI * acf[kindx]
  kwd = mul( Math.PI * 2, slide(freq,512,512) ).memo()
 
  // kwa = (2/iT) * tan(kwd * iT/2) 
  kwa = mul( div(2,iT), tan( mul( kwd, div(iT,2) ) ) ).memo()
 
  // kG  = kwa * iT/2 
  kg = mul( kwa, div(iT,2) ).memo()
 
  // kk = 4.0*(kQ - 0.5)/(25.0 - 0.5)
  kk = mul( 4, div( sub( slide(Q,512,512), .5), 24.5 ) ).memo()
 
  // kg_plus_1 = (1.0 + kg)
  kg_plus_1 = add( 1, kg )
 
  // kG = kg / kg_plus_1 
  kG = div( kg, kg_plus_1 ).memo()
  kG_2 = mul( kG, kG ).memo()
  kG_3 = mul( kG_2, kG )
  kGAMMA = mul( kG_2, kG_2 )
 
  kS1 = div( z1.out, kg_plus_1 )
  kS2 = div( z2.out, kg_plus_1 )
  kS3 = div( z3.out, kg_plus_1 )
  kS4 = div( z4.out, kg_plus_1 )
 
  //kS = kG_3 * kS1  + kG_2 * kS2 + kG * kS3 + kS4 
  kS = add(
    add( mul(kG_3, kS1), mul( kG_2, kS2) ),
    add( mul(kG, kS3), kS4 )
  ).memo()
 
  //ku = (kin - kk *  kS) / (1 + kk * kGAMMA)
  ku1 = sub( input, mul( kk, kS ) )
  ku2 = add( 1, mul( kk, kGAMMA ) ).memo()
  ku = div( ku1, ku2 ).memo()
 
  kv = mul( sub( ku, z1.out ), kG ).memo()
  klp = add( kv, z1.out ).memo()
  z1.in( add( klp, kv ) )
 
  kv = mul( sub( klp, z2.out ), kG ).memo()
  klp = add( kv, z2.out ).memo()
  z2.in( add( klp, kv ) )
 
  kv = mul( sub( klp, z3.out ), kG ).memo()
  klp = add( kv, z3.out ).memo()
  z3.in( add( klp, kv ) )
 
  kv = mul( sub( klp, z4.out ), kG ).memo()
  klp = add( kv, z4.out ).memo()
  z4.in( add( klp, kv ) )
 
  play( klp )
})

// play with values
freq.value = 2500
Q.value = 8 //(.5-12ish can blow up)
