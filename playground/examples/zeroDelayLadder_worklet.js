d = data( './resources/audiofiles/amen.wav' ).then( ()=> {

iT = 1/gen.samplerate
z1 = ssd(0)
z2 = ssd(0)
z3 = ssd(0)
z4 = ssd(0)

Q  = param('Q', .5, .5, 23 )
freq = param('frequency', 880, 80, 15000 )
input = peek( d, accum( 1, 0, { min: 0, max:d.dim }), { mode:'samples' } )

// kwd = 2 * $M_PI * acf[kindx]
kwd = memo( mul( Math.PI * 2, slide(freq,512,512) ) )

// kwa = (2/iT) * tan(kwd * iT/2) 
kwa = memo( mul( 2/iT, tan( mul( kwd, iT/2 ) ) ) )

// kG  = kwa * iT/2 
kg = memo( mul( kwa, iT/2 ) )

// kk = 4.0*(kQ - 0.5)/(25.0 - 0.5)
kk = memo( mul( 4, div( sub( slide(Q,512,512), .5), 24.5 ) ) )

// kg_plus_1 = (1.0 + kg)
kg_plus_1 = add( 1, kg )

// kG = kg / kg_plus_1 
kG = memo( div( kg, kg_plus_1 ) )
kG_2 = memo( mul( kG, kG ) )
kG_3 = mul( kG_2, kG )
kGAMMA = mul( kG_2, kG_2 )

kS1 = div( z1.out, kg_plus_1 )
kS2 = div( z2.out, kg_plus_1 )
kS3 = div( z3.out, kg_plus_1 )
kS4 = div( z4.out, kg_plus_1 )

//kS = kG_3 * kS1  + kG_2 * kS2 + kG * kS3 + kS4 
kS = memo( 
  add(
    add( mul(kG_3, kS1), mul( kG_2, kS2) ),
    add( mul(kG, kS3), kS4 )
  )
)

//ku = (kin - kk *  kS) / (1 + kk * kGAMMA)
ku1 = sub( input, mul( kk, kS ) )
ku2 = memo( add( 1, mul( kk, kGAMMA ) ) )
ku = memo( div( ku1, ku2 ) )

kv = memo( mul( sub( ku, z1.out ), kG ) )
klp = memo( add( kv, z1.out ) )
z1.in( add( klp, kv ) )

kv = memo( mul( sub( klp, z2.out ), kG ) )
klp = memo( add( kv, z2.out ) )
z2.in( add( klp, kv ) )

kv = memo( mul( sub( klp, z3.out ), kG ) )
klp = memo( add( kv, z3.out ) )
z3.in( add( klp, kv ) )

kv = memo( mul( sub( klp, z4.out ), kG ) )
klp = memo( add( kv, z4.out ) )
z4.in( add( klp, kv ) )

play( klp ).then( node => {
  gui = new dat.GUI({ width: 400 })
  gui.add( node, 'frequency', 80, 15000 )
  gui.add( node, 'Q', .5, 23 )
})

})
