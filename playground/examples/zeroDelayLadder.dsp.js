d = data( './resources/audiofiles/amen.wav' ).then( ()=> {
  'use jsdsp'
 
  iT = 1/gen.samplerate
  z1 = ssd(0)
  z2 = ssd(0)
  z3 = ssd(0)
  z4 = ssd(0)
 
  Q  = param('Q', .5 )
  freq = param('frequency', 880 )
  input = peek( d, accum( 1, 0, { min: 0, max:d.dim }), { mode:'samples' } )
 
  // kwd = 2 * $M_PI * acf[kindx]
  kwd = memo( (Math.PI * 2) * slide( freq,512,512 ) )
 
  // kwa = (2/iT) * tan(kwd * iT/2) 
  kwa = memo( (2/iT) * tan( kwd * (iT/2) ) )
 
  // kG  = kwa * iT/2 
  kg = memo( kwa * (iT/2) )
 
  // kk = 4.0*(kQ - 0.5)/(25.0 - 0.5)
  kk = memo( 4 * ( slide( Q,512,512 ) - .5) / 24.5 )
 
  // kg_plus_1 = (1.0 + kg)
  kg_plus_1 = 1 + kg
 
  // kG = kg / kg_plus_1 
  kG = memo( kg / kg_plus_1 )
  kG_2 = memo( kG * kG )
  kG_3 = kG_2 * kG
  kGAMMA = kG_2 * kG_2
 
  kS1 = z1.out / kg_plus_1
  kS2 = z2.out / kg_plus_1
  kS3 = z3.out / kg_plus_1
  kS4 = z4.out / kg_plus_1
 
  //kS = kG_3 * kS1  + kG_2 * kS2 + kG * kS3 + kS4 
  kS = memo( 
    ( (kG_3 * kS1) + ( kG_2 * kS2) ) +
      ( (kG * kS3) + kS4 )
  )
 
  //ku = (kin - kk *  kS) / (1 + kk * kGAMMA)
  ku1 = input - ( kk * kS )
  ku2 = memo( 1 + ( kk * kGAMMA ) )
  ku = memo( ku1 / ku2 )
 
  kv = memo( ( ku - z1.out ) * kG )
  klp = memo( kv + z1.out )
  z1.in( klp + kv  )
 
  kv = memo( ( klp - z2.out ) * kG )
  klp = memo(  kv + z2.out )
  z2.in( klp + kv )
 
  kv = memo( ( klp - z3.out ) * kG  )
  klp = memo( kv + z3.out )
  z3.in( klp + kv )
 
  kv = memo( ( klp - z4.out ) * kG  )
  klp = memo( kv + z4.out )
  z4.in( klp + kv )
 
  cb = play( klp )
  gui = new dat.GUI({ width: 400 }) 
  gui.add( cb, 'frequency', 80, 15000 )
  gui.add( cb, 'Q', .5, 23 )
 
})
